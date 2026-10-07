import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../../lib/auth";
import { prisma } from "../../../../../lib/prisma";
import { logAudit } from "../../../../../lib/audit/log";
import { computeSlaDue } from "../../../../../lib/tickets/sla";

export const runtime = "nodejs";

export async function POST(_req, ctx) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const companyId = session.user.companyId;
  const userId = session.user.id;

  const ticket = await prisma.ticket.findFirst({
    where: { id, companyId, employeeId: userId },
  });
  if (!ticket) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (ticket.status !== "resolved") {
    return NextResponse.json(
      { error: "Only resolved tickets can be reopened" },
      { status: 400 }
    );
  }

  // Fresh SLA clock from now, based on the original priority
  const newSlaDueAt = computeSlaDue(ticket.priority);

  const updated = await prisma.ticket.update({
    where: { id: ticket.id },
    data: {
      status: "open",
      resolvedAt: null,
      resolution: null,
      closedAt: null,
      escalatedAt: null,
      slaPausedAt: null,
      slaPauseMs: 0,
      slaDueAt: newSlaDueAt,
      assignedToId: null,
    },
  });

  if (ticket.chatSessionId) {
    await prisma.chatMessage.create({
      data: {
        sessionId: ticket.chatSessionId,
        role: "assistant",
        content: `🔄 **Ticket T-${ticket.number} reopened**\n\nIt's back with the **${ticket.department.toUpperCase()}** team. A fresh SLA of **${slaLabel(ticket.priority)}** has started.`,
        meta: { type: "reopened", ticketNumber: ticket.number },
      },
    });
  }

  await logAudit({
    companyId,
    actorId: userId,
    action: "ticket.reopened",
    entityType: "ticket",
    entityId: ticket.id,
    metadata: { number: ticket.number },
  });

  return NextResponse.json({ ok: true, ticket: updated });
}

function slaLabel(priority) {
  return {
    critical: "2 hours",
    high: "8 hours",
    medium: "24 hours",
    low: "3 days",
  }[priority] || "24 hours";
}