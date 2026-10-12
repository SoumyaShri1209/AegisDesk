import { prisma } from "../prisma";
import { sendEmail } from "./client";
import {
  ticketCreatedForEmployee,
  ticketCreatedForDept,
  ticketReplyForEmployee,
  ticketResolvedForEmployee,
} from "./templates";

export async function notifyTicketCreated({ ticket, companyId }) {
  try {
    const employee = await prisma.user.findUnique({
      where: { id: ticket.employeeId },
      select: { email: true, name: true },
    });

    const deptUsers = await prisma.user.findMany({
      where: {
        companyId,
        role: ticket.department,
        status: "active",
      },
      select: { email: true, name: true },
    });

    const tasks = [];

    if (employee) {
      const t = ticketCreatedForEmployee({ ticket, employee });
      tasks.push(sendEmail({ to: employee.email, ...t }));
    }

    for (const u of deptUsers) {
      const t = ticketCreatedForDept({ ticket, user: u });
      tasks.push(sendEmail({ to: u.email, ...t }));
    }

    await Promise.allSettled(tasks);
  } catch (err) {
    console.error("[email:notifyTicketCreated]", err.message);
  }
}

export async function notifyTicketReply({ ticket, reply, author }) {
  try {
    const employee = await prisma.user.findUnique({
      where: { id: ticket.employeeId },
      select: { email: true, name: true },
    });
    if (!employee) return;

    const t = ticketReplyForEmployee({ ticket, reply, author });
    await sendEmail({ to: employee.email, ...t });
  } catch (err) {
    console.error("[email:notifyTicketReply]", err.message);
  }
}

export async function notifyTicketResolved({ ticket, resolution }) {
  try {
    const employee = await prisma.user.findUnique({
      where: { id: ticket.employeeId },
      select: { email: true, name: true },
    });
    if (!employee) return;

    const t = ticketResolvedForEmployee({ ticket, resolution });
    await sendEmail({ to: employee.email, ...t });
  } catch (err) {
    console.error("[email:notifyTicketResolved]", err.message);
  }
}