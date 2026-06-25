/**
 * remarkAutolink — a custom remark (mdast) plugin.
 *
 * Scans plain text inside paragraphs, table cells, and list items and converts
 * bare URLs, government / public domains, and email addresses into clickable
 * markdown links — WITHOUT touching:
 *   • fenced code blocks (```…```)
 *   • inline code (`…`)
 *   • existing links/images
 *   • link/image/anchor text that already wraps the match
 *
 * Why a remark plugin (instead of a regex on the raw string)?
 *   Operating on the AST guarantees we never autolink inside code spans or
 *   inside existing links, and it keeps the change local to the rendering
 *   pipeline (storage stays untouched).
 *
 * The plugin is intentionally conservative: only well-formed URLs, a curated
 * set of bare domains (incl. multi-level gov domains such as
 * `socialregistry.wb.gov.in`), and RFC-5322-ish emails are linked. Every other
 * line of text is left exactly as-is, so we never turn arbitrary lines into
 * links.
 */

import { visit, SKIP } from "unist-util-visit";
import type { Root, Text, Link, Parent } from "mdast";

/* ------------------------------------------------------------------ *
 * Pattern building blocks
 * ------------------------------------------------------------------ */

// A single label segment of a domain (e.g. "socialregistry", "wb", "gov").
const LABEL = "[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?";

// Public TLDs we are willing to autolink when written as a bare domain.
// Includes common ccTLDs and the multi-part suffixes used by Indian
// government sites (gov.in, nic.in, ac.in, …) so domains like
// `socialregistry.wb.gov.in` and `india.gov.in` link correctly.
const PUBLIC_TLDS = [
  "gov.in",
  "nic.in",
  "ac.in",
  "edu.in",
  "org.in",
  "co.in",
  "com",
  "org",
  "net",
  "io",
  "in",
  "gov",
  "edu",
  "ai",
  "app",
  "dev",
  "info",
  "me",
  "us",
  "uk",
  "au",
  "ca",
  "de",
  "fr",
  "eu",
];

// Sort longer suffixes first so "gov.in" wins over "in" during matching.
const TLD_ALTERNATIVES = [...PUBLIC_TLDS]
  .sort((a, b) => b.length - a.length)
  .map((t) => t.replace(/\./g, "\\."));

// A bare domain: labels separated by dots, ending in a known public TLD.
// We require at least one label before the TLD (e.g. "wb.gov.in").
const DOMAIN_RE = new RegExp(
  `(?:${LABEL}\\.)+(?:${TLD_ALTERNATIVES.join("|")})`,
  "i",
);

// A full URL with an explicit scheme. The body is matched greedily, then the
// final character must not be sentence punctuation — this excludes a trailing
// period/comma/etc. without splitting the URL mid-way (a lazy quantifier here
// would wrongly truncate "https://india.gov.in" into "https://in").
const URL_RE =
  /(?:https?:\/\/)[^\s()<>\[\]"]*[^\s()<>\[\]".,;:!?]/i;

// An email address.
const EMAIL_RE =
  /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}/i;

// Master scanner: find the earliest non-overlapping match of any kind.
// Order matters — URLs first (so the scheme isn't mis-parsed as a domain),
// then emails, then bare domains.
const SCANNER = new RegExp(
  `(${URL_RE.source})|(${EMAIL_RE.source})|(${DOMAIN_RE.source})`,
  "gi",
);

/* ------------------------------------------------------------------ *
 * Helpers
 * ------------------------------------------------------------------ */

function buildLink(url: string, text: string): Link {
  return {
    type: "link",
    url,
    title: null,
    children: [{ type: "text", value: text }],
  };
}

function normalizeHref(raw: string): string {
  // Already a full URL.
  if (/^https?:\/\//i.test(raw)) return raw;
  // Email → mailto:
  if (raw.includes("@")) return `mailto:${raw}`;
  // Bare domain → https://
  return `https://${raw}`;
}

/**
 * Split a single text node into an array of nodes (text | link) based on
 * the master scanner. Returns null when nothing matched (so the caller can
 * leave the original node untouched).
 */
function splitTextNode(node: Text): Array<Text | Link> | null {
  const value = node.value;
  if (!value) return null;

  const result: Array<Text | Link> = [];
  let lastIndex = 0;
  let matched = false;

  SCANNER.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = SCANNER.exec(value)) !== null) {
    const [full, urlPart, emailPart, domainPart] = m;
    const start = m.index;
    const end = start + full.length;

    // Push any preceding plain text.
    if (start > lastIndex) {
      result.push({
        type: "text",
        value: value.slice(lastIndex, start),
      });
    }

    const raw = urlPart || emailPart || domainPart;
    const href = normalizeHref(raw);
    result.push(buildLink(href, raw));
    matched = true;
    lastIndex = end;
  }

  if (!matched) return null;

  // Trailing plain text.
  if (lastIndex < value.length) {
    result.push({ type: "text", value: value.slice(lastIndex) });
  }

  return result;
}

/**
 * Parent node types whose text content must NOT be autolinked. Text inside
 * these is either code (must stay literal) or already part of a link/image.
 * (TypeScript narrows `text` parents, so we compare as plain strings.)
 */
const SKIP_PARENT_TYPES = new Set<string>([
  "link",
  "linkReference",
  "image",
  "imageReference",
  "inlineCode",
  "code",
]);

/* ------------------------------------------------------------------ *
 * Plugin
 * ------------------------------------------------------------------ */

/**
 * remark plugin that autolinks URLs, bare domains, and emails in text nodes.
 *
 * It only processes `text` nodes and skips any that live inside code spans or
 * existing links/images — the AST structure itself keeps code blocks safe.
 */
export default function remarkAutolink() {
  return (tree: Root) => {
    visit(tree, "text", (node, index, parent) => {
      if (!parent || index == null) return;

      // Skip text that lives inside code-ish or already-linked contexts.
      if (SKIP_PARENT_TYPES.has(parent.type)) return;

      const replacement = splitTextNode(node as Text);
      if (replacement && replacement.length > 0) {
        (parent as Parent).children.splice(index, 1, ...replacement);
        // Continue visiting after the newly inserted nodes; SKIP prevents
        // re-descending into the link nodes we just created.
        return [SKIP, index + replacement.length] as const;
      }
    });
  };
}
