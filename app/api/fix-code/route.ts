import { NextRequest, NextResponse } from "next/server";
import * as ts from "typescript";

const SUPPORTED_LANGUAGES = [
  "typescript",
  "javascript",
  "python",
  "c",
  "cpp",
  "csharp",
  "ruby",
  "sql",
  "mysql",
  "postgresql",
] as const;

type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];
type LlmProvider = "openai" | "openrouter";

function looksLikeOpenRouterKey(key?: string) {
  return typeof key === "string" && key.startsWith("sk-or-v1-");
}

function stripCodeFences(text: string) {
  const trimmed = text.trim();
  // Remove leading ```lang or ``` fences and trailing ```
  return trimmed
    .replace(/^```[a-zA-Z0-9_-]*\s*\n?/, "")
    .replace(/```$/, "")
    .trim();
}

function formatDiagnostics(diags: ts.Diagnostic[] | undefined): string {
  if (!diags?.length) return "";
  return diags
    .map((d) => {
      const message = ts.flattenDiagnosticMessageText(d.messageText, "\n");
      const line = d.file?.getLineAndCharacterOfPosition(d.start ?? 0)?.line;
      return `${line != null ? `Line ${line + 1}: ` : ""}${message}`;
    })
    .join("\n");
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { code?: string; language?: string };
    const code = body.code ?? "";
    const language = (body.language ?? "typescript") as SupportedLanguage;

    if (!code.trim()) {
      return NextResponse.json({ error: "Missing `code`" }, { status: 400 });
    }

    if (!SUPPORTED_LANGUAGES.includes(language)) {
      return NextResponse.json({ error: `Unsupported language: ${String(body.language)}` }, { status: 400 });
    }

    let diagnosticsText = "";
    if (language === "typescript" || language === "javascript") {
      const fileName = language === "javascript" ? "snippet.js" : "snippet.ts";
      // Lightweight, best-effort diagnostics for TS/JS snippets.
      const transpile = ts.transpileModule(code, {
        fileName,
        reportDiagnostics: true,
        compilerOptions: {
          target: ts.ScriptTarget.ES2017,
          module: ts.ModuleKind.ESNext,
          moduleResolution: ts.ModuleResolutionKind.Bundler,
          jsx: ts.JsxEmit.ReactJSX,
          allowJs: language === "javascript",
          checkJs: language === "javascript",
          esModuleInterop: true,
          strict: true,
        },
      });
      diagnosticsText = formatDiagnostics(transpile.diagnostics);
    }

    const openRouterKey = process.env.OPENROUTER_API_KEY;
    const openAiKey = process.env.OPENAI_API_KEY;
    const routedOpenRouterKey = openRouterKey ?? (looksLikeOpenRouterKey(openAiKey) ? openAiKey : undefined);
    const routedOpenAiKey = looksLikeOpenRouterKey(openAiKey) ? undefined : openAiKey;
    const provider: LlmProvider | null = routedOpenRouterKey ? "openrouter" : routedOpenAiKey ? "openai" : null;

    if (!provider) {
      return NextResponse.json({
        fixedCode: code,
        diagnostics: diagnosticsText ? diagnosticsText.split("\n") : [],
        note:
          "No LLM key found. Set OPENROUTER_API_KEY or OPENAI_API_KEY for automatic fixing. TS/JS diagnostics are shown when available.",
      });
    }

    const model =
      provider === "openrouter"
        ? process.env.OPENROUTER_MODEL ?? "openai/gpt-4o-mini"
        : process.env.OPENAI_MODEL ?? "gpt-4o-mini";
    const endpoint =
      provider === "openrouter" ? "https://openrouter.ai/api/v1/chat/completions" : "https://api.openai.com/v1/chat/completions";
    const authToken = provider === "openrouter" ? routedOpenRouterKey : routedOpenAiKey;
    const promptDiagnostics = diagnosticsText
      ? `TypeScript diagnostics:\n${diagnosticsText}`
      : "No compiler diagnostics are available for this language in local mode; rely on static review and language rules.";

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
              "You are a senior software engineer. Fix the user's code so it compiles and runs as intended. Return ONLY the corrected code, without explanations or markdown fences.",
          },
          {
            role: "user",
            content: `Language: ${language}\n\n${promptDiagnostics}\n\nPasted code:\n${code}\n\nCorrect the code. Output only the final code.`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      return NextResponse.json(
        {
          error: `LLM request failed (${response.status}). ${errorText.slice(0, 300)}`,
        },
        { status: 500 },
      );
    }

    const json = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const fixed = json.choices?.[0]?.message?.content;
    const fixedCode = typeof fixed === "string" ? stripCodeFences(fixed) : code;

    return NextResponse.json({
      fixedCode,
      diagnostics: diagnosticsText ? diagnosticsText.split("\n") : [],
      usedModel: model,
      provider,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fix code" },
      { status: 500 },
    );
  }
}

