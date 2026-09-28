import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../../lib/auth";
import { prisma } from "../../../../../lib/prisma";
import TicketList from "../../../../../components/tickets/TicketList";

const TABS = [
  { key: "active", label: "Active" },
  { key: "open", label: "Open" },
  { key: "in_progress", label: "In progress" },
  { key: "waiting_on_employee", label: "Waiting" },
  { key: "resolved", label: "Resolved" },
];

export default async function DeptDashboard({ params, searchParams }) {
  const { dept } = await params;
  const { status = "active" } = await searchParams;

  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  if (session.user.role !== dept) redirect(`/dept/${session.user.role}/dashboard`);

  const where = {
    companyId: session.user.companyId,
    department: dept,
  };

  if (status === "active") {
    where.status = { in: ["open", "in_progress", "waiting_on_employee"] };
  } else if (status !== "all") {
    where.status = status;
  }

  const tickets = await prisma.ticket.findMany({
    where,
    orderBy: [{ slaDueAt: "asc" }, { createdAt: "desc" }],
    take: 100,
    include: {
      employee: { select: { name: true, email: true } },
      assignedTo: { select: { name: true } },
    },
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">{dept.toUpperCase()} Queue</h1>
        <p className="text-sm text-white/50 mt-1">
          {tickets.length} {tickets.length === 1 ? "ticket" : "tickets"} · {status}
        </p>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={`/dept/${dept}/dashboard?status=${t.key}`}
            className={`text-xs px-3 py-1.5 rounded-full border transition ${
              status === t.key
                ? "bg-brand-500 border-brand-500 text-white"
                : "bg-white/5 border-white/10 hover:border-brand-500/40"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      <TicketList tickets={tickets} basePath={`/dept/${dept}/tickets`} />
    </div>
  );
}