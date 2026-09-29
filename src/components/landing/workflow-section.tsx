import { Section } from "@/components/landing/section";
import { WorkflowStep } from "@/components/landing/workflow-step";

const steps = [
  { name: "Learn", description: "Read the problem or the challenge brief." },
  { name: "Code", description: "Write the solution across as many files as it needs." },
  { name: "Test", description: "Run the test suite in an isolated sandbox." },
  { name: "Build", description: "Watch the app come together in the live preview." },
  { name: "Push", description: "Ship the result to a GitHub repository." },
];

export function WorkflowSection() {
  return (
    <Section
      id="workflow"
      eyebrow="One workspace"
      title="Practice software engineering by actually writing software."
      description="Algorithm sites stop at isolated puzzles. CoderArena puts you in a working project, with an editor, a running app, and tests that check your work: the same loop you use on the job."
    >
      <div className="relative">
        <div aria-hidden className="absolute inset-x-0 top-4.5 hidden h-px bg-border md:block" />
        <ol className="relative grid gap-8 md:grid-cols-5 md:gap-6">
          {steps.map((step, index) => (
            <WorkflowStep key={step.name} number={index + 1} {...step} />
          ))}
        </ol>
      </div>
    </Section>
  );
}
