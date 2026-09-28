import { TONE_CLASSES, STATUS_LABEL, STATUS_TONE } from "../../lib/tickets/status";

const PRIORITY_TONE = {
  low: "success",
  medium: "warning",
  high: "danger",
  critical: "danger",
};

const PRIORITY_LABEL = {
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical",
};

export function StatusBadge({ status }) {
  const tone = STATUS_TONE[status] || "neutral";
  const label = STATUS_LABEL[status] || status;
  return (
    <span className={`text-[10px] uppercase tracking-wide px-2 py-0.5 rounded border ${TONE_CLASSES[tone]}`}>
      {label}
    </span>
  );
}

export function PriorityBadge({ priority }) {
  const tone = PRIORITY_TONE[priority] || "neutral";
  const label = PRIORITY_LABEL[priority] || priority;
  return (
    <span className={`text-[10px] uppercase tracking-wide px-2 py-0.5 rounded border ${TONE_CLASSES[tone]}`}>
      {label}
    </span>
  );
}