import "server-only";
import { Octokit } from "@octokit/rest";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// The user's linked GitHub account (Better Auth's `account` row), or null if they haven't
// connected one.
export function getGithubAccount(userId: string) {
  return prisma.account.findFirst({
    where: { userId, providerId: "github" },
    select: { id: true, accountId: true, scope: true },
  });
}

// A valid access token for the user's GitHub account, or null if they haven't connected one.
// Works without a request (e.g. in background jobs): Better Auth takes the userId instead.
export async function getGithubToken(userId: string) {
  const account = await getGithubAccount(userId);
  if (!account) return null;
  const { accessToken } = await auth.api.getAccessToken({ body: { accountId: account.id, userId } });
  return accessToken ?? null;
}

export function githubClient(token?: string | null) {
  return new Octokit(token ? { auth: token } : {});
}

// The GitHub login of the connected account, or null when the token no longer works
// (e.g. the user revoked the app on GitHub).
export async function getGithubLogin(token: string) {
  try {
    const { data } = await githubClient(token).rest.users.getAuthenticated();
    return data.login;
  } catch {
    return null;
  }
}

// Repositories pulled per sync: GitHub returns at most 100 per page.
const PER_PAGE = 100;
const MAX_PAGES = 10;

// Every repository the token's user can reach (owned, collaborator, organization), most
// recently pushed first, up to MAX_PAGES pages.
export async function listUserRepos(token: string) {
  const octokit = githubClient(token);
  const repos = [];
  for (let page = 1; page <= MAX_PAGES; page++) {
    const { data } = await octokit.rest.repos.listForAuthenticatedUser({ per_page: PER_PAGE, page, sort: "pushed" });
    repos.push(...data);
    if (data.length < PER_PAGE) break;
  }
  return repos;
}

// "https://github.com/owner/repo(.git)", "github.com/owner/repo" or "owner/repo" → { owner, repo }.
export function parseRepoReference(value: string) {
  const match = /^(?:(?:https?:\/\/)?(?:www\.)?github\.com\/)?([\w.-]+)\/([\w.-]+?)(?:\.git)?\/?$/i.exec(value.trim());
  return match ? { owner: match[1], repo: match[2] } : null;
}
