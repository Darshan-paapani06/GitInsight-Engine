export type HotspotReview = {
  severity: "Low" | "Medium" | "High" | "Critical";
  headline: string;
  rationale: string;
  comments: string[];
};

function severityFromRisk(risk: number): HotspotReview["severity"] {
  if (risk >= 85) return "Critical";
  if (risk >= 65) return "High";
  if (risk >= 40) return "Medium";
  return "Low";
}

function fileCategory(filename: string): "code" | "config" | "docs" | "data" | "tests" {
  const lower = filename.toLowerCase();
  if (lower.endsWith(".test.ts") || lower.endsWith(".spec.ts") || lower.includes("/test/")) return "tests";
  if (lower.endsWith(".md") || lower.includes("docs/") || lower.includes("documentation")) return "docs";
  if (lower.endsWith(".json") || lower.endsWith(".yml") || lower.endsWith(".yaml")) return "config";
  if (lower.endsWith(".csv") || lower.endsWith(".tsv") || lower.endsWith(".sql")) return "data";
  if (/\.(ts|tsx|js|jsx)$/.test(lower)) return "code";
  return "code";
}

export function generateHotspotReview(input: {
  filename: string;
  risk: number;
  additions?: number;
  deletions?: number;
  status?: string; // "added" | "modified" | ...
}): HotspotReview {
  const { filename, risk, additions = 0, deletions = 0, status } = input;
  const category = fileCategory(filename);
  const severity = severityFromRisk(risk);

  const fileTypeHint =
    category === "code"
      ? "Complex code paths"
      : category === "config"
        ? "Behavior-affecting configuration"
        : category === "docs"
          ? "Docs drift / mismatch risk"
          : category === "tests"
            ? "Test coverage / intent drift"
            : "Data/schema sensitivity";

  const delta = additions + deletions;
  const churnHint =
    delta >= 500 ? "very high churn" : delta >= 200 ? "moderate churn" : delta >= 80 ? "light churn" : "small churn";

  const statusHint =
    status && ["added", "removed"].includes(status.toLowerCase())
      ? `The PR ${status.toLowerCase()} this hotspot, so review intent and edge cases carefully.`
      : "Review correctness, error handling, and compatibility with surrounding code.";

  let headline = `${severity} hotspot: ${filename}`;
  if (category === "docs") headline = `${severity} docs hotspot: ${filename}`;

  const rationale = `${fileTypeHint} with ${churnHint}. Risk index is driven by file change volume within this PR and file type.`;

  const comments: string[] = [];

  if (category === "code") {
    if (deletions > additions) {
      comments.push("Check for removed guardrails: ensure important validations and null/undefined handling still exist.");
    } else {
      comments.push("Validate new logic against existing invariants and add regression tests for edge cases introduced by this change.");
    }
    comments.push("Confirm types/interfaces are updated consistently across call sites (public contracts, return shapes, and error modes).");
    if (risk >= 65) comments.push("Look for performance or complexity regressions (avoid N+1 patterns, unbounded loops, and repeated serialization).");
  } else if (category === "config") {
    comments.push("Ensure configuration changes are backward compatible and validated at startup/runtime.");
    comments.push("Add or update documentation for the expected inputs/outputs and failure behavior.");
    if (risk >= 65) comments.push("Verify migrations/rollout strategy if this config affects live systems or schemas.");
  } else if (category === "docs") {
    comments.push("Confirm docs reflect the actual behavior and include any required examples or breaking-change notes.");
    comments.push("Check for internal consistency (links, terminology, and API signatures).");
  } else if (category === "tests") {
    comments.push("Ensure tests still cover the critical paths and fail for the right reasons.");
    comments.push("Avoid brittle assertions; prefer intent-based checks to reduce false positives.");
  } else {
    comments.push("Validate schema/data compatibility and add migration/validation checks where appropriate.");
  }

  comments.push(statusHint);

  return {
    severity,
    headline,
    rationale,
    comments: comments.slice(0, 7),
  };
}

