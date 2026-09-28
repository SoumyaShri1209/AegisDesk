import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";

export const runtime = "nodejs";

const DEPT_ROLES = ["it", "security", "finance", "manager"];

export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const companyId = session.user.companyId;
  const role = session.user.role;
  const { searchParams } = new URL(req.url);
  const statusFilter = searchParams.get("status") || "active";

  // Build the where clause based on role
  const where = { companyId };

  if (DEPT_ROLES.includes(role)) {
    where.department = role;
  } else if (role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Status filter
  if (statusFilter === "active") {
    where.status = { in: ["open", "in_progress", "waiting_on_employee"] };
  } else if (statusFilter === "all") {
    // no filter
  } else if (statusFilter) {
    where.status = statusFilter;
  }

  const tickets = await prisma.ticket.findMany({
    where,
    orderBy: [{ slaDueAt: "asc" }, { createdAt: "desc" }],
    take: 100,
    select: {
      id: true,
      number: true,
      title: true,
      department: true,
      priority: true,
      status: true,
      slaDueAt: true,
      slaPausedAt: true,
      slaPauseMs: true,
      createdAt: true,
      assignedToId: true,
      employee: { select: { name: true, email: true } },
      assignedTo: { select: { name: true } },
    },
  });

  return NextResponse.json({ ok: true, tickets });
}