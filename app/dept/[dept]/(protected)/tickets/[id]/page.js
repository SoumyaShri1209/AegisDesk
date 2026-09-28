import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../../../lib/auth";
import { prisma } from "../../../../../../lib/prisma";
import { StatusBadge, PriorityBadge } from "../../../../../../components/tickets/badges";
import SlaIndicator from "../../../../../../components/tickets/SlaIndicator";
import DeptTicketActions from "../../../../../../components/tickets/DeptTicketActions";
import { ArrowLeft, CheckCircle2, User as UserIcon } from "lucide-react";

export default async function DeptTicketDetail({ params }) {
  const { dept, id } = await params;

  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  if (session.user.role !== dept) redirect(`/dept/${session.user.role}/dashboard`);

  const ticket = await prisma.ticket.findFirst({
    where: {
      id,
      companyId: session.user.companyId,
      department: dept,
    },
    include: {
      employee: { select: { name: true, email: true } },
      assignedTo: { select: { name: true } },
      replies: {
        orderBy: { createdAt: "asc" },
        include: { author: { select: { name: true, role: true } } },
      },
    },
  });

  if (!ticket) notFound();

  return (
    <div className="max-w-4xl">
      <Link
        href={`/dept/${dept}/dashboard`}
        className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white mb-4"
      >
        <ArrowLeft className="w-4 h-4" /> Back to queue
      </Link>

      <div className="card p-5 mb-4">
        <div className="flex items-center gap-2 flex-wrap mb-2">
          <span className="text-xs px-2 py-0.5 rounded bg-white/5 text-white/60">
            T-{ticket.number}
          </span>
          <StatusBadge status={ticket.status} />
          <PriorityBadge priority={ticket.priority} />
          <span className="ml-auto text-xs">
            <SlaIndicator
              slaDueAt={ticket.slaDueAt}
              slaPausedAt={ticket.slaPausedAt}
              slaPauseMs={ticket.slaPauseMs}
              status={ticket.status}
            />
          </span>
        </div>
        <h1 className="text-xl font-semibold">{ticket.title}</h1>
        <p className="text-sm text-white/60 mt-1">{ticket.reason}</p>

        <div className="mt-4 flex flex-wrap gap-4 text-xs text-white/60">
          <span className="inline-flex items-center gap-1">
            <UserIcon className="w-3.5 h-3.5" /> {ticket.employee.name} ({ticket.employee.email})
          </span>
          {ticket.assignedTo?.name && <span>· Assigned to {ticket.assignedTo.name}</span>}
          <span>· Opened {new Date(ticket.createdAt).toLocaleString()}</span>
        </div>
      </div>

      {ticket.resolution && (
        <div className="card p-5 mb-4 border-green-500/30">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-4 h-4 text-green-400" />
            <span className="text-sm font-medium text-green-300">Resolution</span>
          </div>
          <p className="text-sm whitespace-pre-line">{ticket.resolution}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <h2 className="text-sm font-medium text-white/60 mb-3">
            Conversation ({ticket.replies.length})
          </h2>
          {ticket.replies.length === 0 ? (
            <div className="card p-6 text-center text-sm text-white/50">
              No replies yet.
            </div>
          ) : (
            <div className="space-y-3">
              {ticket.replies.map((r) => (
                <div
                  key={r.id}
                  className={`card p-4 ${
                    r.isInternal ? "border-yellow-500/25 bg-yellow-500/5" : ""
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs font-medium">{r.author.name}</span>
                    <span className="text-xs text-white/40">{r.author.role}</span>
                    {r.isInternal && (
                      <span className="text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-yellow-500/15 text-yellow-300">
                        internal
                      </span>
                    )}
                    <span className="ml-auto text-xs text-white/40">
                      {new Date(r.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm whitespace-pre-line">{r.body}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <DeptTicketActions ticket={ticket} />
        </div>
      </div>
    </div>
  );
}