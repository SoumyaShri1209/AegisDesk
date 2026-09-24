import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";

// PATCH — update a policy (admin only)
export async function PATCH(req, ctx) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await ctx.params;
  const body = await req.json();

  // Ensure the policy belongs to this admin's company
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
      title: body.title !== undefined ? body.title.trim().slice(0, 200) : undefined,
      content: body.content !== undefined ? body.content.trim() : undefined,
      department: body.department !== undefined ? body.department?.trim() || null : undefined,
      priorityHint: body.priorityHint !== undefined ? body.priorityHint?.trim() || null : undefined,
      active: body.active !== undefined ? !!body.active : undefined,
    },
  });

  return NextResponse.json({ ok: true, policy: updated });
}

// DELETE — remove a policy (admin only)
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