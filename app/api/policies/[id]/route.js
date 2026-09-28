import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";
import { indexPolicy, removePolicyIndex } from "../../../../lib/rag/index";

export const runtime = "nodejs";

export async function PATCH(req, ctx) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await ctx.params;
  const body = await req.json();

  const existing = await prisma.policy.findFirst({
    where: { id, companyId: session.user.companyId },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updated = await prisma.policy.update({
    where: { id },
    data: {
      code: body.code !== undefined ? body.code?.trim() || null : undefined,
      title:
        body.title !== undefined
          ? body.title.trim().slice(0, 200)
          : undefined,
      content: body.content !== undefined ? body.content.trim() : undefined,
      department:
        body.department !== undefined
          ? body.department?.trim() || null
          : undefined,
      priorityHint:
        body.priorityHint !== undefined
          ? body.priorityHint?.trim() || null
          : undefined,
      active: body.active !== undefined ? !!body.active : undefined,
    },
  });

  try {
    if (updated.active) {
      await indexPolicy(updated);
    } else {
      await removePolicyIndex(updated.id);
    }
  } catch (err) {
    console.error("[policies] reindex failed:", err);
  }

  return NextResponse.json({ ok: true, policy: updated });
}

export async function DELETE(_req, ctx) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await ctx.params;

  const existing = await prisma.policy.findFirst({
    where: { id, companyId: session.user.companyId },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.policy.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}