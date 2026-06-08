"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "edudock:bookmarks:v1";
const EVT = "edudock:bookmarks:changed";

export type BookmarkKind = "tool" | "pdf" | "update";

export interface Bookmark {
  id: string;
  kind: BookmarkKind;
  title: string;
  href: string;
  image?: string | null;
  addedAt: number;
}

function readAll(): Bookmark[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Bookmark[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (b): b is Bookmark =>
        !!b &&
        typeof b.id === "string" &&
        typeof b.title === "string" &&
        typeof b.href === "string" &&
        (b.kind === "tool" || b.kind === "pdf" || b.kind === "update"),
    );
  } catch {
    return [];
  }
}

function writeAll(items: Bookmark[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent(EVT));
}

function key(kind: BookmarkKind, id: string) {
  return `${kind}:${id}`;
}

export function useBookmarks() {
  const [items, setItems] = useState<Bookmark[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setItems(readAll());
    setHydrated(true);

    const onChange = () => setItems(readAll());
    window.addEventListener(EVT, onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener(EVT, onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  const has = useCallback(
    (kind: BookmarkKind, id: string) => {
      return items.some((b) => key(b.kind, b.id) === key(kind, id));
    },
    [items],
  );

  const add = useCallback((bookmark: Omit<Bookmark, "addedAt">) => {
    const all = readAll();
    if (all.some((b) => key(b.kind, b.id) === key(bookmark.kind, bookmark.id))) {
      return;
    }
    writeAll([{ ...bookmark, addedAt: Date.now() }, ...all]);
  }, []);

  const remove = useCallback((kind: BookmarkKind, id: string) => {
    writeAll(readAll().filter((b) => key(b.kind, b.id) !== key(kind, id)));
  }, []);

  const toggle = useCallback(
    (bookmark: Omit<Bookmark, "addedAt">) => {
      if (has(bookmark.kind, bookmark.id)) {
        remove(bookmark.kind, bookmark.id);
        return false;
      }
      add(bookmark);
      return true;
    },
    [add, has, remove],
  );

  const clear = useCallback(() => writeAll([]), []);

  return { items, hydrated, has, add, remove, toggle, clear };
}
