import { prisma } from "../prisma";

export async function logAudit({
  companyId,
  actorId,
  action,
  entityType,
  entityId,
  metadata,
}) {
  console.log("[audit] called:", action, entityType, entityId);
  try {
    const row = await prisma.auditLog.create({
      data: {
        companyId,
        actorId: actorId || null,
        action,
        entityType,
        entityId,
        metadata: metadata ?? null,
      },
    });
    console.log("[audit] written:", row.id);
    return row;
  } catch (err) {
    console.error("[audit] failed:", err);
    return null;
  }
}