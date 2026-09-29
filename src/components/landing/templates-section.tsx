import { Box, PackageCheck } from "lucide-react";
import { ProvisioningMockup } from "@/components/landing/mockups/provisioning-mockup";
import { Section } from "@/components/landing/section";
import { TemplateCard } from "@/components/landing/template-card";
import { sandboxTemplates } from "@/lib/sandbox-templates";

const facts = [
  { icon: Box, text: "Each playground gets its own container, sandboxed with gVisor." },
  { icon: PackageCheck, text: "Dependencies install in the container, not on your machine." },
];

export function TemplatesSection() {
  return (
    <Section
      id="playgrounds"
      eyebrow="Playgrounds"
      title="Pick a template and start coding immediately."
      description="No local installs and no dependency setup. Every playground starts from a working project and runs in an isolated environment, so you're writing code as soon as it opens."
    >
      <div className="grid gap-8 lg:grid-cols-5">
        <ul className="grid gap-3 sm:grid-cols-2 lg:col-span-3">
          {sandboxTemplates.map((template) => (
            <TemplateCard key={template.id} template={template} />
          ))}
        </ul>
        <div className="flex min-w-0 flex-col gap-6 lg:col-span-2">
          <ProvisioningMockup />
          <ul className="space-y-3 text-sm text-muted-foreground">
            {facts.map(({ icon: Icon, text }) => (
              <li key={text} className="flex gap-3">
                <Icon className="mt-0.5 size-4 shrink-0 text-brand" />
                {text}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
}
