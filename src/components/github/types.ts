import type { RepoIndexStatus } from "@/generated/prisma/enums";

// A synced repository, as the GitHub page and the chat list show it.
export type RepositorySummary = {
  id: string;
  fullName: string;
  description: string | null;
  defaultBranch: string;
  private: boolean;
  pushedAt: Date | null;
  indexStatus: RepoIndexStatus;
  fileCount: number;
};

export const repositorySummarySelect = {
  id: true,
  fullName: true,
  description: true,
  defaultBranch: true,
  private: true,
  pushedAt: true,
  indexStatus: true,
  fileCount: true,
} as const;
