"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";

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

const FIX_LANGUAGES = [
  { value: "typescript", label: "TypeScript" },
  { value: "javascript", label: "JavaScript" },
  { value: "python", label: "Python" },
  { value: "c", label: "C" },
  { value: "cpp", label: "C++" },
  { value: "csharp", label: "C#" },
  { value: "ruby", label: "Ruby" },
  { value: "sql", label: "SQL (Generic)" },
  { value: "mysql", label: "MySQL" },
  { value: "postgresql", label: "PostgreSQL" },
] as const;

type FixLanguage = (typeof FIX_LANGUAGES)[number]["value"];

type AnalysisResponse = {
  mode: "repo" | "pr";
  analysisId: string;
  repo: {
    fullName: string;
    ownerLogin: string;
    stars: number;
    openIssues: number;
    forks: number;
    defaultBranch: string;
  };
  pr?: {
    number: number;
    title: string;
    state: "open" | "closed";
    author: string;
    baseRef: string;
    headRef: string;
    createdAt: string;
  };
  score: number;
  verdict: "Elite" | "Healthy" | "Watch" | "Critical";
  insights: string[];
  riskSignals: { label: string; value: number }[];
  reviewDNA: { label: string; value: number }[];
  hotspots: Hotspot[];
  recommendations: string[];
};

const scoreColor = (value: number) => {
  if (value >= 80) return "text-emerald-400";
  if (value >= 60) return "text-lime-300";
  if (value >= 40) return "text-yellow-300";
  return "text-red-400";
};

const severityColor = (severity: Hotspot["aiReview"]["severity"]) => {
  switch (severity) {
    case "Critical":
      return "text-red-300";
    case "High":
      return "text-orange-300";
    case "Medium":
      return "text-yellow-300";
    default:
      return "text-emerald-300";
  }
};

