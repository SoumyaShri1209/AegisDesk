import { prisma } from "../prisma";
import { DEFAULT_SLA_HOURS, SLA_PRIORITIES } from "./sla";

// Returns a map { critical: 2, high: 8, medium: 24, low: 72 }
// for a company. Missing priorities fall back to defaults.
export async function getSlaHoursForCompany(companyId) {
  const rows = await prisma.slaSetting.findMany({
    where: { companyId },
    select: { priority: true, hours: true },
  });

  const map = { ...DEFAULT_SLA_HOURS };
  for (const row of rows) {
    if (SLA_PRIORITIES.includes(row.priority)) {
      map[row.priority] = row.hours;
    }
  }
  return map;
}

// Returns a single number for the given priority, using company overrides if present.
export async function getSlaHoursForPriority({ companyId, priority }) {
  const map = await getSlaHoursForCompany(companyId);
  return map[priority] ?? DEFAULT_SLA_HOURS.medium;
}

// Save a company's settings — upsert each priority row
export async function saveSlaHours({ companyId, hoursMap }) {
  const ops = SLA_PRIORITIES.map((priority) => {
    const hours = Math.max(1, Math.min(720, Math.round(hoursMap[priority]))); // clamp 1h – 30d
    return prisma.slaSetting.upsert({
      where: { companyId_priority: { companyId, priority } },
      create: { companyId, priority, hours },
      update: { hours },
    });
  });
  await prisma.$transaction(ops);
}