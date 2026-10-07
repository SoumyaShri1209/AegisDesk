import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";
import { getSessionWithMessages } from "../../../../lib/chat/session";

export const runtime = "nodejs";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { session: chatSession, messages } = await getSessionWithMessages({
    companyId: session.user.companyId,
    userId: session.user.id,
  });

  // Load this user's feedback for all their messages in one query
  const messageIds = messages.map((m) => m.id);
  const feedbackRows = messageIds.length
    ? await prisma.answerFeedback.findMany({
        where: {
          userId: session.user.id,
          companyId: session.user.companyId,
          messageId: { in: messageIds },
        },
        select: { messageId: true, rating: true },
      })
    : [];

  const feedbackMap = new Map(
    feedbackRows.map((f) => [f.messageId, f.rating])
  );

  return NextResponse.json({
    ok: true,
    sessionId: chatSession?.id ?? null,
    messages: messages.map((m) => ({
      id: m.id,
      role: m.role,
      content: m.content,
      meta: {
        ...(m.meta && typeof m.meta === "object" ? m.meta : {}),
        feedbackRating: feedbackMap.get(m.id) ?? null,
      },
      createdAt: m.createdAt,
    })),
  });
}