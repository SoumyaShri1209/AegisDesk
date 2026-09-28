"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

function format(ms) {
  if (ms <= 0) return "breached";
  const min = Math.floor(ms / 60000);
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h >= 24) {
    const d = Math.floor(h / 24);
    return `${d}d ${h % 24}h`;
  }
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export default function SlaIndicator({ slaDueAt, slaPausedAt, slaPauseMs = 0, status }) {
  const [now, setNow] = useState(null);

  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(t);
  }, []);

  if (status === "resolved" || status === "closed") {
    return (
      <span className="text-xs text-white/40 inline-flex items-center gap-1">
        <Clock className="w-3 h-3" /> SLA done
      </span>
    );
  }

  const paused = status === "waiting_on_employee";

  // Before mount: render a stable placeholder so SSR and hydration match
  if (now === null) {
    return (
      <span className="text-xs text-white/40 inline-flex items-center gap-1">
        <Clock className="w-3 h-3" /> {paused ? "SLA paused" : "SLA —"}
      </span>
    );
  }

  const reference = paused && slaPausedAt ? new Date(slaPausedAt).getTime() : now;
  const due = new Date(slaDueAt).getTime() + (slaPauseMs || 0);
  const remaining = due - reference;
  const breached = remaining < 0;

  return (
    <span
      className={`text-xs inline-flex items-center gap-1 ${
        breached ? "text-red-300" : paused ? "text-white/40" : "text-white/60"
      }`}
    >
      <Clock className="w-3 h-3" />
      {paused ? "SLA paused" : breached ? "SLA breached" : `SLA: ${format(remaining)}`}
    </span>
  );
}