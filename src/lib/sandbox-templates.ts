import {
  siAngular,
  siExpress,
  siHono,
  siNextdotjs,
  siReact,
  siTypescript,
  siVuedotjs,
  type SimpleIcon,
} from "simple-icons";
import type { PlaygroundTemplate } from "@/generated/prisma/enums";

export type SandboxTemplate = {
  // Stored in the playground table's `template` column.
  id: PlaygroundTemplate;
  name: string;
  description: string;
  category: "Frontend" | "Backend" | "Full-stack";
  icon: SimpleIcon;
  // Omitted for black logos so they follow the text color in dark mode.
  color?: string;
};

// Templates offered when creating a new playground.
export const sandboxTemplates: SandboxTemplate[] = [
  {
    id: "react",
    name: "React",
    description: "UI library for interactive web apps",
    category: "Frontend",
    icon: siReact,
    color: "#61DAFB",
  },
  {
    id: "nextjs",
    name: "Next.js",
    description: "Full-stack React framework",
    category: "Full-stack",
    icon: siNextdotjs,
  },
  {
    id: "vue",
    name: "Vue",
    description: "Approachable, progressive UI framework",
    category: "Frontend",
    icon: siVuedotjs,
    color: "#4FC08D",
  },
  {
    id: "angular",
    name: "Angular",
    description: "Batteries-included web framework",
    category: "Frontend",
    icon: siAngular,
  },
  {
    id: "typescript",
    name: "TypeScript",
    description: "Typed JavaScript, no framework",
    category: "Frontend",
    icon: siTypescript,
    color: "#3178C6",
  },
  {
    id: "express",
    name: "Express",
    description: "Minimal Node.js web server",
    category: "Backend",
    icon: siExpress,
  },
  {
    id: "hono",
    name: "Hono",
    description: "Fast, lightweight web framework",
    category: "Backend",
    icon: siHono,
    color: "#E36002",
  },
];
