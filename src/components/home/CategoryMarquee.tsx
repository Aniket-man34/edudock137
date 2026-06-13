"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSiteSearch } from "@/components/layout/SearchProvider";

interface Category {
  id: string;
  name: string;
}

interface CategoryMarqueeProps {
  categories: Category[];
  className?: string;
  /** px per second the auto-scroll moves right→left */
  speed?: number;
}

const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export default function CategoryMarquee({
  categories,
  className = "",
  speed = 32,
}: CategoryMarqueeProps) {
  const { setActiveCategory, activeCategoryId } = useSiteSearch();
  const router = useRouter();
  const pathname = usePathname();

  const scrollerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const lastTickRef = useRef<number>(0);

  // Half the track width — the looping wrap point.
  const halfWidthRef = useRef(0);

  // Pause auto-scroll while the user is touching/hovering/dragging.
  const isPausedRef = useRef(false);
  // Suppress click on the chip we just dragged from.
  const draggedRef = useRef(false);

  // For pointer drag.
  const pointerActiveRef = useRef(false);
  const pointerStartXRef = useRef(0);
  const startScrollLeftRef = useRef(0);

  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduceMotion(mq.matches);
    apply();
    mq.addEventListener?.("change", apply);
    return () => mq.removeEventListener?.("change", apply);
  }, []);

  // Measure the duplicated-track half width so we can wrap seamlessly.
  useIsoLayoutEffect(() => {
    if (!trackRef.current) return;
    const measure = () => {
      if (!trackRef.current) return;
      halfWidthRef.current = trackRef.current.scrollWidth / 2;
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(trackRef.current);
    return () => ro.disconnect();
  }, [categories.length]);

  // Auto-scroll loop.
  useEffect(() => {
    if (reduceMotion || categories.length === 0) return;

    const tick = (now: number) => {
      const el = scrollerRef.current;
      const half = halfWidthRef.current;
      if (!el || half <= 0) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }
      if (lastTickRef.current === 0) lastTickRef.current = now;
      const dt = (now - lastTickRef.current) / 1000;
      lastTickRef.current = now;

      if (!isPausedRef.current) {
        const next = el.scrollLeft + speed * dt;
        // Seamless wrap: when we cross the half-width, jump back by it.
        el.scrollLeft = next >= half ? next - half : next;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      lastTickRef.current = 0;
    };
  }, [reduceMotion, speed, categories.length]);

  // Wrap on manual scroll too (touch swipe, wheel, trackpad).
  const handleScroll = useCallback(() => {
    const el = scrollerRef.current;
    const half = halfWidthRef.current;
    if (!el || half <= 0) return;
    if (el.scrollLeft >= half) el.scrollLeft -= half;
    else if (el.scrollLeft <= 0) el.scrollLeft += half;
  }, []);

  const pause = useCallback(() => {
    isPausedRef.current = true;
  }, []);
  const resume = useCallback(() => {
    isPausedRef.current = false;
  }, []);

  // ── Pointer drag (mouse + pen). Touch falls through to native overflow scroll. ──
  const onPointerDown = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "touch") return; // let native scroll handle it
    const el = scrollerRef.current;
    if (!el) return;
    pointerActiveRef.current = true;
    draggedRef.current = false;
    pointerStartXRef.current = e.clientX;
    startScrollLeftRef.current = el.scrollLeft;
    isPausedRef.current = true;
    el.setPointerCapture?.(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
    if (!pointerActiveRef.current) return;
    const el = scrollerRef.current;
    if (!el) return;
    const dx = e.clientX - pointerStartXRef.current;
    if (Math.abs(dx) > 4) draggedRef.current = true;
    el.scrollLeft = startScrollLeftRef.current - dx;
  }, []);

  const endPointer = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (!pointerActiveRef.current) return;
      pointerActiveRef.current = false;
      const el = scrollerRef.current;
      el?.releasePointerCapture?.(e.pointerId);
      // Resume auto-scroll only if the cursor isn't still hovering.
      if (e.type === "pointerup" || e.type === "pointercancel") {
        // pointerleave will set its own state; for up/cancel inside, keep paused if hovered.
        // Simpler heuristic: resume immediately on touch/pen, leave hover to onMouseLeave.
        if (e.pointerType !== "mouse") isPausedRef.current = false;
      }
    },
    [],
  );

  if (!categories.length) return null;

  // Duplicate the list so the seamless half-width wrap has identical neighbors.
  const track = [...categories, ...categories];

  return (
    <div
      className={`relative ${className}`}
      style={{
        maskImage:
          "linear-gradient(to right, transparent, #000 6%, #000 94%, transparent)",
        WebkitMaskImage:
          "linear-gradient(to right, transparent, #000 6%, #000 94%, transparent)",
      }}
    >
      <div className="flex items-center gap-3">
        <span
          className="text-xs text-muted-foreground shrink-0 pl-1"
          aria-hidden="true"
        >
          Preparing for:
        </span>

        <div
          ref={scrollerRef}
          role="region"
          aria-label="Browse categories"
          onScroll={handleScroll}
          onMouseEnter={pause}
          onMouseLeave={resume}
          onTouchStart={pause}
          onTouchEnd={resume}
          onTouchCancel={resume}
          onFocus={pause}
          onBlur={resume}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endPointer}
          onPointerCancel={endPointer}
          className="flex-1 overflow-x-auto overflow-y-hidden scrollbar-hide scroll-smooth touch-pan-x select-none cursor-grab active:cursor-grabbing"
          style={{
            WebkitOverflowScrolling: "touch",
            overscrollBehaviorX: "contain",
          }}
        >
          <div
            ref={trackRef}
            className="flex gap-2 w-max py-1"
            // Prevent native image-drag interference on the chips
            onDragStart={(e) => e.preventDefault()}
          >
            {track.map((cat, i) => {
              const isClone = i >= categories.length;
              const isActive = activeCategoryId === cat.id;
              return (
                <button
                  key={`${cat.id}-${i}`}
                  type="button"
                  onClick={(e) => {
                    if (draggedRef.current) {
                      e.preventDefault();
                      draggedRef.current = false;
                      return;
                    }
                    setActiveCategory(cat.id, cat.name);
                    if (pathname !== "/updates") router.push("/updates");
                  }}
                  aria-label={`Filter by ${cat.name}`}
                  aria-hidden={isClone ? "true" : undefined}
                  aria-pressed={!isClone ? isActive : undefined}
                  tabIndex={isClone ? -1 : 0}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors duration-fast ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background whitespace-nowrap shrink-0 ${
                    isActive
                      ? "border-primary/60 bg-primary/10 text-primary"
                      : "border-border/60 bg-card hover:border-primary/30 hover:text-primary"
                  }`}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
