import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { History, FileText, Ticket as TicketIcon, User as UserIcon } from "lucide-react";

const ACTION_LABEL = {
  "ticket.created": "Ticket created",
  "ticket.replied": "Dept reply sent",
  "ticket.internal_note_added": "Internal note added",
  "ticket.employee_replied": "Employee replied",
  "ticket.status_open": "Status → open",
  "ticket.status_in_progress": "Status → in progress",
  "ticket.status_waiting_on_employee": "Status → waiting on employee",
  "ticket.status_resolved": "Status → resolved",
  "ticket.status_closed": "Status → closed",
  "ticket.sla_breached": "SLA breached",
  "policy.created": "Policy created",
  "policy.updated": "Policy updated",
  "policy.deleted": "Policy deleted",
  "user.created": "User created",
};

const ACTION_TONE = {
  "ticket.created": "bg-brand-500/15 text-brand-200 border-brand-500/25",
  "ticket.replied": "bg-green-500/15 text-green-300 border-green-500/25",
  "ticket.internal_note_added": "bg-yellow-500/15 text-yellow-300 border-yellow-500/25",
  "ticket.employee_replied": "bg-purple-500/15 text-purple-300 border-purple-500/25",
  "ticket.sla_breached": "bg-red-500/15 text-red-300 border-red-500/25",
};

function tone(action) {
  if (ACTION_TONE[action]) return ACTION_TONE[action];
  if (action.startsWith("ticket.status_")) return "bg-white/5 text-white/60 border-white/10";
  return "bg-white/5 text-white/60 border-white/10";
}

function EntityIcon({ type }) {
  if (type === "ticket") return <TicketIcon className="w-3.5 h-3.5" />;
  if (type === "policy") return <FileText className="w-3.5 h-3.5" />;
  if (type === "user") return <UserIcon className="w-3.5 h-3.5" />;
  return <History className="w-3.5 h-3.5" />;
}

export default async function AuditPage() {
  const session = await getServerSession(authOptions);
  const companyId = session.user.companyId;

  const logs = await prisma.auditLog.findMany({
    where: { companyId },
    orderBy: { createdAt: "desc" },
    take: 200,
    include: {
      actor: { select: { name: true, email: true, role: true } },
    },
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Audit log</h1>
        <p className="text-sm text-white/50 mt-1">
          Last {logs.length} events in your company
        </p>
      </div>

      {logs.length === 0 ? (
        <div className="card p-10 text-center">
          <div className="mx-auto w-12 h-12 rounded-xl bg-brand-500/15 flex items-center justify-center mb-4">
            <History className="w-6 h-6 text-brand-300" />
          </div>
          <h2 className="font-medium">No events yet</h2>
          <p className="text-sm text-white/50 mt-1">
            Actions across your company will show up here.
          </p>
        </div>
      ) : (
        <div className="card divide-y divide-white/5">
          {logs.map((log) => (
            <div key={log.id} className="p-4 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-white/5 shrink-0">
                <EntityIcon type={log.entityType} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded border ${tone(log.action)}`}
                  >
                    {ACTION_LABEL[log.action] || log.action}
                  </span>
                  {log.metadata?.number && (
                    <span className="text-xs text-white/40">
                      T-{log.metadata.number}
                    </span>
                  )}
                  <span className="ml-auto text-xs text-white/40">
                    {new Date(log.createdAt).toLocaleString()}
                  </span>
                </div>
                <div className="mt-1 text-sm text-white/70">
                  {log.actor ? (
                    <>
                      <span className="text-white">{log.actor.name}</span>
                      <span className="text-white/40"> · {log.actor.role}</span>
                    </>
                  ) : (
                    <span className="text-white/40 italic">system</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}