import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../../lib/auth";
import { prisma } from "../../../../../lib/prisma";
import { logAudit } from "../../../../../lib/audit/log";

export const runtime = "nodejs";

const DEPT_ROLES = ["it", "security", "finance", "manager"];

export async function POST(req, ctx) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  const companyId = session.user.companyId;
  const role = session.user.role;

  const ticket = await prisma.ticket.findFirst({ where: { id, companyId } });
  if (!ticket) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (role !== "admin" && (!DEPT_ROLES.includes(role) || ticket.department !== role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const text = (body.body || "").trim();
  const isInternal = !!body.isInternal;

  if (!text) return NextResponse.json({ error: "Reply body is required" }, { status: 400 });

  const reply = await prisma.ticketReply.create({
    data: {
      ticketId: ticket.id,
      authorId: session.user.id,
      body: text,
      isInternal,
    },
    include: { author: { select: { name: true, role: true } } },
  });

  if (!isInternal && ticket.chatSessionId) {
    const label = `${ticket.department.toUpperCase()} — ${reply.author.name}`;
    await prisma.chatMessage.create({
      data: {
        sessionId: ticket.chatSessionId,
        role: "assistant",
        content: `**${label}** replied to **T-${ticket.number}**:\n\n${text}`,
        meta: { type: "ticket_reply", ticketNumber: ticket.number },
      },
    });
  }

  await logAudit({
    companyId,
    actorId: session.user.id,
    action: isInternal ? "ticket.internal_note_added" : "ticket.replied",
    entityType: "ticket",
    entityId: ticket.id,
    metadata: { number: ticket.number, isInternal },
  });

  return NextResponse.json({ ok: true, reply });
}