"use client";

import { useCallback, memo } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type Tool = Tables<"tools"> & { categories?: { name: string } | null };

function ToolCardComponent({
  tool,
  index,
  showDescription = false,
}: {
  tool: Tool;
  index: number;
  showDescription?: boolean;
}) {
  const handleClick = useCallback(() => {
    if (!tool?.id) return;
    // Fire-and-forget; we do not await before navigation.
    (supabase as any)
      .rpc("increment_tool_clicks", { p_id: tool.id })
      .then(({ error }: any) => {
        if (error && process.env.NODE_ENV !== "production") {
          console.error("Error incrementing tool clicks:", error);
        }
      });
  }, [tool?.id]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: Math.min(index * 0.04, 0.4),
        duration: 0.32,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="h-full"
    >
      <a
        href={tool.url || "#"}
        target={tool.url ? "_blank" : undefined}
        rel={tool.url ? "noopener noreferrer" : undefined}
        onClick={handleClick}
        aria-label={
          tool.short_description
            ? `${tool.title}: ${tool.short_description}`
            : tool.title || "Open tool"
        }
        className={`group relative flex h-full flex-col items-center justify-start gap-2 p-4 text-center glass-card-static gradient-border rounded-2xl hover:shadow-xl hover:-translate-y-1 hover:border-primary/30 active:scale-[0.98] transition-[transform,box-shadow,border-color] duration-fast ease-out motion-reduce:hover:translate-y-0 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
          showDescription ? "aspect-auto" : "aspect-square"
        }`}
      >
        <div className="flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 flex-none rounded-2xl bg-gradient-to-br from-primary/15 to-secondary/10 ring-1 ring-primary/15 text-primary mb-1 transition-transform duration-base ease-out group-hover:scale-105">
          {tool.image_url ? (
            <img
              src={tool.image_url}
              alt=""
              aria-hidden="true"
              className="w-10 h-10 sm:w-12 sm:h-12 object-contain"
              loading="lazy"
            />
          ) : (
            <span className="font-bold text-lg font-display" aria-hidden="true">
              {tool.title?.[0] || "?"}
            </span>
          )}
        </div>
        <h3 className="text-sm sm:text-base font-semibold text-foreground line-clamp-2 leading-tight group-hover:text-primary transition-colors">
          {tool.title}
        </h3>
        {showDescription && tool.short_description && (
          <p className="text-xs text-muted-foreground line-clamp-2 leading-snug">
            {tool.short_description}
          </p>
        )}
      </a>
    </motion.div>
  );
}

const areEqual = (
  prev: { tool: Tool; index: number; showDescription?: boolean },
  next: { tool: Tool; index: number; showDescription?: boolean },
) =>
  prev.tool.id === next.tool.id &&
  prev.tool.title === next.tool.title &&
  prev.tool.image_url === next.tool.image_url &&
  prev.tool.url === next.tool.url &&
  prev.tool.short_description === next.tool.short_description &&
  prev.tool.clicks === next.tool.clicks &&
  prev.index === next.index &&
  prev.showDescription === next.showDescription;

const ToolCard = memo(ToolCardComponent, areEqual);
export default ToolCard;
