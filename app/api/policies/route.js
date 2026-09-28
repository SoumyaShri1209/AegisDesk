import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";
import { indexPolicy } from "../../../lib/rag/index";
import { logAudit } from "@/lib/audit/log";

export const runtime = "nodejs";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const policies = await prisma.policy.findMany({
    where: { companyId: session.user.companyId },
    orderBy: [{ code: "asc" }, { createdAt: "desc" }],
  });

  return NextResponse.json({ ok: true, policies });
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await req.json();
  const { code, title, content, department, priorityHint, sourceFile } = body;

  if (!title || !content) {
    return NextResponse.json(
      { error: "Title and content are required" },
      { status: 400 }
    );
  }

  const policy = await prisma.policy.create({
    data: {
      code: code?.trim() || null,
      title: title.trim().slice(0, 200),
      content: content.trim(),
      department: department?.trim() || null,
      priorityHint: priorityHint?.trim() || null,
      sourceFile: sourceFile?.trim() || null,
      company: { connect: { id: session.user.companyId } },
    },
  });

  try {
    await indexPolicy(policy);
  } catch (err) {
    console.error("[policies] indexing failed:", err);
  }

  return NextResponse.json({ ok: true, policy });
}