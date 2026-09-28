import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSlaState, formatRemaining } from "@/lib/tickets/sla";
import { Ticket as TicketIcon, Cpu, Shield, DollarSign, Users } from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";

const DEPT_ICON = { it: Cpu, security: Shield, finance: DollarSign, manager: Users };

const STATUS_STYLE = {
  open: "bg-brand-500/15 text-brand-200 border-brand-500/25",
  in_progress: "bg-yellow-500/15 text-yellow-300 border-yellow-500/25",
  waiting_on_employee: "bg-purple-500/15 text-purple-300 border-purple-500/25",
  resolved: "bg-green-500/15 text-green-300 border-green-500/25",
  closed: "bg-white/5 text-white/50 border-white/10",
};

export default async function TicketsPage() {
  const session = await getServerSession(authOptions);

  const tickets = await prisma.ticket.findMany({
    where: { companyId: session.user.companyId, employeeId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">My requests</h1>
        <p className="text-sm text-white/50 mt-1">
          {tickets.length} {tickets.length === 1 ? "ticket" : "tickets"}
        </p>
      </div>

      {tickets.length === 0 ? (
        <EmptyState
          icon={TicketIcon}
          title="No requests yet"
          description="When the AI escalates something, it will appear here."
          action={
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-500 hover:bg-brand-600 transition text-sm"
            >
              Ask the AI
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {tickets.map((t) => {
            const sla = getSlaState(t);
            const Icon = DEPT_ICON[t.department] || TicketIcon;
            const sstyle = STATUS_STYLE[t.status] || STATUS_STYLE.open;
            return (
              <Link
                key={t.id}
                href={`/tickets/${t.id}`}
                className="card block p-4 hover:border-brand-500/40 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-brand-500/15 shrink-0">
                    <Icon className="w-4 h-4 text-brand-300" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs px-2 py-0.5 rounded bg-white/5 text-white/60">
                        T-{t.number}
                      </span>
                      <h3 className="font-medium truncate">{t.title}</h3>
                      <span className={`text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded border ${sstyle}`}>
                        {t.status.replace(/_/g, " ")}
                      </span>
                    </div>
                    <div className="mt-1 text-xs text-white/40 flex items-center gap-3 flex-wrap">
                      <span>{(t.department || "").toUpperCase()}</span>
                      <span>·</span>
                      <span>{t.priority}</span>
                      {!sla.done && (
                        <>
                          <span>·</span>
                          <span className={sla.breached ? "text-red-300" : ""}>
                            {sla.paused ? "SLA paused" : `SLA: ${formatRemaining(sla.remainingMs)}`}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}