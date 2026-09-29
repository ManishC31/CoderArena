import Link from "next/link";
import { Braces } from "lucide-react";

type Props = {
  href?: string;
  // Just the mark, for tight toolbars; the name becomes its accessible label.
  iconOnly?: boolean;
};

export function Logo({ href = "/", iconOnly = false }: Props) {
  return (
    <Link
      href={href}
      aria-label={iconOnly ? "CoderArena" : undefined}
      className="flex shrink-0 items-center gap-2 rounded-md font-semibold tracking-tight outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <span className="flex size-7 items-center justify-center rounded-md bg-linear-to-br from-orange-500 to-orange-600 text-white">
        <Braces className="size-4" />
      </span>
      {!iconOnly && "CoderArena"}
    </Link>
  );
}
