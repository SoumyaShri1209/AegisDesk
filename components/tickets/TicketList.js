"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Cpu, Shield, DollarSign, Users, Ticket as TicketIcon } from "lucide-react";
import { StatusBadge, PriorityBadge } from "./badges";
import SlaIndicator from "./SlaIndicator";

const DEPT_ICON = {
  it: Cpu,
  security: Shield,
  finance: DollarSign,
  manager: Users,
};

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: "easeOut" } },
};

export default function TicketList({ tickets, basePath }) {
  if (!tickets.length) {
    return (
      <div className="card p-10 text-center">
        <div className="mx-auto w-12 h-12 rounded-xl bg-brand-500/15 flex items-center justify-center mb-4">
          <TicketIcon className="w-6 h-6 text-brand-300" />
        </div>
        <h2 className="font-medium">No tickets here</h2>
        <p className="text-sm text-white/50 mt-1">
          When a ticket comes in, it will show up here.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-3"
    >
      {tickets.map((t) => {
        const Icon = DEPT_ICON[t.department] || TicketIcon;
        return (
          <motion.div key={t.id} variants={item}>
            <Link
              href={`${basePath}/${t.id}`}
              className="card block p-4 transition-colors hover:border-brand-500/40 hover:bg-white/[0.03]"
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
                    <StatusBadge status={t.status} />
                    <PriorityBadge priority={t.priority} />
                  </div>
                  <div className="mt-2 text-xs text-white/50 flex flex-wrap gap-3 items-center">
                    <span>{(t.department || "").toUpperCase()}</span>
                    {t.employee?.name && <span>· {t.employee.name}</span>}
                    {t.assignedTo?.name && (
                      <span>· assigned to {t.assignedTo.name}</span>
                    )}
                    <span>·</span>
                    <SlaIndicator
                      slaDueAt={t.slaDueAt}
                      slaPausedAt={t.slaPausedAt}
                      slaPauseMs={t.slaPauseMs}
                      status={t.status}
                    />
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        );
      })}
    </motion.div>
  );
}