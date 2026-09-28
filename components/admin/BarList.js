"use client";

import { motion } from "framer-motion";

const TONES = {
  brand: "bg-brand-500",
  success: "bg-green-500",
  warning: "bg-yellow-500",
  danger: "bg-red-500",
  neutral: "bg-white/20",
};

const LABELS = {
  open: "Open",
  in_progress: "In progress",
  waiting_on_employee: "Waiting on employee",
  resolved: "Resolved",
  closed: "Closed",
  it: "IT",
  security: "Security",
  finance: "Finance",
  manager: "Manager",
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical",
};

const TONE_MAP = {
  open: "brand",
  in_progress: "warning",
  waiting_on_employee: "neutral",
  resolved: "success",
  closed: "neutral",
  low: "success",
  medium: "warning",
  high: "danger",
  critical: "danger",
};

export default function BarList({ title, items, emptyText = "No data yet" }) {
  const max = Math.max(1, ...items.map((i) => i.count));

  return (
    <div className="card p-4">
      <h3 className="text-sm font-medium mb-4">{title}</h3>
      {items.length === 0 ? (
        <p className="text-xs text-white/40">{emptyText}</p>
      ) : (
        <div className="space-y-3">
          {items.map((item, idx) => {
            const pct = Math.round((item.count / max) * 100);
            const tone = TONES[TONE_MAP[item.key] || "brand"];
            return (
              <div key={item.key}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-white/70">
                    {LABELS[item.key] || item.key}
                  </span>
                  <span className="text-white/40 tabular-nums">
                    {item.count}
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <motion.div
                    className={`h-full ${tone}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{
                      duration: 0.5,
                      delay: idx * 0.05,
                      ease: "easeOut",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}