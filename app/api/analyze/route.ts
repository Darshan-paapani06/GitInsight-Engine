import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/authOptions";

import { githubApiFetch, parseGitHubPullUrl, parseGitHubRepoUrl } from "@/app/lib/github";
import { generateHotspotReview } from "@/app/lib/review";
import { appendAnalysisRun, type AnalysisMode } from "@/app/lib/storage";

type GitHubRepo = {
  full_name: string;
  stargazers_count: number;
  open_issues_count: number;
  forks_count: number;
  default_branch: string;
  owner: { login: string };
};

type GitHubCommit = {
  sha: string;
  commit: { author: { date: string }; message: string };
  author: { login: string } | null;
};

type GitHubCommitDetail = {
  stats?: { additions: number; deletions: number };
  files?: Array<{ filename: string; changes: number }>;
};

type GitHubPull = {
  number: number;
  title: string;
  state: "open" | "closed";
  created_at: string;
  user: { login: string };
  base: { ref: string };
  head: { ref: string };
};

type GitHubPullFile = {
  filename: string;
  changes: number;
  additions: number;
  deletions: number;
  status: string;
};

type GitHubPullCommit = {
  author: { login: string } | null;
  commit: { message: string };
};

type RiskSignal = { label: string; value: number };
type ReviewDNA = { label: string; value: number };
type Hotspot = {
  file: string;
  touches: number;
  risk: number;
  aiReview: {
    severity: "Low" | "Medium" | "High" | "Critical";
    headline: string;
    rationale: string;
    comments: string[];
  };
};

type AnalysisVerdict = "Elite" | "Healthy" | "Watch" | "Critical";
type LlmProvider = "openai" | "openrouter";

function looksLikeOpenRouterKey(key?: string) {
  return typeof key === "string" && key.startsWith("sk-or-v1-");
}

function scoreToVerdict(score: number): AnalysisVerdict {
  return score >= 80 ? "Elite" : score >= 60 ? "Healthy" : score >= 40 ? "Watch" : "Critical";
}

function stripCodeFences(text: string) {
  const trimmed = text.trim();
  return trimmed
    .replace(/^```[a-zA-Z0-9_-]*\s*\n?/, "")
    .replace(/```$/, "")
    .trim();
}

async function maybeEnhanceHotspotReviews(params: {
  hotspots: Hotspot[];
  mode: AnalysisMode;
  repoFullName: string;
  prNumber?: number;
}): Promise<Hotspot[]> {
  const openRouterKey = process.env.OPENROUTER_API_KEY;
  const openAiKey = process.env.OPENAI_API_KEY;
  const routedOpenRouterKey = openRouterKey ?? (looksLikeOpenRouterKey(openAiKey) ? openAiKey : undefined);
  const routedOpenAiKey = looksLikeOpenRouterKey(openAiKey) ? undefined : openAiKey;
  const provider: LlmProvider | null = routedOpenRouterKey ? "openrouter" : routedOpenAiKey ? "openai" : null;
  if (!provider) return params.hotspots;
  if (!params.hotspots.length) return params.hotspots;

  try {
    const model =
      provider === "openrouter"
        ? process.env.OPENROUTER_MODEL ?? "openai/gpt-4o-mini"
        : process.env.OPENAI_MODEL ?? "gpt-4o-mini";
    const endpoint =
      provider === "openrouter" ? "https://openrouter.ai/api/v1/chat/completions" : "https://api.openai.com/v1/chat/completions";
    const authToken = provider === "openrouter" ? routedOpenRouterKey : routedOpenAiKey;
    const headers: HeadersInit = {
      Authorization: `Bearer ${authToken}`,
      "Content-Type": "application/json",
    };
    if (provider === "openrouter") {
      headers["HTTP-Referer"] = process.env.OPENROUTER_SITE_URL ?? "http://localhost:3000";
      headers["X-Title"] = process.env.OPENROUTER_APP_NAME ?? "ReviewForge X";
    }

    const response = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model,
        temperature: 0.2,
        messages: [
          {
            role: "system",
            content:
              "You are a senior code reviewer. Improve review comments for each hotspot file. Return ONLY valid JSON; no markdown.",
          },
          {
            role: "user",
            content: `Generate improved review comments for these hotspot files.\n\nMode: ${params.mode}\nRepo: ${params.repoFullName}${
              params.prNumber ? `\nPR: #${params.prNumber}` : ""
            }\n\nHotspots:\n${JSON.stringify(
              params.hotspots.map((h) => ({
                file: h.file,
                risk: h.risk,
                touches: h.touches,
                severity: h.aiReview.severity,
                rationale: h.aiReview.rationale,
                existingComments: h.aiReview.comments,
              })),
              null,
              2,
            )}\n\nReturn an array of objects matching this schema for each hotspot (same order): [{\"file\": string, \"severity\": string, \"headline\": string, \"rationale\": string, \"comments\": string[]}]`,
          },
        ],
      }),
    });

    if (!response.ok) return params.hotspots;
    const json = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = json.choices?.[0]?.message?.content;
    if (typeof content !== "string") return params.hotspots;

    const parsed = JSON.parse(stripCodeFences(content));
    if (!Array.isArray(parsed)) return params.hotspots;

    const byFile = new Map<string, unknown>();
    for (const item of parsed) {
      if (typeof item === "object" && item !== null && "file" in item) {
        const file = (item as { file?: unknown }).file;
        if (typeof file === "string") {
          byFile.set(file, item);
        }
      }
    }

    return params.hotspots.map((h) => {
      const item = byFile.get(h.file) as
        | {
            severity?: Hotspot["aiReview"]["severity"];
            headline?: string;
            rationale?: string;
            comments?: unknown[];
          }
        | undefined;
      if (!item) return h;
      const nextComments = Array.isArray(item.comments)
        ? item.comments.filter((x): x is string => typeof x === "string").slice(0, 7)
        : h.aiReview.comments;
      return {
        ...h,
        aiReview: {
          ...h.aiReview,
          severity: item.severity ?? h.aiReview.severity,
          headline: item.headline ?? h.aiReview.headline,
          rationale: item.rationale ?? h.aiReview.rationale,
          comments: nextComments,
        },
      };
    });
  } catch {
    return params.hotspots;
  }
}

