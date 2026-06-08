"use client";

import { type Variants } from "framer-motion";

export const DUR = {
  fast: 0.15,
  base: 0.28,
  slow: 0.48,
} as const;

export const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];
export const EASE_IN_OUT: [number, number, number, number] = [0.65, 0, 0.35, 1];

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: DUR.base, ease: EASE_OUT },
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: DUR.base, ease: EASE_OUT } },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { duration: DUR.base, ease: EASE_OUT },
  },
};

export const stagger = (g = 0.04): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: g } },
});

export const SPRING = { type: "spring" as const, stiffness: 420, damping: 32, mass: 0.9 };
