export const STATUSES = [
  "open",
  "in_progress",
  "waiting_on_employee",
  "resolved",
  "closed",
];

export const ACTIVE_STATUSES = ["open", "in_progress", "waiting_on_employee"];

export const STATUS_LABEL = {
  open: "Open",
  in_progress: "In progress",
  waiting_on_employee: "Waiting on employee",
  resolved: "Resolved",
  closed: "Closed",
};

export const STATUS_TONE = {
  open: "info",
  in_progress: "warning",
  waiting_on_employee: "accent",
  resolved: "success",
  closed: "neutral",
};

export const TONE_CLASSES = {
  info: "bg-brand-500/15 text-brand-200 border-brand-500/25",
  warning: "bg-yellow-500/15 text-yellow-300 border-yellow-500/25",
  accent: "bg-purple-500/15 text-purple-300 border-purple-500/25",
  success: "bg-green-500/15 text-green-300 border-green-500/25",
  neutral: "bg-white/5 text-white/50 border-white/10",
  danger: "bg-red-500/15 text-red-300 border-red-500/25",
};

// Which status changes are allowed from which state.
// Keeps the workflow sane and prevents random jumps.
const TRANSITIONS = {
  open: ["in_progress", "waiting_on_employee", "resolved"],
  in_progress: ["waiting_on_employee", "resolved", "closed"],
  waiting_on_employee: ["in_progress", "resolved", "closed"],
  resolved: ["closed", "in_progress"],
  closed: [],
};

export function canTransition(from, to) {
  if (!from || !to) return false;
  if (from === to) return false;
  return (TRANSITIONS[from] || []).includes(to);
}