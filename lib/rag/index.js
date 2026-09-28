import crypto from "node:crypto";
import { prisma } from "../prisma";
import { chunkText } from "./chunk";
import { embedBatch } from "../llm/client";

export async function indexPolicy(policy) {
  await prisma.$executeRaw`
    DELETE FROM "PolicyChunk"
    WHERE "policyId" = ${policy.id}
  `;

  const chunks = chunkText(policy.content);
  if (chunks.length === 0) return { chunks: 0 };

  const embeddings = await embedBatch(chunks);

  await prisma.$transaction(
    chunks.map((content, i) => {
      const vector = `[${embeddings[i].join(",")}]`;
      const id = crypto.randomUUID();
      return prisma.$executeRaw`
        INSERT INTO "PolicyChunk"
          ("id", "policyId", "companyId", "chunkIndex", "content", "embedding")
        VALUES
          (${id}, ${policy.id}, ${policy.companyId}, ${i}, ${content}, ${vector}::vector)
      `;
    })
  );

  return { chunks: chunks.length };
}

export async function removePolicyIndex(policyId) {
  await prisma.$executeRaw`
    DELETE FROM "PolicyChunk"
    WHERE "policyId" = ${policyId}
  `;
}

export async function reindexCompany(companyId) {
  const policies = await prisma.policy.findMany({
    where: { companyId, active: true },
  });

  let totalChunks = 0;
  for (const policy of policies) {
    const { chunks } = await indexPolicy(policy);
    totalChunks += chunks;
  }

  return { policies: policies.length, chunks: totalChunks };
}