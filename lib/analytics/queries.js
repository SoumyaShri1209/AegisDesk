// import { prisma } from "../prisma";

// export async function getCompanyAnalytics({ companyId, days = 14 }) {
//   const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

//   const [
//     totalTickets,
//     openTickets,
//     breachedTickets,
//     byStatus,
//     byDepartment,
//     byPriority,
//     resolvedRecent,
//     recentTickets,
//   ] = await Promise.all([
//     prisma.ticket.count({ where: { companyId } }),

//     prisma.ticket.count({
//       where: {
//         companyId,
//         status: { in: ["open", "in_progress", "waiting_on_employee"] },
//       },
//     }),

//     prisma.ticket.count({
//       where: { companyId, escalatedAt: { not: null } },
//     }),

//     prisma.ticket.groupBy({
//       by: ["status"],
//       where: { companyId },
//       _count: true,
//     }),

//     prisma.ticket.groupBy({
//       by: ["department"],
//       where: { companyId },
//       _count: true,
//     }),

//     prisma.ticket.groupBy({
//       by: ["priority"],
//       where: { companyId },
//       _count: true,
//     }),

//     prisma.ticket.findMany({
//       where: {
//         companyId,
//         resolvedAt: { not: null },
//         createdAt: { gte: since },
//       },
//       select: {
//         createdAt: true,
//         resolvedAt: true,
//         slaDueAt: true,
//         slaPauseMs: true,
//       },
//     }),

//     prisma.ticket.findMany({
//       where: { companyId, createdAt: { gte: since } },
//       select: { createdAt: true },
//     }),
//   ]);

//   const onTime = resolvedRecent.filter((t) => {
//     const due = new Date(t.slaDueAt).getTime() + (t.slaPauseMs || 0);
//     return new Date(t.resolvedAt).getTime() <= due;
//   }).length;

//   const slaCompliance = resolvedRecent.length
//     ? Math.round((onTime / resolvedRecent.length) * 100)
//     : null;

//   const avgResolutionMs = resolvedRecent.length
//     ? Math.round(
//         resolvedRecent.reduce(
//           (sum, t) =>
//             sum +
//             (new Date(t.resolvedAt).getTime() -
//               new Date(t.createdAt).getTime()),
//           0
//         ) / resolvedRecent.length
//       )
//     : null;

//   return {
//     totalTickets,
//     openTickets,
//     breachedTickets,
//     resolvedCount: resolvedRecent.length,
//     slaCompliance,
//     avgResolutionMs,
//     byStatus: byStatus.map((r) => ({ key: r.status, count: r._count })),
//     byDepartment: byDepartment.map((r) => ({
//       key: r.department,
//       count: r._count,
//     })),
//     byPriority: byPriority.map((r) => ({ key: r.priority, count: r._count })),
//     trend: buildDailyTrend(recentTickets, days),
//     days,
//   };
// }

// function buildDailyTrend(tickets, days) {
//   const buckets = {};
//   const today = new Date();
//   today.setHours(0, 0, 0, 0);

//   for (let i = days - 1; i >= 0; i--) {
//     const d = new Date(today);
//     d.setDate(d.getDate() - i);
//     const key = d.toISOString().slice(0, 10);
//     buckets[key] = 0;
//   }

//   for (const t of tickets) {
//     const d = new Date(t.createdAt);
//     d.setHours(0, 0, 0, 0);
//     const key = d.toISOString().slice(0, 10);
//     if (key in buckets) buckets[key]++;
//   }

//   return Object.entries(buckets).map(([date, count]) => ({ date, count }));
// }













import { prisma } from "../prisma";

