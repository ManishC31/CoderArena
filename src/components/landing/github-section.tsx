import { Check } from "lucide-react";
import { GitHubImportFlow } from "@/components/landing/mockups/github-import-flow";
import { Section } from "@/components/landing/section";

const capabilities = [
  "Connect your GitHub account",
  "Import any repository into a playground",
  "Edit repositories in the browser",
  "Create a repository from a playground",
  "Push your changes back to GitHub",
  "Continue working on existing projects",
];

export function GitHubSection() {
  return (
    <Section
      id="github"
      eyebrow="GitHub"
      comingSoon
      title="Bring your repositories with you."
      description="Connect GitHub to import a repository into a playground, edit it in the browser, and push your work back when you're done."
    >
      <div className="grid items-start gap-10 lg:grid-cols-5">
        <ul className="grid gap-3 sm:grid-cols-2 lg:sticky lg:top-24 lg:col-span-2 lg:grid-cols-1">
          {capabilities.map((capability) => (
            <li key={capability} className="flex items-center gap-3 text-sm">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-brand/10">
                <Check className="size-3.5 text-brand" />
              </span>
              {capability}
            </li>
          ))}
        </ul>
        <div className="min-w-0 lg:col-span-3">
          <GitHubImportFlow />
        </div>
      </div>
    </Section>
  );
}
