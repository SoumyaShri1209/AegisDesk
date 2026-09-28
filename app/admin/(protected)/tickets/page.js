import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";
import TicketList from "../../../../components/tickets/TicketList";

const DEPTS = ["it", "security", "finance", "manager"];
const TABS = [
  { key: "active", label: "Active" },
  { key: "all", label: "All" },
  { key: "open", label: "Open" },
  { key: "resolved", label: "Resolved" },
];

export default async function AdminTicketsPage({ searchParams }) {
  const { status = "active", dept = "" } = await searchParams;
  const session = await getServerSession(authOptions);

  const where = { companyId: session.user.companyId };
  if (dept) where.department = dept;

  if (status === "active") {
    where.status = { in: ["open", "in_progress", "waiting_on_employee"] };
  } else if (status !== "all") {
    where.status = status;
  }

  const tickets = await prisma.ticket.findMany({
    where,
    orderBy: [{ slaDueAt: "asc" }, { createdAt: "desc" }],
    take: 200,
    include: {
      employee: { select: { name: true, email: true } },
      assignedTo: { select: { name: true } },
    },
  });

  const query = (overrides = {}) => {
    const params = new URLSearchParams({ status, dept, ...overrides });
    if (!params.get("dept")) params.delete("dept");
    return `/admin/tickets?${params.toString()}`;
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">All Tickets</h1>
        <p className="text-sm text-white/50 mt-1">
          {tickets.length} tickets across all departments
        </p>
      </div>

      <div className="flex gap-2 mb-3 flex-wrap">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={query({ status: t.key })}
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

      <div className="flex gap-2 mb-4 flex-wrap">
        <Link
          href={query({ dept: "" })}
          className={`text-xs px-3 py-1.5 rounded-full border transition ${
            !dept ? "bg-brand-500/20 border-brand-500/40" : "bg-white/5 border-white/10"
          }`}
        >
          All departments
        </Link>
        {DEPTS.map((d) => (
          <Link
            key={d}
            href={query({ dept: d })}
            className={`text-xs px-3 py-1.5 rounded-full border transition ${
              dept === d ? "bg-brand-500/20 border-brand-500/40" : "bg-white/5 border-white/10"
            }`}
          >
            {d.toUpperCase()}
          </Link>
        ))}
      </div>

      <TicketList tickets={tickets} basePath="/admin/tickets" />
    </div>
  );
}