function computeRiskSignals(args: {
  ownershipRisk: number;
  volatilityRisk: number;
  collaborationRisk: number;
  docsRisk: number;
}): RiskSignal[] {
  return [
    { label: "Ownership Concentration", value: args.ownershipRisk },
    { label: "Volatility Pressure", value: args.volatilityRisk },
    { label: "Collaboration Fragility", value: args.collaborationRisk },
    { label: "Documentation Drift", value: args.docsRisk },
  ];
}

function computeReviewDNA(args: {
  volatilityRisk: number;
  ownershipRisk: number;
  collaborationRisk: number;
  docsRisk: number;
}): ReviewDNA[] {
  return [
    { label: "Complexity", value: Math.min(100, args.volatilityRisk + 8) },
    { label: "Resilience", value: Math.max(0, 100 - args.ownershipRisk) },
    { label: "Collaboration", value: Math.max(0, 100 - args.collaborationRisk) },
    { label: "Documentation", value: Math.max(0, 100 - args.docsRisk) },
  ];
}

function computeRecommendations(args: {
  ownershipRisk: number;
  volatilityRisk: number;
  docsRisk: number;
}): string[] {
  return [
    args.ownershipRisk > 55
      ? "Introduce rotating code ownership and require at least 2 reviewers on critical directories."
      : "Current ownership distribution is acceptable; maintain reviewer diversity.",
    args.volatilityRisk > 60
      ? "Split large commits into smaller review batches and enforce PR size budgets."
      : "Volatility is controlled; keep commit granularity stable.",
    args.docsRisk > 70
      ? "Add a docs checklist to PR templates so high-impact changes include update notes."
      : "Documentation signals are solid; keep changelog discipline.",
    "Use hotspot files as mandatory audit targets during every release readiness review.",
  ];
}

