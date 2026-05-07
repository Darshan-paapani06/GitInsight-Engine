import { NextRequest, NextResponse } from "next/server";

import { listAnalysisRuns } from "@/app/lib/storage";

type LeaderboardTeam = {
  teamKey: string;
  runsCount: number;
  avgScore: number;
  recentTrend: {
    firstScore: number;
    lastScore: number;
    delta: number;
  } | null;
  points: Array<{ at: string; score: number }>;
};

export async function GET(_request: NextRequest) {
  const runs = listAnalysisRuns(300);

  const byTeam = new Map<string, typeof runs>();
  for (const r of runs) {
    const teamKey = r.teamKey ?? "unknown";
    const arr = byTeam.get(teamKey) ?? [];
    arr.push(r);
    byTeam.set(teamKey, arr);
  }

  const teams: LeaderboardTeam[] = [];
  for (const [teamKey, teamRuns] of byTeam.entries()) {
    const sortedAsc = [...teamRuns].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    const lastN = sortedAsc.slice(-10);
    const scores = lastN.map((r) => (r.analysis as any)?.score).filter((s) => typeof s === "number") as number[];
    if (!scores.length) continue;

    const avgScore = Math.round((scores.reduce((s, v) => s + v, 0) / scores.length) * 10) / 10;
    const firstScore = scores[0];
    const lastScore = scores[scores.length - 1];

    const points = lastN
      .slice(-12)
      .map((r) => ({ at: r.createdAt, score: (r.analysis as any)?.score }))
      .filter((p: any) => typeof p.score === "number");

    teams.push({
      teamKey,
      runsCount: teamRuns.length,
      avgScore,
      recentTrend:
        points.length >= 2
          ? {
              firstScore: points[0].score,
              lastScore: points[points.length - 1].score,
              delta: Math.round((points[points.length - 1].score - points[0].score) * 10) / 10,
            }
          : null,
      points,
    });
  }

  teams.sort((a, b) => b.avgScore - a.avgScore);
  return NextResponse.json({ teams: teams.slice(0, 10) });
}

