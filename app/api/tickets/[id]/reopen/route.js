import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../../lib/auth";
import { prisma } from "../../../../../lib/prisma";
import { logAudit } from "../../../../../lib/audit/log";
import { computeSlaDueFromHours } from "../../../../../lib/tickets/sla";
import { getSlaHoursForPriority } from "../../../../../lib/tickets/sla-settings";

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

  // Fresh SLA from the CURRENT company settings
  const hours = await getSlaHoursForPriority({
    companyId,
    priority: ticket.priority,
  });
  const newSlaDueAt = computeSlaDueFromHours(hours);

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
        content: `🔄 **Ticket T-${ticket.number} reopened**\n\nIt's back with the **${ticket.department.toUpperCase()}** team. A fresh SLA of **${hours} hours** has started.`,
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