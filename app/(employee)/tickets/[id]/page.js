import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSlaState, formatRemaining } from "@/lib/tickets/sla";
import EmployeeReplyForm from "@/components/tickets/EmployeeReplyForm";
import { ArrowLeft, CheckCircle2, Clock, MessageSquare } from "lucide-react";

export default async function TicketDetailPage({ params }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  const ticket = await prisma.ticket.findFirst({
    where: {
      id,
      companyId: session.user.companyId,
      employeeId: session.user.id,
    },
    include: {
      replies: {
        where: { isInternal: false },
        orderBy: { createdAt: "asc" },
        include: { author: { select: { name: true, role: true } } },
      },
    },
  });

  if (!ticket) notFound();

  const sla = getSlaState(ticket);
  const statusLabel = ticket.status.replace(/_/g, " ");

  return (
    <div>
      <Link
        href="/tickets"
        className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white mb-4"
      >
        <ArrowLeft className="w-4 h-4" /> Back to my requests
      </Link>

      <div className="card p-5 mb-4">
        <div className="flex items-start gap-3 mb-3">
          <span className="text-xs px-2 py-0.5 rounded bg-white/5 text-white/60">
            T-{ticket.number}
          </span>
          <span className="text-xs uppercase tracking-wide text-white/60">
            {ticket.department}
          </span>
          <span className="ml-auto text-xs uppercase tracking-wide text-white/60">
            {ticket.priority}
          </span>
        </div>

        <h1 className="text-xl font-semibold mb-2">{ticket.title}</h1>
        <p className="text-sm text-white/60 mb-4">{ticket.reason}</p>

        <div className="flex flex-wrap gap-4 text-xs text-white/60">
          <span className="inline-flex items-center gap-1">
            <MessageSquare className="w-3.5 h-3.5" /> {statusLabel}
          </span>
          {!sla.done && (
            <span className={`inline-flex items-center gap-1 ${sla.breached ? "text-red-300" : ""}`}>
              <Clock className="w-3.5 h-3.5" />
              {sla.paused ? "SLA paused" : `SLA: ${formatRemaining(sla.remainingMs)}`}
            </span>
          )}
        </div>
      </div>

      {ticket.resolution && (
        <div className="card p-5 mb-4 border-green-500/30">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-4 h-4 text-green-400" />
            <span className="text-sm font-medium text-green-300">Resolved</span>
          </div>
          <p className="text-sm text-white/80 whitespace-pre-line">{ticket.resolution}</p>
        </div>
      )}

      <h2 className="text-sm font-medium text-white/60 mb-3">
        Conversation ({ticket.replies.length})
      </h2>

      {ticket.replies.length === 0 ? (
        <div className="card p-6 text-center text-sm text-white/50">
          No replies yet. A team member will respond soon.
        </div>
      ) : (
        <div className="space-y-3">
          {ticket.replies.map((r) => (
            <div key={r.id} className="card p-4">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs font-medium">{r.author.name}</span>
                <span className="text-xs text-white/40">{r.author.role}</span>
                <span className="ml-auto text-xs text-white/40">
                  {new Date(r.createdAt).toLocaleString()}
                </span>
              </div>
              <p className="text-sm whitespace-pre-line">{r.body}</p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4">
        <EmployeeReplyForm
          ticketId={ticket.id}
          disabled={ticket.status === "closed"}
        />
      </div>
    </div>
  );
}