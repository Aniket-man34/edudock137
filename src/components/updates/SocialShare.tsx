import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link2, Check, Share2 } from 'lucide-react';
import { toast } from 'sonner';

interface SocialShareProps {
  title: string;
  url?: string;
  className?: string;
}

export default function SocialShare({ title, url, className = '' }: SocialShareProps) {
  const [copied, setCopied] = useState(false);
  const shareUrl = url || window.location.href;
  const encodedTitle = encodeURIComponent(title);
  const encodedUrl = encodeURIComponent(shareUrl);

  const supportsNativeShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      textArea.style.position = 'fixed';
      textArea.style.left = '-9999px';
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        toast.success('Link copied to clipboard!');
        setTimeout(() => setCopied(false), 2000);
      } catch {
        toast.error('Failed to copy link');
      }
      document.body.removeChild(textArea);
    }
  }, [shareUrl]);

  const handleNativeShare = useCallback(async () => {
    try {
      await navigator.share({
        title,
        url: shareUrl,
      });
    } catch (err) {
      // User cancelled or share failed — silent fail
      if ((err as DOMException).name !== 'AbortError') {
        console.error('Share failed:', err);
      }
    }
  }, [title, shareUrl]);

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
        Share this update
      </p>

      <div className="flex flex-wrap items-center gap-3">
        {/* WhatsApp */}
        <a
          href={`https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Share on WhatsApp"
          className="group relative inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366] hover:text-white border border-[#25D366]/20 hover:border-[#25D366] transition-all duration-200 font-medium text-sm"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current shrink-0" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.001 5.45-4.436 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
          </svg>
          <span className="hidden sm:inline">WhatsApp</span>
        </a>

        {/* Telegram */}
        <a
          href={`https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Share on Telegram"
          className="group relative inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#0088cc]/10 text-[#0088cc] hover:bg-[#0088cc] hover:text-white border border-[#0088cc]/20 hover:border-[#0088cc] transition-all duration-200 font-medium text-sm"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current shrink-0">
            <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
          </svg>
          <span className="hidden sm:inline">Telegram</span>
        </a>

        {/* X / Twitter */}
        <a
          href={`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Share on X (Twitter)"
          className="group relative inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-foreground/5 text-foreground hover:bg-[#000000] hover:text-white dark:hover:bg-white dark:hover:text-black border border-foreground/10 hover:border-foreground/30 transition-all duration-200 font-medium text-sm"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current shrink-0">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
          <span className="hidden sm:inline">X</span>
        </a>

        {/* Copy Link */}
        <button
          onClick={handleCopyLink}
          aria-label="Copy link"
          className="group relative inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-muted/60 text-foreground hover:bg-muted border border-border/50 transition-all duration-200 font-medium text-sm"
        >
          <AnimatePresence mode="wait">
            {copied ? (
              <motion.span
                key="check"
                initial={{ scale: 0, rotate: -90 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 90 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-2"
              >
                <Check className="w-4 h-4 text-green-500" />
                <span className="hidden sm:inline text-green-600 dark:text-green-400">Copied!</span>
              </motion.span>
            ) : (
              <motion.span
                key="link"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2"
              >
                <Link2 className="w-4 h-4" />
                <span className="hidden sm:inline">Copy Link</span>
              </motion.span>
            )}
          </AnimatePresence>
        </button>

        {/* Native Share (mobile only) */}
        {supportsNativeShare && (
          <button
            onClick={handleNativeShare}
            aria-label="Share via device"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 font-semibold text-sm shadow-sm"
          >
            <Share2 className="w-4 h-4" />
            Share
          </button>
        )}
      </div>
    </div>
  );
}
