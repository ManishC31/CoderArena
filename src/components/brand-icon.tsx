import type { SimpleIcon } from "simple-icons";
import { cn } from "@/lib/utils";

type Props = {
  icon: SimpleIcon;
  // Brand color. Leave it out for black logos (Next.js, GitHub, ...) so they
  // follow the text color and stay visible in dark mode.
  color?: string;
  className?: string;
};

// Brand logo from Simple Icons (https://simpleicons.org, CC0).
export function BrandIcon({ icon, color, className }: Props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={cn("size-5 shrink-0", className)}
      style={color ? { color } : undefined}
    >
      <path d={icon.path} />
    </svg>
  );
}
