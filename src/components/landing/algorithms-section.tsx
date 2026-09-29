import { ProblemMockup } from "@/components/landing/mockups/problem-mockup";
import { Section } from "@/components/landing/section";

export function AlgorithmsSection() {
  return (
    <Section
      id="algorithms"
      eyebrow="Algorithms"
      comingSoon
      title="Algorithm problems, evaluated in isolated sandboxes."
      description="Solve LeetCode-style problems in JavaScript, TypeScript, or Python. Run the examples while you work, then submit against the full test suite for a verdict with runtime and memory."
    >
      <ProblemMockup />
    </Section>
  );
}
