import type { PlaygroundFile } from "@/components/playground/files";
import type { PlaygroundTemplate } from "@/generated/prisma/enums";

type TemplateFiles = {
  // File opened when the playground loads.
  entry: string;
  files: PlaygroundFile[];
};

const baseCss = `body {
  margin: 0;
  font-family: system-ui, sans-serif;
}

main {
  padding: 2rem;
}
`;

// Starter project for each template.
export const templateFiles: Record<PlaygroundTemplate, TemplateFiles> = {
  react: {
    entry: "src/App.jsx",
    files: [
      {
        path: "package.json",
        content: `{
  "name": "react-playground",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^19.1.0",
    "react-dom": "^19.1.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^5.0.0",
    "vite": "^7.0.0"
  }
}
`,
      },
      {
        path: "index.html",
        content: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>React playground</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
`,
      },
      {
        path: "vite.config.js",
        content: `import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
});
`,
      },
      {
        path: "src/main.jsx",
        content: `import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
`,
      },
      {
        path: "src/App.jsx",
        content: `import { useState } from "react";

export default function App() {
  const [count, setCount] = useState(0);

  return (
    <main>
      <h1>Hello from React</h1>
      <button onClick={() => setCount((c) => c + 1)}>Clicked {count} times</button>
    </main>
  );
}
`,
      },
      { path: "src/index.css", content: baseCss },
    ],
  },

  nextjs: {
    entry: "app/page.tsx",
    files: [
      {
        path: "package.json",
        content: `{
  "name": "nextjs-playground",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "next": "^16.0.0",
    "react": "^19.1.0",
    "react-dom": "^19.1.0"
  },
  "devDependencies": {
    "@types/node": "^22.0.0",
    "@types/react": "^19.1.0",
    "typescript": "^5.8.0"
  }
}
`,
      },
      {
        path: "app/layout.tsx",
        content: `import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Next.js playground",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
`,
      },
      {
        path: "next.config.ts",
        content: `import type { NextConfig } from "next";

// Settings the editor's preview needs; keep them, or the preview won't load.
const nextConfig: NextConfig = {
  // The preview serves the app under a sub-path, which the sandbox passes in.
  basePath: process.env.PREVIEW_BASE_PATH,
  experimental: {
    // This dev-only feature waits for a WebSocket the preview can't open, which stops the
    // page from becoming interactive.
    reactDebugChannel: false,
  },
};

export default nextConfig;
`,
      },
      {
        path: "app/page.tsx",
        content: `import { Counter } from "./counter";

export default function Page() {
  return (
    <main>
      <h1>Hello from Next.js</h1>
      <p>Edit app/page.tsx to get started.</p>
      <Counter />
    </main>
  );
}
`,
      },
      {
        path: "app/counter.tsx",
        content: `"use client";

import { useState } from "react";

export function Counter() {
  const [count, setCount] = useState(0);

  return <button onClick={() => setCount((c) => c + 1)}>Clicked {count} times</button>;
}
`,
      },
      { path: "app/globals.css", content: baseCss },
    ],
  },

  vue: {
    entry: "src/App.vue",
    files: [
      {
        path: "package.json",
        content: `{
  "name": "vue-playground",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "vue": "^3.5.0"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^6.0.0",
    "vite": "^7.0.0"
  }
}
`,
      },
      {
        path: "index.html",
        content: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Vue playground</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
`,
      },
      {
        path: "vite.config.js",
        content: `import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue()],
});
`,
      },
      {
        path: "src/main.js",
        content: `import { createApp } from "vue";
import App from "./App.vue";
import "./style.css";

createApp(App).mount("#app");
`,
      },
      {
        path: "src/App.vue",
        content: `<script setup>
import { ref } from "vue";

const count = ref(0);
</script>

<template>
  <main>
    <h1>Hello from Vue</h1>
    <button @click="count++">Clicked {{ count }} times</button>
  </main>
</template>
`,
      },
      { path: "src/style.css", content: baseCss },
    ],
  },

  typescript: {
    entry: "src/main.ts",
    files: [
      {
        path: "package.json",
        content: `{
  "name": "typescript-playground",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "devDependencies": {
    "typescript": "^5.8.0",
    "vite": "^7.0.0"
  }
}
`,
      },
      {
        path: "tsconfig.json",
        content: `{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "noEmit": true,
    "strict": true,
    "skipLibCheck": true
  },
  "include": ["src"]
}
`,
      },
      {
        path: "index.html",
        content: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>TypeScript playground</title>
  </head>
  <body>
    <main>
      <h1>Hello from TypeScript</h1>
      <button id="counter" type="button"></button>
    </main>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
`,
      },
      {
        path: "src/main.ts",
        content: `import { setupCounter } from "./counter.ts";
import "./style.css";

setupCounter(document.querySelector<HTMLButtonElement>("#counter")!);
`,
      },
      {
        path: "src/counter.ts",
        content: `export function setupCounter(button: HTMLButtonElement) {
  let count = 0;

  const render = () => {
    button.textContent = \`Clicked \${count} times\`;
  };

  button.addEventListener("click", () => {
    count += 1;
    render();
  });
  render();
}
`,
      },
      { path: "src/style.css", content: baseCss },
    ],
  },

  angular: {
    entry: "src/app/app.component.ts",
    files: [
      {
        path: "package.json",
        content: `{
  "name": "angular-playground",
  "private": true,
  "scripts": {
    "start": "ng serve",
    "build": "ng build"
  },
  "dependencies": {
    "@angular/common": "^20.0.0",
    "@angular/compiler": "^20.0.0",
    "@angular/core": "^20.0.0",
    "@angular/platform-browser": "^20.0.0",
    "rxjs": "^7.8.0",
    "tslib": "^2.8.0"
  },
  "devDependencies": {
    "@angular/build": "^20.0.0",
    "@angular/cli": "^20.0.0",
    "@angular/compiler-cli": "^20.0.0",
    "typescript": "~5.8.0"
  }
}
`,
      },
      {
        path: "src/index.html",
        content: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Angular playground</title>
  </head>
  <body>
    <app-root></app-root>
  </body>
</html>
`,
      },
      {
        path: "src/main.ts",
        content: `import { provideZonelessChangeDetection } from "@angular/core";
import { bootstrapApplication } from "@angular/platform-browser";
import { AppComponent } from "./app/app.component";

bootstrapApplication(AppComponent, {
  providers: [provideZonelessChangeDetection()],
}).catch((err) => console.error(err));
`,
      },
      {
        path: "src/app/app.component.ts",
        content: `import { Component, signal } from "@angular/core";

@Component({
  selector: "app-root",
  template: \`
    <main>
      <h1>Hello from Angular</h1>
      <button (click)="count.update((c) => c + 1)">Clicked {{ count() }} times</button>
    </main>
  \`,
})
export class AppComponent {
  count = signal(0);
}
`,
      },
    ],
  },

  express: {
    entry: "index.js",
    files: [
      {
        path: "package.json",
        content: `{
  "name": "express-playground",
  "private": true,
  "type": "module",
  "scripts": {
    "start": "node index.js",
    "dev": "node --watch index.js"
  },
  "dependencies": {
    "express": "^5.1.0"
  }
}
`,
      },
      {
        path: "index.js",
        content: `import express from "express";

const app = express();
const port = 3000;

app.get("/", (req, res) => {
  res.send("Hello from Express!");
});

app.listen(port, () => {
  console.log(\`Server running at http://localhost:\${port}\`);
});
`,
      },
    ],
  },

  hono: {
    entry: "src/index.ts",
    files: [
      {
        path: "package.json",
        content: `{
  "name": "hono-playground",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/index.ts"
  },
  "dependencies": {
    "@hono/node-server": "^1.14.0",
    "hono": "^4.7.0"
  },
  "devDependencies": {
    "tsx": "^4.19.0",
    "typescript": "^5.8.0"
  }
}
`,
      },
      {
        path: "src/index.ts",
        content: `import { serve } from "@hono/node-server";
import { Hono } from "hono";

const app = new Hono();

app.get("/", (c) => c.text("Hello from Hono!"));

serve({ fetch: app.fetch, port: 3000 }, (info) => {
  console.log(\`Server running at http://localhost:\${info.port}\`);
});
`,
      },
    ],
  },
};
