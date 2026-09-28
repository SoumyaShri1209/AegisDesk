import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../../lib/auth";
import { prisma } from "../../../../../lib/prisma";
import { canTransition } from "../../../../../lib/tickets/status";
import { logAudit } from "../../../../../lib/audit/log";

export const runtime = "nodejs";

const DEPT_ROLES = ["it", "security", "finance", "manager"];

export async function PATCH(req, ctx) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const companyId = session.user.companyId;
  const role = session.user.role;

  const ticket = await prisma.ticket.findFirst({ where: { id, companyId } });
  if (!ticket) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (role !== "admin" && (!DEPT_ROLES.includes(role) || ticket.department !== role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const next = body.status;
  const resolution = (body.resolution || "").trim();

  if (!next) return NextResponse.json({ error: "status is required" }, { status: 400 });
  if (!canTransition(ticket.status, next)) {
    return NextResponse.json(
      { error: `Cannot move from ${ticket.status} to ${next}` },
      { status: 400 }
    );
  }

  const updates = { status: next };

  if (next === "in_progress" && !ticket.assignedToId) {
    updates.assignedToId = session.user.id;
  }

  if (next === "waiting_on_employee" && ticket.status !== "waiting_on_employee") {
    updates.slaPausedAt = new Date();
  } else if (ticket.status === "waiting_on_employee" && next !== "waiting_on_employee") {
    const pausedAt = ticket.slaPausedAt ? new Date(ticket.slaPausedAt).getTime() : Date.now();
    updates.slaPauseMs = (ticket.slaPauseMs || 0) + (Date.now() - pausedAt);
    updates.slaPausedAt = null;
  }

  if (next === "resolved") {
    if (!resolution) {
      return NextResponse.json(
        { error: "Resolution note is required when resolving" },
        { status: 400 }
      );
    }
    updates.resolution = resolution;
    updates.resolvedAt = new Date();
  }

  if (next === "closed") updates.closedAt = new Date();

  const updated = await prisma.ticket.update({ where: { id: ticket.id }, data: updates });

  if (next === "resolved" && ticket.chatSessionId) {
    await prisma.chatMessage.create({
      data: {
        sessionId: ticket.chatSessionId,
        role: "assistant",
        content: `✅ **Ticket T-${ticket.number} resolved by ${ticket.department.toUpperCase()}**\n\n${resolution}\n\n*If the issue comes back, reply here and we'll reopen it.*`,
        meta: { type: "resolution", ticketNumber: ticket.number },
      },
    });
  }

  await logAudit({
    companyId,
    actorId: session.user.id,
    action: `ticket.status_${next}`,
    entityType: "ticket",
    entityId: ticket.id,
    metadata: { from: ticket.status, to: next, number: ticket.number },
  });

  return NextResponse.json({ ok: true, ticket: updated });
}