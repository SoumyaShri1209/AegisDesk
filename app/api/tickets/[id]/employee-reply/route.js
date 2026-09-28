import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../../lib/auth";
import { prisma } from "../../../../../lib/prisma";
import { logAudit } from "../../../../../lib/audit/log";

export const runtime = "nodejs";

export async function POST(req, ctx) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  const companyId = session.user.companyId;
  const userId = session.user.id;

  const ticket = await prisma.ticket.findFirst({
    where: { id, companyId, employeeId: userId },
  });
  if (!ticket) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (ticket.status === "closed") {
    return NextResponse.json(
      { error: "This ticket is closed. Start a new chat to reopen it." },
      { status: 400 }
    );
  }

  const body = await req.json();
  const text = (body.body || "").trim();
  if (!text) return NextResponse.json({ error: "Reply body is required" }, { status: 400 });

  const reply = await prisma.ticketReply.create({
    data: { ticketId: ticket.id, authorId: userId, body: text, isInternal: false },
  });

  const updates = {};
  if (ticket.status === "waiting_on_employee") {
    updates.status = "in_progress";
    if (ticket.slaPausedAt) {
      const pausedAt = new Date(ticket.slaPausedAt).getTime();
      updates.slaPauseMs = (ticket.slaPauseMs || 0) + (Date.now() - pausedAt);
      updates.slaPausedAt = null;
    }
  }
  if (Object.keys(updates).length > 0) {
    await prisma.ticket.update({ where: { id: ticket.id }, data: updates });
  }

  if (ticket.chatSessionId) {
    await prisma.chatMessage.create({
      data: {
        sessionId: ticket.chatSessionId,
        role: "user",
        content: text,
        meta: { type: "employee_reply", ticketNumber: ticket.number },
      },
    });
  }

  await logAudit({
    companyId,
    actorId: userId,
    action: "ticket.employee_replied",
    entityType: "ticket",
    entityId: ticket.id,
    metadata: { number: ticket.number },
  });

  return NextResponse.json({ ok: true, reply });
}