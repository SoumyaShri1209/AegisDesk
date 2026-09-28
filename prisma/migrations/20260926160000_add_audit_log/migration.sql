-- Audit log table
CREATE TABLE "AuditLog" (
    "id"         TEXT NOT NULL,
    "companyId"  TEXT NOT NULL,
    "actorId"    TEXT,
    "action"     TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId"   TEXT NOT NULL,
    "metadata"   JSONB,
    "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "AuditLog_companyId_idx"           ON "AuditLog"("companyId");
CREATE INDEX "AuditLog_companyId_createdAt_idx" ON "AuditLog"("companyId", "createdAt");
CREATE INDEX "AuditLog_companyId_entityType_entityId_idx"
    ON "AuditLog"("companyId", "entityType", "entityId");

ALTER TABLE "AuditLog"
    ADD CONSTRAINT "AuditLog_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    ADD CONSTRAINT "AuditLog_actorId_fkey"   FOREIGN KEY ("actorId")   REFERENCES "User"("id")    ON DELETE SET NULL ON UPDATE CASCADE;

-- Ticket escalation timestamp
ALTER TABLE "Ticket" ADD COLUMN IF NOT EXISTS "escalatedAt" TIMESTAMP(3);