export async function getCompanyAnalytics({ companyId, days = 14 }) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const [
    totalTickets,
    openTickets,
    breachedTickets,
    byStatus,
    byDepartment,
    byPriority,
    resolvedRecent,
    recentTickets,
    answeredMessages,
    feedbackGroups,
  ] = await Promise.all([
    prisma.ticket.count({ where: { companyId } }),

    prisma.ticket.count({
      where: {
        companyId,
        status: { in: ["open", "in_progress", "waiting_on_employee"] },
      },
    }),

    prisma.ticket.count({
      where: { companyId, escalatedAt: { not: null } },
    }),

    prisma.ticket.groupBy({
      by: ["status"],
      where: { companyId },
      _count: true,
    }),

    prisma.ticket.groupBy({
      by: ["department"],
      where: { companyId },
      _count: true,
    }),

    prisma.ticket.groupBy({
      by: ["priority"],
      where: { companyId },
      _count: true,
    }),

    prisma.ticket.findMany({
      where: {
        companyId,
        resolvedAt: { not: null },
        createdAt: { gte: since },
      },
      select: {
        createdAt: true,
        resolvedAt: true,
        slaDueAt: true,
        slaPauseMs: true,
      },
    }),

    prisma.ticket.findMany({
      where: { companyId, createdAt: { gte: since } },
      select: { createdAt: true },
    }),

    prisma.chatMessage.findMany({
      where: {
        session: { companyId },
        role: "assistant",
        createdAt: { gte: since },
      },
      select: { meta: true },
    }),

    prisma.answerFeedback.groupBy({
      by: ["rating"],
      where: { companyId, createdAt: { gte: since } },
      _count: true,
    }),
  ]);

  const onTime = resolvedRecent.filter((t) => {
    const due = new Date(t.slaDueAt).getTime() + (t.slaPauseMs || 0);
    return new Date(t.resolvedAt).getTime() <= due;
  }).length;

  const slaCompliance = resolvedRecent.length
    ? Math.round((onTime / resolvedRecent.length) * 100)
    : null;

  const avgResolutionMs = resolvedRecent.length
    ? Math.round(
        resolvedRecent.reduce(
          (sum, t) =>
            sum +
            (new Date(t.resolvedAt).getTime() -
              new Date(t.createdAt).getTime()),
          0
        ) / resolvedRecent.length
      )
    : null;

  const confidenceValues = answeredMessages
    .map((m) =>
      m.meta && typeof m.meta === "object" ? m.meta.confidence : null
    )
    .filter((v) => typeof v === "number");

  const avgConfidence = confidenceValues.length
    ? Math.round(
        confidenceValues.reduce((a, b) => a + b, 0) / confidenceValues.length
      )
    : null;

  const lowConfidenceCount = confidenceValues.filter((v) => v < 60).length;

  const upCount =
    feedbackGroups.find((g) => g.rating === "up")?._count ?? 0;
  const downCount =
    feedbackGroups.find((g) => g.rating === "down")?._count ?? 0;
  const totalVotes = upCount + downCount;
  const accuracy =
    totalVotes > 0 ? Math.round((upCount / totalVotes) * 100) : null;

  return {
    totalTickets,
    openTickets,
    breachedTickets,
    resolvedCount: resolvedRecent.length,
    slaCompliance,
    avgResolutionMs,
    avgConfidence,
    lowConfidenceCount,
    feedbackUp: upCount,
    feedbackDown: downCount,
    accuracy,
    byStatus: byStatus.map((r) => ({ key: r.status, count: r._count })),
    byDepartment: byDepartment.map((r) => ({
      key: r.department,
      count: r._count,
    })),
    byPriority: byPriority.map((r) => ({ key: r.priority, count: r._count })),
    trend: buildDailyTrend(recentTickets, days),
    days,
  };
}

function buildDailyTrend(tickets, days) {
  const buckets = {};
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    buckets[key] = 0;
  }

  for (const t of tickets) {
    const d = new Date(t.createdAt);
    d.setHours(0, 0, 0, 0);
    const key = d.toISOString().slice(0, 10);
    if (key in buckets) buckets[key]++;
  }

  return Object.entries(buckets).map(([date, count]) => ({ date, count }));
}