import { prisma } from "../prisma";
import { computeSlaDue } from "./sla";

export async function createTicketFromDecision({
  companyId,
  employeeId,
  chatSessionId,
  ticket,
}) {
  const number = await nextTicketNumber(companyId);
  const slaDueAt = computeSlaDue(ticket.priority);

  return prisma.ticket.create({
    data: {
      number,
      companyId,
      employeeId,
      chatSessionId: chatSessionId || null,
      department: ticket.department,
      priority: ticket.priority,
      title: ticket.title.slice(0, 200),
      reason: ticket.reason,
      status: "open",
      slaDueAt,
    },
  });
}

async function nextTicketNumber(companyId) {
  const company = await prisma.company.update({
    where: { id: companyId },
    data: { ticketCounter: { increment: 1 } },
    select: { ticketCounter: true },
  });
  return company.ticketCounter;
}