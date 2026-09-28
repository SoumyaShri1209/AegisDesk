import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
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

  return NextResponse.json({
    ok: true,
    sessionId: chatSession?.id ?? null,
    messages: messages.map((m) => ({
      id: m.id,
      role: m.role,
      content: m.content,
      meta: m.meta,
      createdAt: m.createdAt,
    })),
  });
}