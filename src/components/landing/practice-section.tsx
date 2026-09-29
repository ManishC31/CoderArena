import { ChallengeCard, type Challenge } from "@/components/landing/challenge-card";
import { Section } from "@/components/landing/section";

// Example development challenges (design.md, section 20).
const challenges: Challenge[] = [
  {
    area: "React",
    title: "Build a searchable user table with pagination and sorting.",
    difficulty: "Medium",
    checks: "Unit tests",
  },
  {
    area: "Next.js",
    title: "Implement an authenticated dashboard with server-side data fetching.",
    difficulty: "Hard",
    checks: "Integration tests",
  },
  { area: "Node.js", title: "Build a REST API for managing tasks.", difficulty: "Medium", checks: "API tests" },
  {
    area: "Debugging",
    title: "Find and fix the memory leak in this Node.js service.",
    difficulty: "Hard",
    checks: "Functional tests",
  },
  { area: "Backend", title: "Implement rate limiting middleware.", difficulty: "Medium", checks: "Unit tests" },
  { area: "Database", title: "Optimize this slow database query.", difficulty: "Hard", checks: "Integration tests" },
];

export function PracticeSection() {
  return (
    <Section
      id="practice"
      eyebrow="Practice"
      comingSoon
      title="Practice the kind of coding you actually do in software engineering interviews."
      description="Work through realistic tasks, not just puzzles. Each challenge comes with a starter repository: you make the change in the browser, and automated tests check the result."
    >
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {challenges.map((challenge) => (
          <ChallengeCard key={challenge.title} {...challenge} />
        ))}
      </ul>
    </Section>
  );
}
