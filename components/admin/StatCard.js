"use client";

import { motion } from "framer-motion";
import {
  Ticket,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  BookOpen,
  Users,
  BarChart3,
} from "lucide-react";

const ICONS = {
  ticket: Ticket,
  clock: Clock,
  check: CheckCircle2,
  alert: AlertTriangle,
  shield: ShieldCheck,
  book: BookOpen,
  users: Users,
  analytics: BarChart3,
};

export default function StatCard({
  icon,
  label,
  value,
  hint,
  tone = "brand",
}) {
  const Icon = ICONS[icon] || Ticket;

  const TONES = {
    brand: "bg-brand-500/15 text-brand-300",
    success: "bg-green-500/15 text-green-300",
    warning: "bg-yellow-500/15 text-yellow-300",
    danger: "bg-red-500/15 text-red-300",
  };
  const iconClass = TONES[tone] || TONES.brand;

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      className="card p-4 hover:border-brand-500/30"
    >
      <div className="flex items-center gap-2 mb-2">
        <div className={`p-1.5 rounded-lg ${iconClass}`}>
          <Icon className="w-4 h-4" />
        </div>
        <span className="text-xs text-white/50">{label}</span>
      </div>
      <div className="text-2xl font-semibold tabular-nums">{value}</div>
      {hint && <div className="text-xs text-white/40 mt-1">{hint}</div>}
    </motion.div>
  );
}