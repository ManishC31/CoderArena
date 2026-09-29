import { terminal } from "@/components/landing/mockups/syntax";

// `npm run dev` in a Vite playground, as it appears in the terminal.
export function DevServerOutput() {
  return (
    <pre className="overflow-hidden px-3 font-mono text-[12px] leading-5">
      <span className={terminal.green}>➜</span> <span className={terminal.cyan}>/project</span> $ npm run dev
      {"\n\n  "}
      <span className={`font-bold ${terminal.green}`}>VITE</span>
      <span className={terminal.green}> v7.1.3</span>
      <span className="text-(--ws-muted)">{"  ready in "}</span>
      <span className="font-bold">412</span>
      <span className="text-(--ws-muted)"> ms</span>
      {"\n\n  "}
      <span className={terminal.green}>➜</span>
      {"  "}
      <span className="font-bold">Local</span>
      {":   "}
      <span className={terminal.cyan}>http://localhost:5173/</span>
      {"\n"}
      <span className="text-(--ws-muted)">{"  ➜  press h + enter to show help"}</span>
    </pre>
  );
}
