CREATE TABLE "AnswerFeedback" (
    "id"        TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "userId"    TEXT NOT NULL,
    "rating"    TEXT NOT NULL,
    "reason"    TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AnswerFeedback_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AnswerFeedback_messageId_userId_key"
    ON "AnswerFeedback"("messageId", "userId");

CREATE INDEX "AnswerFeedback_companyId_createdAt_idx"
    ON "AnswerFeedback"("companyId", "createdAt");

CREATE INDEX "AnswerFeedback_companyId_rating_idx"
    ON "AnswerFeedback"("companyId", "rating");

ALTER TABLE "AnswerFeedback"
    ADD CONSTRAINT "AnswerFeedback_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    ADD CONSTRAINT "AnswerFeedback_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "ChatMessage"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    ADD CONSTRAINT "AnswerFeedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;