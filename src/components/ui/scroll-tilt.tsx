"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { cn } from "@/lib/utils";

type Props = {
  children: React.ReactNode;
  className?: string;
};

// Shows its content tilted back, and straightens it as the page scrolls it up the viewport.
// Adapted from Aceternity UI's Container Scroll Animation
// (https://ui.aceternity.com/components/container-scroll-animation).
export function ScrollTilt({ children, className }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  // 0 when the top edge enters at the bottom of the viewport, 1 once it's a quarter from the top.
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "start 0.25"] });
  const rotateX = useTransform(scrollYProgress, [0, 1], [20, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.94, 1]);

  return (
    <div ref={ref} className={cn("perspective-[1200px]", className)}>
      <motion.div style={reduceMotion ? undefined : { rotateX, scale, transformOrigin: "50% 0%" }}>
        {children}
      </motion.div>
    </div>
  );
}
