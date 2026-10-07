import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const VALID_RATINGS = ["up", "down"];

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

  const { messageId, rating, reason } = body;

  if (!messageId || typeof messageId !== "string") {
    return NextResponse.json({ error: "messageId required" }, { status: 400 });
  }
  if (!VALID_RATINGS.includes(rating)) {
    return NextResponse.json(
      { error: "rating must be 'up' or 'down'" },
      { status: 400 }
    );
  }

  const companyId = session.user.companyId;
  const userId = session.user.id;

  // Verify the message belongs to this user's chat session
  const message = await prisma.chatMessage.findFirst({
    where: {
      id: messageId,
      session: { companyId, userId },
      role: "assistant",
    },
  });
  if (!message) {
    return NextResponse.json({ error: "Message not found" }, { status: 404 });
  }

  // Upsert: one vote per user per message, changeable
  const feedback = await prisma.answerFeedback.upsert({
    where: {
      messageId_userId: { messageId, userId },
    },
    create: {
      companyId,
      messageId,
      userId,
      rating,
      reason: reason ? String(reason).slice(0, 500) : null,
    },
    update: {
      rating,
      reason: reason ? String(reason).slice(0, 500) : null,
    },
  });

  return NextResponse.json({ ok: true, feedback });
}

export async function DELETE(req) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const messageId = searchParams.get("messageId");
  if (!messageId) {
    return NextResponse.json({ error: "messageId required" }, { status: 400 });
  }

  await prisma.answerFeedback.deleteMany({
    where: {
      messageId,
      userId: session.user.id,
      companyId: session.user.companyId,
    },
  });

  return NextResponse.json({ ok: true });
}