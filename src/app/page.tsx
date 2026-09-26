import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
      <h1 className="text-3xl font-bold tracking-tight">CodeArena</h1>
      <p className="text-muted-foreground">Next.js + Tailwind CSS + shadcn/ui</p>
      <div className="flex gap-2">
        <Button>Get started</Button>
        <Button variant="outline">Learn more</Button>
      </div>
    </main>
  );
}
