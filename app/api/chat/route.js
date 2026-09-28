import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";
import { retrieveRelevantChunks } from "../../../lib/rag/retrieve";
import { decide } from "../../../lib/agent/decide";
import { getOrCreateSession, appendMessage, loadHistory } from "../../../lib/chat/session";
import { createTicketFromDecision } from "../../../lib/tickets/create";
import { logAudit } from "../../../lib/audit/log";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { question } = body;
  if (!question || !question.trim()) {
    return NextResponse.json({ error: "Question is required" }, { status: 400 });
  }

  const companyId = session.user.companyId;
  const userId = session.user.id;

  try {
    const chatSession = await getOrCreateSession({ companyId, userId });

    await appendMessage({
      sessionId: chatSession.id,
      role: "user",
      content: question.trim(),
    });

    const history = await loadHistory({ sessionId: chatSession.id, limit: 20 });

    const chunks = await retrieveRelevantChunks({
      companyId,
      query: question,
      topK: 5,
    });

    const openTickets = await prisma.ticket.findMany({
      where: {
        companyId,
        employeeId: userId,
        status: { in: ["open", "in_progress", "waiting_on_employee"] },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        number: true,
        department: true,
        priority: true,
        status: true,
        title: true,
        slaDueAt: true,
      },
    });

    const decision = await decide({ question, history, chunks, openTickets });

    const sources = chunks.map((c) => ({
      policyId: c.policyId,
      code: c.policyCode,
      title: c.policyTitle,
      similarity: Number(c.similarity),
    }));

    let assistantText = "";
    if (decision.action === "answer") {
      assistantText = decision.answer || "";
    }

    const assistantMeta = {
      type: decision.action,
      citations: decision.citations || [],
      ticket: decision.ticket || null,
      sources,
    };

    let createdTicket = null;
    if (decision.action === "escalate" && decision.ticket) {
      createdTicket = await createTicketFromDecision({
        companyId,
        employeeId: userId,
        chatSessionId: chatSession.id,
        ticket: decision.ticket,
      });

      assistantMeta.ticketId = createdTicket.id;
      assistantMeta.ticketNumber = createdTicket.number;

      const deptLabel =
        {
          it: "IT",
          security: "Security",
          finance: "Finance",
          manager: "Management",
        }[createdTicket.department] || createdTicket.department.toUpperCase();

      const slaLabel =
        {
          critical: "2 hours",
          high: "8 hours",
          medium: "24 hours",
          low: "3 days",
        }[createdTicket.priority] || "a few days";

      assistantText = `✅ **Ticket created — T-${createdTicket.number}**

Your request has been routed to the **${deptLabel}** team.

- **Priority:** ${createdTicket.priority}
- **Expected response:** within **${slaLabel}**
- You'll get updates here as soon as they respond.

You can track this anytime in **My requests**.`;

      await logAudit({
        companyId,
        actorId: userId,
        action: "ticket.created",
        entityType: "ticket",
        entityId: createdTicket.id,
        metadata: {
          number: createdTicket.number,
          department: createdTicket.department,
          priority: createdTicket.priority,
        },
      });
    }

    await appendMessage({
      sessionId: chatSession.id,
      role: "assistant",
      content: assistantText,
      meta: assistantMeta,
    });

    return NextResponse.json({
      ok: true,
      decision,
      sources,
      assistantText,
      ticket: createdTicket
        ? {
            id: createdTicket.id,
            number: createdTicket.number,
            status: createdTicket.status,
            department: createdTicket.department,
            priority: createdTicket.priority,
            slaDueAt: createdTicket.slaDueAt,
          }
        : null,
    });
  } catch (err) {
    console.error("[chat] error:", err);
    return NextResponse.json({ error: "Agent failed" }, { status: 500 });
  }
}