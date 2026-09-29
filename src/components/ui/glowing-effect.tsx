"use client";

import { memo, useCallback, useEffect, useRef } from "react";
import { animate, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

// A border glow that turns to follow the pointer as it moves near a card. Adapted from Aceternity
// UI's Glowing Effect (https://ui.aceternity.com/components/glowing-effect), recolored to the brand
// accent. Put it inside a `relative` element with rounded corners; it draws over that element's border.

// Orange, amber and rose around the brand accent.
const gradient = `repeating-conic-gradient(from 236.84deg at 50% 50%,
  var(--brand) 0%, #fbbf24 5%, #fb7185 10%, #fbbf24 15%, var(--brand) 20%)`;

type Props = {
  // Degrees of border lit on each side of the pointer's direction.
  spread?: number;
  // How far outside the element, in px, the pointer still lights it.
  proximity?: number;
  // Share of the element's middle where the glow turns off.
  inactiveZone?: number;
  borderWidth?: number;
  className?: string;
};

export const GlowingEffect = memo(function GlowingEffect({
  spread = 40,
  proximity = 48,
  inactiveZone = 0.01,
  borderWidth = 1,
  className,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const lastPointer = useRef({ x: 0, y: 0 });
  const frame = useRef(0);
  const reduceMotion = useReducedMotion();

  // Called on pointer moves, and without a pointer on scroll (the element moves instead).
  const update = useCallback(
    (pointer?: { x: number; y: number }) => {
      cancelAnimationFrame(frame.current);
      frame.current = requestAnimationFrame(() => {
        const element = ref.current;
        if (!element) return;
        if (pointer) lastPointer.current = pointer;
        const { x, y } = lastPointer.current;
        const { left, top, width, height } = element.getBoundingClientRect();
        const centerX = left + width / 2;
        const centerY = top + height / 2;

        const inMiddle = Math.hypot(x - centerX, y - centerY) < 0.5 * Math.min(width, height) * inactiveZone;
        const near =
          x > left - proximity && x < left + width + proximity && y > top - proximity && y < top + height + proximity;
        const active = near && !inMiddle;
        element.style.setProperty("--active", active ? "1" : "0");
        if (!active) return;

        // Turn the lit arc toward the pointer, the short way round.
        const current = parseFloat(element.style.getPropertyValue("--start")) || 0;
        const target = (180 * Math.atan2(y - centerY, x - centerX)) / Math.PI + 90;
        const difference = ((target - current + 180) % 360) - 180;
        animate(current, current + difference, {
          duration: 2,
          ease: [0.16, 1, 0.3, 1],
          onUpdate: (value) => element.style.setProperty("--start", String(value)),
        });
      });
    },
    [inactiveZone, proximity],
  );

  useEffect(() => {
    if (reduceMotion) return;
    const handleScroll = () => update();
    const handlePointerMove = (event: PointerEvent) => update({ x: event.clientX, y: event.clientY });
    window.addEventListener("scroll", handleScroll, { passive: true });
    document.body.addEventListener("pointermove", handlePointerMove, { passive: true });
    return () => {
      cancelAnimationFrame(frame.current);
      window.removeEventListener("scroll", handleScroll);
      document.body.removeEventListener("pointermove", handlePointerMove);
    };
  }, [update, reduceMotion]);

  if (reduceMotion) return null;

  return (
    <div
      ref={ref}
      aria-hidden
      style={
        {
          "--spread": spread,
          "--start": "0",
          "--active": "0",
          "--border-width": `${borderWidth}px`,
          "--gradient": gradient,
        } as React.CSSProperties
      }
      className={cn("pointer-events-none absolute inset-0 rounded-[inherit]", className)}
    >
      {/* The border ring is the gradient masked to a conic arc centered on --start. */}
      <div
        className={cn(
          "rounded-[inherit]",
          'after:absolute after:inset-[calc(-1*var(--border-width))] after:rounded-[inherit] after:content-[""]',
          "after:[border:var(--border-width)_solid_transparent]",
          "after:[background:var(--gradient)] after:[background-attachment:fixed]",
          "after:opacity-(--active) after:transition-opacity after:duration-300",
          "after:[mask-clip:padding-box,border-box] after:[mask-composite:intersect]",
          "after:[mask-image:linear-gradient(#0000,#0000),conic-gradient(from_calc((var(--start)-var(--spread))*1deg),#00000000_0deg,#fff,#00000000_calc(var(--spread)*2deg))]",
        )}
      />
    </div>
  );
});
