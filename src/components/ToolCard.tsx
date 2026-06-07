"use client";

import { useCallback, memo } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type Tool = Tables<"tools">;

function ToolCardComponent({ tool, index }: { tool: Tool; index: number }) {
  const handleClick = useCallback(() => {
    if (tool?.id) {
      (supabase as any)
        .from("tools")
        .update({ clicks: (tool.clicks || 0) + 1 })
        .eq("id", tool.id)
        .then(({ error }: any) => {
          if (error) console.error("Error updating clicks:", error);
        });
    }
  }, [tool?.id, tool?.clicks]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.04, 0.4), duration: 0.36 }}
      whileHover={{ y: -4 }}
      className="cursor-pointer"
    >
      <a
        href={tool.url || "#"}
        target={tool.url ? "_blank" : undefined}
        rel={tool.url ? "noopener noreferrer" : undefined}
        onClick={handleClick}
        className="flex flex-col items-center justify-center gap-2 p-3 text-center glass-card-static hover:shadow-xl hover:border-primary/30 active:scale-95 aspect-square transition-all"
      >
        <div className="flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 flex-none rounded-full bg-primary/10 text-primary mb-2">
          {tool.image_url ? (
            <img
              src={tool.image_url}
              alt={tool.title}
              className="w-12 h-12 sm:w-16 sm:h-16 object-contain"
            />
          ) : (
            <span className="font-bold text-lg">{tool.title?.[0] || "?"}</span>
          )}
        </div>
        <h3 className="text-sm sm:text-base font-semibold text-foreground line-clamp-2 leading-tight">
          {tool.title}
        </h3>
      </a>
    </motion.div>
  );
}

const areEqual = (
  prev: { tool: Tool; index: number },
  next: { tool: Tool; index: number }
) =>
  prev.tool.id === next.tool.id &&
  prev.tool.title === next.tool.title &&
  prev.tool.image_url === next.tool.image_url &&
  prev.tool.url === next.tool.url &&
  prev.tool.clicks === next.tool.clicks &&
  prev.index === next.index;

const ToolCard = memo(ToolCardComponent, areEqual);
export default ToolCard;
