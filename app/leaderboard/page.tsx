"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type TeamRow = {
  teamKey: string;
  runsCount: number;
  avgScore: number;
  recentTrend: { firstScore: number; lastScore: number; delta: number } | null;
  points: Array<{ at: string; score: number }>;
};

export default function LeaderboardPage() {
  const [teams, setTeams] = useState<TeamRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/leaderboard");
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error ?? "Failed to load leaderboard");
        setTeams(data.teams ?? []);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unexpected error");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-8 md:px-10">
      <div className="glass-card rounded-2xl p-6 md:p-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="mb-2 inline-block rounded-full border border-emerald-700/60 bg-emerald-900/20 px-3 py-1 text-xs tracking-[0.2em] text-emerald-300">
              TEAM LEADERBOARD
            </p>
            <h1 className="text-3xl font-semibold text-zinc-100 md:text-4xl">Code Health Trends</h1>
            <p className="mt-3 max-w-3xl text-sm text-zinc-400">
              Based on your stored analysis runs (average score over recent PR/repo evaluations).
            </p>
          </div>
          <Link className="text-sm text-emerald-300 hover:text-emerald-200" href="/">
            Back to analysis
          </Link>
        </div>
      </div>

      {error ? (
        <p className="rounded-xl border border-red-500/40 bg-red-950/20 px-4 py-3 text-sm text-red-300">{error}</p>
      ) : null}

      {loading ? (
        <div className="glass-card rounded-2xl p-6 text-sm text-zinc-300">Loading leaderboard…</div>
      ) : (
        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {teams.map((t) => (
            <article key={t.teamKey} className="glass-card rounded-xl p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-wide text-zinc-400">Team</p>
                  <p className="mt-1 text-sm font-semibold text-zinc-100">{t.teamKey}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs uppercase tracking-wide text-zinc-400">Avg</p>
                  <p className="mt-1 text-2xl font-bold text-emerald-300">{t.avgScore}</p>
                </div>
              </div>

              <p className="mt-3 text-xs text-zinc-400">
                {t.runsCount} runs stored
                {t.recentTrend ? (
                  <>
                    {" "}
                    • Trend:{" "}
                    <span className={t.recentTrend.delta >= 0 ? "text-emerald-300" : "text-red-300"}>
                      {t.recentTrend.delta >= 0 ? "+" : ""}
                      {t.recentTrend.delta}
                    </span>
                  </>
                ) : null}
              </p>

              <div className="mt-4 h-16 flex items-end gap-1">
                {t.points.slice(-12).map((p, idx) => {
                  const height = Math.max(2, Math.round((p.score / 100) * 64));
                  return (
                    <div
                      key={`${p.at}-${idx}`}
                      className="w-2 rounded bg-zinc-900 border border-zinc-800"
                      style={{ height: `${height}px`, background: "rgba(46,160,67,0.35)" }}
                      title={`${new Date(p.at).toLocaleString()} • ${p.score}`}
                    />
                  );
                })}
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}

