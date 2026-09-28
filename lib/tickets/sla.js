export const SLA_HOURS = {
  critical: 2,
  high: 8,
  medium: 24,
  low: 72,
};

export const SLA_LABEL = {
  critical: "2 hours",
  high: "8 hours",
  medium: "24 hours",
  low: "72 hours",
};

export function computeSlaDue(priority, from = new Date()) {
  const hours = SLA_HOURS[priority] ?? SLA_HOURS.medium;
  return new Date(from.getTime() + hours * 60 * 60 * 1000);
}

export function getSlaState(ticket) {
  if (ticket.status === "resolved" || ticket.status === "closed") {
    return { paused: false, breached: false, remainingMs: 0, done: true };
  }

  const paused = ticket.status === "waiting_on_employee";
  const now = paused && ticket.slaPausedAt
    ? new Date(ticket.slaPausedAt).getTime()
    : Date.now();

  const due =
    new Date(ticket.slaDueAt).getTime() + (ticket.slaPauseMs || 0);
  const remainingMs = due - now;

  return {
    paused,
    breached: remainingMs < 0,
    remainingMs,
    done: false,
  };
}

export function formatRemaining(remainingMs) {
  if (remainingMs <= 0) return "breached";
  const totalMin = Math.floor(remainingMs / 60000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h >= 24) {
    const d = Math.floor(h / 24);
    return `${d}d ${h % 24}h`;
  }
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}