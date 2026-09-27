import { Logo } from "@/components/logo";

// Shared layout for /login and /signup (the (auth) group doesn't appear in the URL).
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 bg-muted/40 px-4 py-12">
      <Logo />
      <div className="w-full max-w-sm">{children}</div>
    </main>
  );
}
