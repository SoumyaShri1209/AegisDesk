import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../../lib/auth";
import { prisma } from "../../../../../lib/prisma";
import PolicyEditor from "./PolicyEditor";

export default async function EditPolicyPage({ params }) {
  const session = await getServerSession(authOptions);
  const { id } = await params;

  const policy = await prisma.policy.findFirst({
    where: { id, companyId: session.user.companyId },
  });

  if (!policy) notFound();

  return (
    <PolicyEditor
      policy={{
        id: policy.id,
        code: policy.code || "",
        title: policy.title,
        content: policy.content,
        department: policy.department || "",
        priorityHint: policy.priorityHint || "",
        active: policy.active,
        sourceFile: policy.sourceFile || "",
      }}
    />
  );
}