import { prisma } from "../prisma";
import { logAudit } from "../audit/log";

// Runs a lazy SLA-breach scan for one company.
// Returns the number of tickets newly escalated.
export async function runSlaBreachCheck({ companyId }) {
  const now = Date.now();

  const candidates = await prisma.ticket.findMany({
    where: {
      companyId,
      status: { in: ["open", "in_progress"] },
      escalatedAt: null,
    },
    select: {
      id: true,
      number: true,
      department: true,
      priority: true,
      slaDueAt: true,
      slaPauseMs: true,
      chatSessionId: true,
    },
  });

  const breached = candidates.filter((t) => {
    const due = new Date(t.slaDueAt).getTime() + (t.slaPauseMs || 0);
    return due < now;
  });

  for (const t of breached) {
    await prisma.ticket.update({
      where: { id: t.id },
      data: { escalatedAt: new Date(now) },
    });

    if (t.chatSessionId) {
      await prisma.chatMessage.create({
        data: {
          sessionId: t.chatSessionId,
          role: "assistant",
          content: `⚠️ **Ticket T-${t.number} has breached its SLA.**\n\nIt has been flagged for management review. You'll hear from us soon.`,
          meta: { type: "sla_breach", ticketNumber: t.number },
        },
      });
    }

    await logAudit({
      companyId,
      actorId: null,
      action: "ticket.sla_breached",
      entityType: "ticket",
      entityId: t.id,
      metadata: {
        number: t.number,
        department: t.department,
        priority: t.priority,
      },
    });
  }

  return breached.length;
}