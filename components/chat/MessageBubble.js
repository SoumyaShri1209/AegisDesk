"use client";

import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  User,
  Bot,
  Ticket,
  HelpCircle,
  BookOpen,
  Shield,
  Cpu,
  DollarSign,
  Users,
  ArrowUpRight,
} from "lucide-react";

const DEPT_ICON = {
  it: Cpu,
  security: Shield,
  finance: DollarSign,
  manager: Users,
};

const PRIORITY_STYLE = {
  low: "bg-green-500/15 text-green-300 border-green-500/25",
  medium: "bg-yellow-500/15 text-yellow-300 border-yellow-500/25",
  high: "bg-orange-500/15 text-orange-300 border-orange-500/25",
  critical: "bg-red-500/15 text-red-300 border-red-500/25",
};

const MARKDOWN_COMPONENTS = {
  p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
  strong: ({ children }) => (
    <strong className="font-semibold text-white">{children}</strong>
  ),
  em: ({ children }) => <em className="italic text-white/80">{children}</em>,
  ul: ({ children }) => (
    <ul className="list-disc pl-5 my-2 space-y-1 marker:text-brand-300">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal pl-5 my-2 space-y-1 marker:text-brand-300">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  h1: ({ children }) => <h1 className="text-base font-semibold mt-3 mb-1">{children}</h1>,
  h2: ({ children }) => <h2 className="text-sm font-semibold mt-3 mb-1">{children}</h2>,
  h3: ({ children }) => <h3 className="text-sm font-medium mt-2 mb-1">{children}</h3>,
  code: ({ children }) => (
    <code className="px-1.5 py-0.5 rounded bg-white/10 text-xs font-mono">{children}</code>
  ),
  a: ({ href, children }) => (
    <a href={href} className="text-brand-300 underline underline-offset-2" target="_blank" rel="noreferrer">
      {children}
    </a>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-2 border-brand-500/40 pl-3 my-2 text-white/70 italic">
      {children}
    </blockquote>
  ),
};

export default function MessageBubble({ message }) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] flex items-start gap-2">
          <div className="rounded-2xl rounded-tr-sm bg-brand-500 text-white px-4 py-2 text-sm whitespace-pre-line">
            {message.text}
          </div>
          <div className="p-2 rounded-lg bg-brand-500/15 shrink-0">
            <User className="w-4 h-4 text-brand-300" />
          </div>
        </div>
      </div>
    );
  }

  const meta = message.meta || {};
  const type = meta.type;
  const hasText = message.text && message.text.trim().length > 0;

  return (
    <div className="flex justify-start">
      <div className="max-w-[85%] flex items-start gap-2">
        <div className="p-2 rounded-lg bg-white/5 shrink-0">
          <Bot className="w-4 h-4 text-white/60" />
        </div>
        <div className="space-y-3 min-w-0">
          {hasText && (
            <div className="rounded-2xl rounded-tl-sm bg-white/5 border border-white/10 px-4 py-3 text-sm">
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={MARKDOWN_COMPONENTS}>
                {message.text}
              </ReactMarkdown>
            </div>
          )}

          {type === "answer" && meta.citations?.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {meta.citations.map((c) => (
                <span
                  key={c}
                  className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-brand-500/10 border border-brand-500/25 text-brand-200"
                >
                  <BookOpen className="w-3 h-3" />
                  {c}
                </span>
              ))}
            </div>
          )}

          {type === "clarify" && (
            <div className="inline-flex items-center gap-1 text-xs text-white/50">
              <HelpCircle className="w-3 h-3" />
              Reply below with your answers
            </div>
          )}

          {type === "escalate" && meta.ticket && (
            <TicketCard
              ticket={meta.ticket}
              ticketNumber={meta.ticketNumber}
              ticketId={meta.ticketId}
            />
          )}

          {type === "ticket_reply" && meta.ticketNumber && (
            <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-brand-500/10 border border-brand-500/25 text-brand-200">
              Reply on T-{meta.ticketNumber}
            </span>
          )}

          {type === "resolution" && meta.ticketNumber && (
            <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-green-500/15 border border-green-500/25 text-green-300">
              ✅ T-{meta.ticketNumber} resolved
            </span>
          )}

          {message.sources?.length > 0 && <SourcesList sources={message.sources} />}
        </div>
      </div>
    </div>
  );
}

function TicketCard({ ticket, ticketNumber, ticketId }) {
  const Icon = DEPT_ICON[ticket.department] || Ticket;
  const pri = PRIORITY_STYLE[ticket.priority] || PRIORITY_STYLE.low;

  const heading = ticketNumber ? `Ticket T-${ticketNumber}` : "Ticket";

  return (
    <div className="card p-3 border border-white/10 max-w-md">
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1.5 rounded bg-brand-500/15">
          <Icon className="w-3.5 h-3.5 text-brand-300" />
        </div>
        <span className="text-xs font-medium uppercase tracking-wide text-white/70">
          {heading} · {(ticket.department || "").toUpperCase()}
        </span>
        <span
          className={`ml-auto text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded border ${pri}`}
        >
          {ticket.priority}
        </span>
      </div>

      <p className="text-sm font-medium">{ticket.title}</p>
      <p className="text-xs text-white/50 mt-1">{ticket.reason}</p>

      {ticketId && (
        <Link
          href={`/tickets/${ticketId}`}
          className="mt-3 inline-flex items-center gap-1 text-xs text-brand-300 hover:text-brand-200"
        >
          View ticket <ArrowUpRight className="w-3 h-3" />
        </Link>
      )}
    </div>
  );
}

function SourcesList({ sources }) {
  return (
    <details className="text-xs text-white/50">
      <summary className="cursor-pointer hover:text-white/80">
        Sources ({sources.length})
      </summary>
      <ul className="mt-1.5 space-y-1">
        {sources.map((s) => (
          <li key={s.policyId} className="flex items-center gap-2">
            <span className="text-white/30">·</span>
            <span>
              {s.code ? `${s.code} — ` : ""}
              {s.title}
            </span>
            <span className="text-white/30 ml-auto">
              {(s.similarity * 100).toFixed(0)}%
            </span>
          </li>
        ))}
      </ul>
    </details>
  );
}