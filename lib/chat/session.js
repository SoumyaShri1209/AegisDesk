import { prisma } from "../prisma";

export async function getOrCreateSession({ companyId, userId }) {
  const existing = await prisma.chatSession.findUnique({
    where: { userId },
  });
  if (existing) return existing;

  return prisma.chatSession.create({
    data: { companyId, userId },
  });
}

export async function getSessionWithMessages({ companyId, userId }) {
  const session = await prisma.chatSession.findUnique({
    where: { userId },
    include: {
      messages: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!session) return { session: null, messages: [] };
  return { session, messages: session.messages };
}

export async function appendMessage({ sessionId, role, content, meta }) {
  return prisma.chatMessage.create({
    data: { sessionId, role, content, meta: meta ?? null },
  });
}

export async function loadHistory({ sessionId, limit = 20 }) {
  const rows = await prisma.chatMessage.findMany({
    where: { sessionId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return rows
    .reverse()
    .map((m) => ({
      role: m.role === "system" ? "assistant" : m.role,
      content: m.content,
    }));
}