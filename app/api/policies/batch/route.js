import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const companyId = session.user.companyId;
  const { policies } = await req.json();

  if (!Array.isArray(policies) || policies.length === 0) {
    return NextResponse.json({ error: "No policies to save" }, { status: 400 });
  }

  const cleaned = policies
    .map((p) => ({
      code: (p.code || "").toString().trim().slice(0, 40) || null,
      title: (p.title || "Untitled Policy").toString().trim().slice(0, 200),
      content: (p.content || "").toString().trim(),
      department: p.department ? p.department.toString().trim().slice(0, 80) : null,
      priorityHint: p.priorityHint ? p.priorityHint.toString().trim().slice(0, 40) : null,
      sourceFile: p.sourceFile ? p.sourceFile.toString().trim().slice(0, 200) : null,
    }))
    .filter((p) => p.title);

  if (cleaned.length === 0) {
    return NextResponse.json({ error: "All policies were invalid" }, { status: 400 });
  }

  const created = await prisma.$transaction(
    cleaned.map((data) =>
      prisma.policy.create({
        data: {
          ...data,
          company: { connect: { id: companyId } },  // 🔒 relation form
        },
      })
    )
  );

  return NextResponse.json({
    ok: true,
    saved: created.length,
    ids: created.map((c) => c.id),
  });
}