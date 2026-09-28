ALTER TABLE "Company" ADD COLUMN "ticketCounter" INTEGER NOT NULL DEFAULT 1000;

CREATE TABLE "Ticket" (
    "id"            TEXT NOT NULL,
    "number"        INTEGER NOT NULL,
    "companyId"     TEXT NOT NULL,
    "employeeId"    TEXT NOT NULL,
    "department"    TEXT NOT NULL,
    "priority"      TEXT NOT NULL,
    "title"         TEXT NOT NULL,
    "reason"        TEXT NOT NULL,
    "status"        TEXT NOT NULL DEFAULT 'open',
    "slaDueAt"      TIMESTAMP(3) NOT NULL,
    "slaPausedAt"   TIMESTAMP(3),
    "slaPauseMs"    INTEGER NOT NULL DEFAULT 0,
    "assignedToId"  TEXT,
    "resolution"    TEXT,
    "resolvedAt"    TIMESTAMP(3),
    "closedAt"      TIMESTAMP(3),
    "chatSessionId" TEXT,
    "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Ticket_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Ticket_companyId_number_key" ON "Ticket"("companyId", "number");
CREATE INDEX "Ticket_companyId_idx"           ON "Ticket"("companyId");
CREATE INDEX "Ticket_companyId_department_idx" ON "Ticket"("companyId", "department");
CREATE INDEX "Ticket_companyId_employeeId_idx" ON "Ticket"("companyId", "employeeId");
CREATE INDEX "Ticket_companyId_status_idx"     ON "Ticket"("companyId", "status");

CREATE TABLE "TicketReply" (
    "id"         TEXT NOT NULL,
    "ticketId"   TEXT NOT NULL,
    "authorId"   TEXT NOT NULL,
    "body"       TEXT NOT NULL,
    "isInternal" BOOLEAN NOT NULL DEFAULT false,
    "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TicketReply_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "TicketReply_ticketId_idx" ON "TicketReply"("ticketId");

CREATE TABLE "ChatSession" (
    "id"        TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "userId"    TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ChatSession_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "ChatSession_companyId_userId_key" ON "ChatSession"("companyId", "userId");
CREATE INDEX "ChatSession_companyId_idx" ON "ChatSession"("companyId");
CREATE INDEX "ChatSession_userId_idx"    ON "ChatSession"("userId");

CREATE TABLE "ChatMessage" (
    "id"        TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "role"      TEXT NOT NULL,
    "content"   TEXT NOT NULL,
    "meta"      JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "ChatMessage_sessionId_idx" ON "ChatMessage"("sessionId");

ALTER TABLE "Ticket"
    ADD CONSTRAINT "Ticket_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    ADD CONSTRAINT "Ticket_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    ADD CONSTRAINT "Ticket_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    ADD CONSTRAINT "Ticket_chatSessionId_fkey" FOREIGN KEY ("chatSessionId") REFERENCES "ChatSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "TicketReply"
    ADD CONSTRAINT "TicketReply_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    ADD CONSTRAINT "TicketReply_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ChatSession"
    ADD CONSTRAINT "ChatSession_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    ADD CONSTRAINT "ChatSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ChatMessage"
    ADD CONSTRAINT "ChatMessage_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "ChatSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;