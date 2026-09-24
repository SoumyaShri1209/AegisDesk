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
    const strings = content.items.map((item) => item.str);
    fullText += strings.join(" ") + "\n\n";
  }

  return fullText;
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await req.json();
  const { code, title, content, department, priorityHint, sourceFile } = body;

  if (!title || !content) {
    return NextResponse.json({ error: "Title and content are required" }, { status: 400 });
  }

  const policy = await prisma.policy.create({
    data: {
      code: code?.trim() || null,
      title: title.trim().slice(0, 200),
      content: content.trim(),
      department: department?.trim() || null,
      priorityHint: priorityHint?.trim() || null,
      sourceFile: sourceFile?.trim() || null,
      company: { connect: { id: session.user.companyId } },  // 🔒 relation form
    },
  });

  return NextResponse.json({ ok: true, policy });
}