export default function Home() {
  const { data: session, status } = useSession();

  const [inputUrl, setInputUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<AnalysisResponse | null>(null);

  // Code fixing
  const [fixCode, setFixCode] = useState("");
  const [fixLanguage, setFixLanguage] = useState<FixLanguage>("typescript");
  const [fixLoading, setFixLoading] = useState(false);
  const [fixError, setFixError] = useState("");
  const [fixResult, setFixResult] = useState<{
    fixedCode: string;
    diagnostics: string[];
    note?: string;
    usedModel?: string;
  } | null>(null);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inputUrl }),
      });

      const data = (await response.json()) as AnalysisResponse | { error: string };
      if (!response.ok || "error" in data) {
        throw new Error("error" in data ? data.error : "Analysis failed");
      }

      setResult(data);
    } catch (issue) {
      setError(issue instanceof Error ? issue.message : "Unexpected error");
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = async (format: "pdf" | "json") => {
    if (!result) return;
    const url = `/api/reports/export?analysisId=${encodeURIComponent(result.analysisId)}&format=${format}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to download report");

    const blob = await response.blob();
    const objectUrl = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = objectUrl;
    a.download = `reviewforge-x-${result.analysisId}.${format}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(objectUrl);
  };

  const onFixSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFixLoading(true);
    setFixError("");
    setFixResult(null);

    try {
      const response = await fetch("/api/fix-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: fixCode, language: fixLanguage }),
      });

      const data = (await response.json()) as
        | { fixedCode: string; diagnostics: string[]; note?: string; usedModel?: string }
        | { error: string };

      if (!response.ok || "error" in data) {
        throw new Error("error" in data ? data.error : "Fixing failed");
      }

      setFixResult(data);
    } catch (issue) {
      setFixError(issue instanceof Error ? issue.message : "Unexpected error");
    } finally {
      setFixLoading(false);
    }
  };

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-8 md:px-10">
      <header className="glass-card rounded-2xl p-6 md:p-8">
        <div className="flex items-start justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="crazy-logo-wrap shrink-0">
              <img src="/crazy-logo.png" alt="ReviewForge crazy logo" className="crazy-logo h-16 w-16 md:h-20 md:w-20" />
            </div>
            <div>
            <p className="mb-3 inline-block rounded-full border border-emerald-700/60 bg-emerald-900/20 px-3 py-1 text-xs tracking-[0.2em] text-emerald-300">
              REVIEWFORGE X
            </p>
            <h1 className="text-3xl font-semibold text-zinc-100 md:text-4xl">Advanced GitHub Code Review Intelligence</h1>
            <p className="mt-3 max-w-3xl text-sm text-zinc-400">
              Paste a repo URL or a PR URL to generate a deep review profile: Quantum Score, Risk Signals, Hotspots,
              and actionable review comments.
            </p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-3">
            <Link className="text-sm text-emerald-300 hover:text-emerald-200" href="/leaderboard">
              Leaderboard
            </Link>

            {status === "loading" ? (
              <div className="text-sm text-zinc-400">Auth: loading…</div>
            ) : session?.user ? (
              <div className="flex items-center gap-3">
                <div className="text-sm text-zinc-300">
                  Signed in: <span className="text-emerald-200">{session.user.login ?? "user"}</span>
                </div>
                <button
                  type="button"
                  onClick={() => signOut()}
                  className="rounded-xl border border-zinc-800 bg-black/20 px-3 py-2 text-xs text-zinc-200 hover:bg-black/30"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => signIn("github", { callbackUrl: "/" })}
                className="rounded-xl bg-emerald-700 px-4 py-2 text-xs font-semibold text-white transition hover:bg-emerald-600"
              >
                Sign in with GitHub
              </button>
            )}
          </div>
        </div>
      </header>

      <form onSubmit={onSubmit} className="glass-card neon-ring grid gap-3 rounded-2xl p-5 md:grid-cols-[1fr_auto]">
        <input
          required
          type="url"
          value={inputUrl}
          onChange={(event) => setInputUrl(event.target.value)}
          placeholder="https://github.com/owner/repository  OR  https://github.com/owner/repository/pull/123"
          className="rounded-xl border bg-black/40 px-4 py-3 text-sm text-zinc-100 outline-none ring-0 placeholder:text-zinc-500 focus:border-emerald-600"
        />
        <button
          disabled={loading}
          type="submit"
          className="rounded-xl bg-emerald-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Analyzing..." : "Run Deep Review"}
        </button>
      </form>

      {error ? (
        <p className="rounded-xl border border-red-500/40 bg-red-950/20 px-4 py-3 text-sm text-red-300">{error}</p>
      ) : null}

      {result ? (
        <section className="grid gap-6">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="glass-card rounded-xl p-4">
              <p className="text-xs uppercase tracking-wide text-zinc-400">Repository</p>
              <p className="mt-1 text-sm font-semibold text-zinc-100">{result.repo.fullName}</p>
              <p className="mt-1 text-xs text-zinc-500">Team: {result.repo.ownerLogin}</p>
            </div>
            <div className="glass-card rounded-xl p-4">
              <p className="text-xs uppercase tracking-wide text-zinc-400">Stars</p>
              <p className="mt-1 text-sm font-semibold text-zinc-100">{result.repo.stars.toLocaleString()}</p>
            </div>
            <div className="glass-card rounded-xl p-4">
              <p className="text-xs uppercase tracking-wide text-zinc-400">Open Issues</p>
              <p className="mt-1 text-sm font-semibold text-zinc-100">{result.repo.openIssues.toLocaleString()}</p>
            </div>
            <div className="glass-card rounded-xl p-4">
              <p className="text-xs uppercase tracking-wide text-zinc-400">Forks</p>
              <p className="mt-1 text-sm font-semibold text-zinc-100">{result.repo.forks.toLocaleString()}</p>
            </div>
          </div>

          {result.mode === "pr" && result.pr ? (
            <article className="glass-card rounded-xl p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-zinc-400">PR</p>
                  <p className="mt-1 text-sm font-semibold text-zinc-100">
                    #{result.pr.number} — {result.pr.title}
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">
                    {result.pr.state} • {result.pr.author} • {result.pr.baseRef} → {result.pr.headRef}
                  </p>
                </div>
              </div>
            </article>
          ) : null}

          <div className="grid gap-4 md:grid-cols-3">
            <article className="glass-card rounded-xl p-5">
              <p className="text-xs uppercase tracking-wide text-zinc-400">Quantum Review Score</p>
              <p className={`mt-2 text-5xl font-bold ${scoreColor(result.score)}`}>{result.score}</p>
              <p className="mt-2 text-sm text-zinc-300">{result.verdict}</p>

              <div className="mt-4 flex items-center justify-between gap-3">
                <div className="text-xs text-zinc-500">
                  Mode: <span className="text-zinc-300">{result.mode.toUpperCase()}</span>
                </div>
                <div className="text-xs text-zinc-500">
                  ID: <span className="text-zinc-300">{result.analysisId.slice(0, 8)}…</span>
                </div>
              </div>
            </article>

            <article className="glass-card rounded-xl p-5 md:col-span-2">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="mb-3 text-xs uppercase tracking-wide text-zinc-400">Review DNA</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => downloadReport("pdf")}
                    className="rounded-xl border border-zinc-800 bg-black/20 px-3 py-2 text-xs text-zinc-200 hover:bg-black/30"
                  >
                    Download PDF
                  </button>
                  <button
                    type="button"
                    onClick={() => downloadReport("json")}
                    className="rounded-xl border border-zinc-800 bg-black/20 px-3 py-2 text-xs text-zinc-200 hover:bg-black/30"
                  >
                    Download JSON
                  </button>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                {result.reviewDNA.map((item) => (
                  <div key={item.label}>
                    <div className="mb-1 flex justify-between text-xs text-zinc-300">
                      <span>{item.label}</span>
                      <span>{item.value}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-zinc-900">
                      <div className="h-2 rounded-full bg-emerald-600" style={{ width: `${item.value}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </article>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <article className="glass-card rounded-xl p-5">
              <p className="mb-3 text-xs uppercase tracking-wide text-zinc-400">Risk Signals</p>
              <ul className="space-y-3 text-sm">
                {result.riskSignals.map((signal) => (
                  <li
                    key={signal.label}
                    className="flex items-center justify-between rounded-lg border border-zinc-800 bg-black/20 px-3 py-2"
                  >
                    <span className="text-zinc-300">{signal.label}</span>
                    <span className={scoreColor(100 - signal.value)}>{signal.value}</span>
                  </li>
                ))}
              </ul>
            </article>

            <article className="glass-card rounded-xl p-5">
              <p className="mb-3 text-xs uppercase tracking-wide text-zinc-400">Hotspots & Review Comments</p>
              <ul className="space-y-3 text-sm">
                {result.hotspots.map((spot) => (
                  <li key={spot.file} className="rounded-lg border border-zinc-800 bg-black/20 px-3 py-2">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-zinc-200">{spot.file}</p>
                        <p className={`mt-1 text-xs ${severityColor(spot.aiReview.severity)}`}>
                          {spot.aiReview.severity} • Risk Index: {spot.risk}/100
                        </p>
                      </div>
                      <span className="shrink-0 text-emerald-300">{spot.touches} touches</span>
                    </div>

                    <p className="mt-2 text-xs text-zinc-400">{spot.aiReview.rationale}</p>
                    <ul className="mt-2 space-y-1 text-xs text-zinc-300">
                      {spot.aiReview.comments.map((c, idx) => (
                        <li key={`${spot.file}-${idx}`}>• {c}</li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            </article>
          </div>

          <article className="glass-card rounded-xl p-5">
            <p className="mb-3 text-xs uppercase tracking-wide text-zinc-400">Strategic Recommendations</p>
            <ul className="space-y-2 text-sm text-zinc-300">
              {result.recommendations.map((recommendation) => (
                <li key={recommendation} className="rounded-lg border border-zinc-800 bg-black/20 px-3 py-2">
                  {recommendation}
                </li>
              ))}
            </ul>
            <div className="mt-4 rounded-lg border border-emerald-800/60 bg-emerald-900/20 p-3">
              <p className="text-xs text-emerald-200">{result.insights.join(" | ")}</p>
            </div>
          </article>
        </section>
      ) : null}

      <section className="grid gap-4">
        <div className="glass-card rounded-2xl p-5">
          <h2 className="text-lg font-semibold text-zinc-100">Fix Pasted Code</h2>
          <p className="mt-1 text-sm text-zinc-400">
            Paste a snippet that has errors. If you set <span className="text-zinc-200">OPENAI_API_KEY</span>, the server will
            attempt to return compile-ready, error-free code.
          </p>

          <form onSubmit={onFixSubmit} className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]">
            <textarea
              required
              value={fixCode}
              onChange={(e) => setFixCode(e.target.value)}
              placeholder={`Paste your ${fixLanguage} code here…`}
              className="min-h-[160px] rounded-xl border bg-black/40 px-4 py-3 text-sm text-zinc-100 outline-none ring-0 placeholder:text-zinc-500 focus:border-emerald-600"
            />
            <div className="flex flex-col gap-3">
              <select
                value={fixLanguage}
                onChange={(e) => setFixLanguage(e.target.value as FixLanguage)}
                className="rounded-xl border bg-black/40 px-4 py-3 text-sm text-zinc-100 outline-none focus:border-emerald-600"
              >
                {FIX_LANGUAGES.map((lang) => (
                  <option key={lang.value} value={lang.value}>
                    {lang.label}
                  </option>
                ))}
              </select>
              <button
                disabled={fixLoading}
                type="submit"
                className="rounded-xl bg-emerald-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {fixLoading ? "Fixing..." : "Fix Code"}
              </button>
            </div>
          </form>

          {fixError ? <p className="mt-3 rounded-xl border border-red-500/40 bg-red-950/20 px-4 py-3 text-sm text-red-300">{fixError}</p> : null}

          {fixResult ? (
            <div className="mt-4 grid gap-3">
              {fixResult.note ? (
                <p className="rounded-xl border border-zinc-800 bg-black/20 px-4 py-3 text-sm text-zinc-300">{fixResult.note}</p>
              ) : null}

              {fixResult.diagnostics?.length ? (
                <div className="glass-card rounded-xl p-4">
                  <p className="text-xs uppercase tracking-wide text-zinc-400">Diagnostics</p>
                  <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap text-xs text-zinc-300">
                    {fixResult.diagnostics.join("\n")}
                  </pre>
                </div>
              ) : null}

              <div className="glass-card rounded-xl p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs uppercase tracking-wide text-zinc-400">Fixed Code</p>
                  {fixResult.usedModel ? <p className="text-xs text-zinc-500">Model: {fixResult.usedModel}</p> : null}
                </div>
                <textarea
                  value={fixResult.fixedCode}
                  readOnly
                  className="mt-3 min-h-[180px] w-full resize-y rounded-xl border bg-black/30 px-4 py-3 text-sm text-zinc-100 outline-none"
                />
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
