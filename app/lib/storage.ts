import fs from "fs";
import path from "path";

export type AnalysisMode = "repo" | "pr";

export type AnalysisRun = {
  id: string;
  createdAt: string; // ISO
  mode: AnalysisMode;
  teamKey?: string; // For the leaderboard (we default to GitHub repo owner login)
  userLogin?: string | null;
  input: {
    repoUrl?: string;
    prUrl?: string;
  };
  analysis: unknown; // Persist the full analysis payload for export
};

const DATA_DIR = path.join(process.cwd(), "data");
const HISTORY_PATH = path.join(DATA_DIR, "analysis-history.json");

function safeReadJson<T>(filePath: string): T | null {
  try {
    if (!fs.existsSync(filePath)) return null;
    const raw = fs.readFileSync(filePath, "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function safeWriteJson(filePath: string, value: unknown) {
  const dir = path.dirname(filePath);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2), "utf8");
}

export function readAnalysisHistory(): AnalysisRun[] {
  const parsed = safeReadJson<AnalysisRun[]>(HISTORY_PATH);
  return parsed ?? [];
}

export function appendAnalysisRun(run: AnalysisRun) {
  const history = readAnalysisHistory();
  history.unshift(run); // newest first
  safeWriteJson(HISTORY_PATH, history.slice(0, 500)); // cap file size
}

export function getAnalysisRunById(id: string): AnalysisRun | null {
  const history = readAnalysisHistory();
  return history.find((r) => r.id === id) ?? null;
}

export function listAnalysisRuns(limit = 50): AnalysisRun[] {
  return readAnalysisHistory().slice(0, Math.max(0, limit));
}