function scoreFromSignals(riskSignals: RiskSignal[]) {
  const averageRisk = Math.round(riskSignals.reduce((sum, signal) => sum + signal.value, 0) / riskSignals.length);
  return Math.max(0, 100 - averageRisk);
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const accessToken = session?.accessToken;

    const body = (await request.json()) as { repoUrl?: string; prUrl?: string; inputUrl?: string };
    const inputUrl = body.prUrl ?? body.repoUrl ?? body.inputUrl ?? "";

    const prRef = parseGitHubPullUrl(inputUrl);
    const repoRef = prRef ? { owner: prRef.owner, repo: prRef.repo } : parseGitHubRepoUrl(inputUrl);

    if (!prRef && !repoRef) {
      return NextResponse.json({ error: "Invalid GitHub repository or PR URL" }, { status: 400 });
    }

    const analysisId = randomUUID();

    const analysisMode: AnalysisMode = prRef ? "pr" : "repo";

    if (analysisMode === "pr") {
      const [repo, pull, files, prCommits] = await Promise.all([
        githubApiFetch<GitHubRepo>(`/repos/${prRef!.owner}/${prRef!.repo}`, accessToken),
        githubApiFetch<GitHubPull>(`/repos/${prRef!.owner}/${prRef!.repo}/pulls/${prRef!.pullNumber}`, accessToken),
        githubApiFetch<GitHubPullFile[]>(
          `/repos/${prRef!.owner}/${prRef!.repo}/pulls/${prRef!.pullNumber}/files?per_page=100`,
          accessToken,
        ),
        githubApiFetch<GitHubPullCommit[]>(
          `/repos/${prRef!.owner}/${prRef!.repo}/pulls/${prRef!.pullNumber}/commits?per_page=100`,
          accessToken,
        ),
      ]);

      const fileTotal = files.reduce(
        (acc, f) => {
          acc.totalChanges += f.changes;
          acc.totalAdditions += f.additions;
          acc.totalDeletions += f.deletions;
          if (f.filename.toLowerCase().includes("docs") || f.filename.toLowerCase().endsWith(".md")) acc.docsFiles += 1;
          return acc;
        },
        { totalChanges: 0, totalAdditions: 0, totalDeletions: 0, docsFiles: 0 },
      );

      const contributorMap = new Map<string, number>();
      prCommits.forEach((c) => {
        const login = c.author?.login ?? "unknown";
        contributorMap.set(login, (contributorMap.get(login) ?? 0) + 1);
      });

      const topContributorShare = Math.round(
        (Math.max(...contributorMap.values(), 0) / Math.max(prCommits.length, 1)) * 100,
      );

      const volatilityRisk = Math.min(100, Math.round(fileTotal.totalChanges / Math.max(files.length, 1) / 8));
      const collaborationRisk = Math.max(0, 100 - Math.min(contributorMap.size * 20, 100));
      const ownershipRisk = topContributorShare;
      const docsRisk = Math.max(
        0,
        100 - Math.round((fileTotal.docsFiles / Math.max(files.length, 1)) * 100),
      );

      const riskSignals = computeRiskSignals({
        ownershipRisk,
        volatilityRisk,
        collaborationRisk,
        docsRisk,
      });

      const score = scoreFromSignals(riskSignals);
      const verdict = scoreToVerdict(score);

      const reviewDNA = computeReviewDNA({ volatilityRisk, ownershipRisk, collaborationRisk, docsRisk });
      const recommendations = computeRecommendations({ ownershipRisk, volatilityRisk, docsRisk });

      const uniqueContrib = contributorMap.size;
      const hotspotEntries: Hotspot[] = files
        .map((f) => {
          const ext = f.filename.toLowerCase();
          const extRisk = /\.(ts|tsx|js|jsx)$/.test(ext) ? 20 : ext.endsWith(".json") || ext.endsWith(".yml") ? 10 : 0;
          const share = f.changes / Math.max(1, fileTotal.totalChanges);
          const risk = Math.min(100, Math.max(5, Math.round(share * 80 + extRisk)));
          return {
            file: f.filename,
            touches: f.changes,
            risk,
            aiReview: generateHotspotReview({
              filename: f.filename,
              risk,
              additions: f.additions,
              deletions: f.deletions,
              status: f.status,
            }),
          };
        })
        .sort((a, b) => b.risk - a.risk)
        .slice(0, 5);

      const enhancedHotspots = await maybeEnhanceHotspotReviews({
        hotspots: hotspotEntries,
        mode: "pr",
        repoFullName: repo.full_name,
        prNumber: pull.number,
      });

      const insights = [
        `Top PR author controls ${topContributorShare}% of commit samples`,
        `${uniqueContrib || 1} active contributors in this PR`,
        `${enhancedHotspots.length} high-risk files detected in the PR diff`,
      ];

      const analysisPayload = {
        mode: "pr",
        analysisId,
        repo: {
          fullName: repo.full_name,
          ownerLogin: repo.owner.login,
          stars: repo.stargazers_count,
          openIssues: repo.open_issues_count,
          forks: repo.forks_count,
          defaultBranch: repo.default_branch,
        },
        pr: {
          number: pull.number,
          title: pull.title,
          state: pull.state,
          author: pull.user.login,
          baseRef: pull.base.ref,
          headRef: pull.head.ref,
          createdAt: pull.created_at,
        },
        score,
        verdict,
        insights,
        riskSignals,
        reviewDNA,
        hotspots: enhancedHotspots,
        recommendations,
      };

      appendAnalysisRun({
        id: analysisId,
        createdAt: new Date().toISOString(),
        mode: analysisMode,
        teamKey: repo.owner.login,
        userLogin: session?.user?.login ?? null,
        input: { prUrl: inputUrl },
        analysis: analysisPayload,
      });

      return NextResponse.json(analysisPayload);
    }

    // Repo mode (existing behavior + AI review comments)
    const parsedRepo = repoRef!;
    const [repo, commits] = await Promise.all([
      githubApiFetch<GitHubRepo>(`/repos/${parsedRepo.owner}/${parsedRepo.repo}`, accessToken),
      githubApiFetch<GitHubCommit[]>(`/repos/${parsedRepo.owner}/${parsedRepo.repo}/commits?per_page=25`, accessToken),
    ]);

    const detailCommits = commits.slice(0, 10);
    const details = await Promise.all(
      detailCommits.map((commit) =>
        githubApiFetch<GitHubCommitDetail>(
          `/repos/${parsedRepo.owner}/${parsedRepo.repo}/commits/${commit.sha}`,
          accessToken,
        ),
      ),
    );

    const contributorMap = new Map<string, number>();
    commits.forEach((commit) => {
      const login = commit.author?.login ?? "unknown";
      contributorMap.set(login, (contributorMap.get(login) ?? 0) + 1);
    });

    const topContributorShare = Math.round(
      (Math.max(...contributorMap.values(), 0) / Math.max(commits.length, 1)) * 100,
    );
    const fileTouches = new Map<string, { touches: number; changes: number }>();
    let totalChanges = 0;
    let documentationCommits = 0;

    details.forEach((detail, index) => {
      const message = detailCommits[index]?.commit.message.toLowerCase() ?? "";
      if (message.includes("docs") || message.includes("readme")) {
        documentationCommits += 1;
      }

      totalChanges += (detail.stats?.additions ?? 0) + (detail.stats?.deletions ?? 0);
      detail.files?.forEach((file) => {
        const existing = fileTouches.get(file.filename) ?? { touches: 0, changes: 0 };
        existing.touches += 1;
        existing.changes += file.changes;
        fileTouches.set(file.filename, existing);
      });
    });

    const hotspotEntries: Hotspot[] = [...fileTouches.entries()]
      .map(([file, value]) => {
        const risk = Math.min(100, Math.round(value.changes / Math.max(value.touches, 1)));
        return {
          file,
          touches: value.touches,
          risk,
          aiReview: generateHotspotReview({
            filename: file,
            risk,
            additions: Math.round(value.changes / 2),
            deletions: Math.round(value.changes / 2),
          }),
        };
      })
      .sort((a, b) => b.risk - a.risk)
      .slice(0, 5);

    const enhancedHotspots = await maybeEnhanceHotspotReviews({
      hotspots: hotspotEntries,
      mode: "repo",
      repoFullName: repo.full_name,
    });

    const volatilityRisk = Math.min(100, Math.round(totalChanges / Math.max(details.length, 1) / 8));
    const collaborationRisk = Math.max(0, 100 - Math.min(contributorMap.size * 20, 100));
    const ownershipRisk = topContributorShare;
    const docsRisk = Math.max(
      0,
      100 - Math.round((documentationCommits / Math.max(detailCommits.length, 1)) * 100),
    );

    const riskSignals = computeRiskSignals({
      ownershipRisk,
      volatilityRisk,
      collaborationRisk,
      docsRisk,
    });

    const score = scoreFromSignals(riskSignals);
    const verdict = scoreToVerdict(score);

    const reviewDNA = computeReviewDNA({ volatilityRisk, ownershipRisk, collaborationRisk, docsRisk });
    const recommendations = computeRecommendations({ ownershipRisk, volatilityRisk, docsRisk });

    const insights = [
      `Top contributor controls ${topContributorShare}% of sampled commits`,
      `${contributorMap.size} active contributors in recent history`,
      `${enhancedHotspots.length} high-risk hotspot files detected`,
    ];

    const analysisPayload = {
      mode: "repo",
      analysisId,
      repo: {
        fullName: repo.full_name,
        ownerLogin: repo.owner.login,
        stars: repo.stargazers_count,
        openIssues: repo.open_issues_count,
        forks: repo.forks_count,
        defaultBranch: repo.default_branch,
      },
      score,
      verdict,
      insights,
      riskSignals,
      reviewDNA,
      hotspots: enhancedHotspots,
      recommendations,
    };

    appendAnalysisRun({
      id: analysisId,
      createdAt: new Date().toISOString(),
      mode: analysisMode,
      teamKey: repo.owner.login,
      userLogin: session?.user?.login ?? null,
      input: { repoUrl: inputUrl },
      analysis: analysisPayload,
    });

    return NextResponse.json(analysisPayload);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to analyze repository" },
      { status: 500 },
    );
  }
}
