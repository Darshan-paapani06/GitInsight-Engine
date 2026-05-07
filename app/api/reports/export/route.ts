import { NextRequest, NextResponse } from "next/server";
import PDFDocument from "pdfkit";
import { PassThrough } from "stream";

import { getAnalysisRunById } from "@/app/lib/storage";

function bufferFromStream(stream: PassThrough): Promise<Buffer> {
  const chunks: Buffer[] = [];
  return new Promise((resolve, reject) => {
    stream.on("data", (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("error", reject);
  });
}

export async function GET(request: NextRequest) {
  const analysisId = request.nextUrl.searchParams.get("analysisId") ?? "";
  const format = (request.nextUrl.searchParams.get("format") ?? "pdf").toLowerCase();

  if (!analysisId) {
    return NextResponse.json({ error: "Missing analysisId" }, { status: 400 });
  }

  const run = getAnalysisRunById(analysisId);
  if (!run) {
    return NextResponse.json({ error: "Analysis not found" }, { status: 404 });
  }

  if (format === "json") {
    const fileName = `reviewforge-x-${analysisId}.json`;
    return new NextResponse(JSON.stringify(run.analysis, null, 2), {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  }

  const analysis = run.analysis as any;
  const doc = new PDFDocument({ size: "A4", margin: 50 });

  const stream = new PassThrough();
  doc.pipe(stream);

  doc.fontSize(20).fillColor("#e6edf3").text("ReviewForge X Audit Report", { align: "left" });
  doc.moveDown(0.5);
  doc.fontSize(10).fillColor("#7d8590").text(`Generated at: ${new Date(run.createdAt).toISOString()}`);
  doc.moveDown(0.8);

  doc.fontSize(12).fillColor("#e6edf3").text(`Mode: ${analysis?.mode ?? "unknown"}`);
  doc.text(`Quantum Review Score: ${analysis?.score ?? "-"}`);
  doc.text(`Verdict: ${analysis?.verdict ?? "-"}`);

  doc.moveDown(1);
  doc.fontSize(13).fillColor("#2ea043").text("Risk Signals");
  doc.fontSize(10);
  const riskSignals: Array<{ label: string; value: number }> = analysis?.riskSignals ?? [];
  if (!riskSignals.length) doc.text("No risk signals.");
  for (const s of riskSignals) {
    doc.text(`- ${s.label}: ${s.value}/100`);
  }

  doc.moveDown(0.8);
  doc.fontSize(13).fillColor("#2ea043").text("Insights");
  doc.fontSize(10);
  const insights: string[] = analysis?.insights ?? [];
  if (!insights.length) doc.text("No insights.");
  for (const i of insights) doc.text(`- ${i}`);

  doc.moveDown(0.8);
  doc.fontSize(13).fillColor("#2ea043").text("Hotspots (with review comments)");
  doc.fontSize(10);
  const hotspots: Array<any> = analysis?.hotspots ?? [];
  if (!hotspots.length) {
    doc.text("No hotspots detected.");
  } else {
    for (const h of hotspots) {
      doc.moveDown(0.2);
      doc.fontSize(11).fillColor("#e6edf3").text(`${h.file} (Risk: ${h.risk}/100)`);
      doc.fontSize(10).fillColor("#7d8590").text(`Severity: ${h.aiReview?.severity ?? "-"}`);
      const comments: string[] = h.aiReview?.comments ?? [];
      for (const c of comments.slice(0, 8)) {
        doc.text(`• ${c}`);
      }
    }
  }

  doc.moveDown(0.8);
  doc.fontSize(13).fillColor("#2ea043").text("Recommendations");
  doc.fontSize(10);
  const recs: string[] = analysis?.recommendations ?? [];
  if (!recs.length) doc.text("No recommendations.");
  for (const r of recs) doc.text(`- ${r}`);

  doc.end();

  const pdfBuffer = await bufferFromStream(stream);
  const pdfBytes = new Uint8Array(pdfBuffer);

  const fileName = `reviewforge-x-${analysisId}.pdf`;
  return new NextResponse(pdfBytes, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${fileName}"`,
    },
  });
}

