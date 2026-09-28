import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tickets = await prisma.ticket.findMany({
    where: {
      companyId: session.user.companyId,
      employeeId: session.user.id,
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      number: true,
      title: true,
      department: true,
      priority: true,
      status: true,
      slaDueAt: true,
      createdAt: true,
      resolvedAt: true,
    },
  });

  return NextResponse.json({ ok: true, tickets });
}