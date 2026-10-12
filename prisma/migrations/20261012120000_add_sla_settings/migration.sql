CREATE TABLE "SlaSetting" (
    "id"        TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "priority"  TEXT NOT NULL,
    "hours"     INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SlaSetting_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "SlaSetting_companyId_priority_key"
    ON "SlaSetting"("companyId", "priority");

CREATE INDEX "SlaSetting_companyId_idx"
    ON "SlaSetting"("companyId");

ALTER TABLE "SlaSetting"
    ADD CONSTRAINT "SlaSetting_companyId_fkey"
    FOREIGN KEY ("companyId") REFERENCES "Company"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;