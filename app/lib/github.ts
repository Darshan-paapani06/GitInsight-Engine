export type GitHubRepoRef = { owner: string; repo: string };
export type GitHubPullRef = { owner: string; repo: string; pullNumber: number };

export function parseGitHubRepoUrl(url: string): GitHubRepoRef | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname !== "github.com") return null;
    const [owner, repo] = parsed.pathname.split("/").filter(Boolean);
    if (!owner || !repo) return null;
    return { owner, repo: repo.replace(".git", "") };
  } catch {
    return null;
  }
}

export function parseGitHubPullUrl(url: string): GitHubPullRef | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname !== "github.com") return null;
    const parts = parsed.pathname.split("/").filter(Boolean);
    // /{owner}/{repo}/pull/{number} (also accept /pulls/{number})
    if (parts.length < 4) return null;
    const [owner, repo, pullSlug, numStr] = parts;
    if (!owner || !repo || !pullSlug || !numStr) return null;
    if (!["pull", "pulls"].includes(pullSlug)) return null;
    const pullNumber = Number(numStr);
    if (!Number.isFinite(pullNumber) || pullNumber <= 0) return null;
    return { owner, repo: repo.replace(".git", ""), pullNumber };
  } catch {
    return null;
  }
}

export async function githubApiFetch<T>(path: string, token?: string): Promise<T> {
  const headers: HeadersInit = {
    Accept: "application/vnd.github+json",
    "User-Agent": "reviewforge-x",
  };

  const resolvedToken = token ?? process.env.GITHUB_TOKEN;
  if (resolvedToken) headers.Authorization = `Bearer ${resolvedToken}`;

  const response = await fetch(`https://api.github.com${path}`, {
    headers,
    cache: "no-store",
  });

  if (!response.ok) {
    const bodyText = await response.text().catch(() => "");
    throw new Error(
      `GitHub API returned ${response.status}${bodyText ? `: ${bodyText.slice(0, 300)}` : ""}`,
    );
  }

  return (await response.json()) as T;
}

