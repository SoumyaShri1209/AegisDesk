import { prisma } from "../prisma";
import { embedText } from "../llm/client";

export async function retrieveRelevantChunks({ companyId, query, topK = 5 }) {
  if (!query || !query.trim()) return [];

  const queryEmbedding = await embedText(query.trim());
  const vector = `[${queryEmbedding.join(",")}]`;

  const rows = await prisma.$queryRaw`
    SELECT
      pc."id",
      pc."policyId",
      pc."content",
      pc."chunkIndex",
      1 - (pc."embedding" <=> ${vector}::vector) AS similarity,
      p."code"       AS "policyCode",
      p."title"      AS "policyTitle",
      p."department" AS "policyDepartment",
      p."priorityHint" AS "policyPriority"
    FROM "PolicyChunk" pc
    JOIN "Policy" p ON p."id" = pc."policyId"
    WHERE pc."companyId" = ${companyId}
      AND p."active" = true
    ORDER BY pc."embedding" <=> ${vector}::vector
    LIMIT ${topK}
  `;

  return rows;
}