import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import { parsePoliciesFromText } from "../../../../lib/pdf-parser";

export const runtime = "nodejs";

async function extractPdfText(buffer) {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");

  const loadingTask = pdfjs.getDocument({
    data: new Uint8Array(buffer),
    useSystemFonts: true,
    disableFontFace: true,
  });

  const pdf = await loadingTask.promise;
  let fullText = "";

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();

    // Group text items into lines by Y coordinate
    let lastY = null;
    let line = "";
    const lines = [];

    for (const item of content.items) {
      const y = item.transform ? item.transform[5] : null;

      if (lastY !== null && y !== null && Math.abs(y - lastY) > 2) {
        if (line.trim()) lines.push(line.trim());
        line = "";
      }

      if (item.str) line += item.str + " ";
      if (y !== null) lastY = y;
    }

    if (line.trim()) lines.push(line.trim());

    fullText += lines.join("\n") + "\n\n";
  }

  return fullText;
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const contentType = req.headers.get("content-type") || "";

  let text = "";
  let sourceFile = null;

  try {
    if (contentType.includes("application/json")) {
      const body = await req.json();
      text = body.text || "";
      sourceFile = body.sourceFile || null;
    } else if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      const file = form.get("file");

      if (!file || typeof file === "string") {
        return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
      }

      if (!file.name.toLowerCase().endsWith(".pdf")) {
        return NextResponse.json({ error: "Only PDF files allowed" }, { status: 400 });
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      text = await extractPdfText(buffer);
      sourceFile = file.name;
    } else {
      return NextResponse.json({ error: "Unsupported content type" }, { status: 400 });
    }

    if (!text.trim()) {
      return NextResponse.json({ error: "No text extracted" }, { status: 400 });
    }

    const policies = parsePoliciesFromText(text, sourceFile);

    return NextResponse.json({
      ok: true,
      count: policies.length,
      sourceFile,
      policies,
    });
  } catch (err) {
    console.error("parse error:", err);
    return NextResponse.json(
      { error: err.message || "Parse failed" },
      { status: 500 }
    );
  }
}