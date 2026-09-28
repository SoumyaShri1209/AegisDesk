-- Enable pgvector (Supabase already has it, this is a no-op if so)
CREATE EXTENSION IF NOT EXISTS vector;

-- Chunks table
CREATE TABLE "PolicyChunk" (
    "id"         TEXT NOT NULL,
    "policyId"   TEXT NOT NULL,
    "companyId"  TEXT NOT NULL,
    "chunkIndex" INTEGER NOT NULL,
    "content"    TEXT NOT NULL,
    "embedding"  vector(768),
    "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PolicyChunk_pkey" PRIMARY KEY ("id")
);

-- Indexes
CREATE INDEX "PolicyChunk_companyId_idx" ON "PolicyChunk"("companyId");
CREATE INDEX "PolicyChunk_policyId_idx"  ON "PolicyChunk"("policyId");

-- ANN index for fast similarity search
CREATE INDEX "PolicyChunk_embedding_idx"
  ON "PolicyChunk"
  USING hnsw ("embedding" vector_cosine_ops);

-- Foreign keys with cascade delete
ALTER TABLE "PolicyChunk"
  ADD CONSTRAINT "PolicyChunk_policyId_fkey"
  FOREIGN KEY ("policyId") REFERENCES "Policy"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "PolicyChunk"
  ADD CONSTRAINT "PolicyChunk_companyId_fkey"
  FOREIGN KEY ("companyId") REFERENCES "Company"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;