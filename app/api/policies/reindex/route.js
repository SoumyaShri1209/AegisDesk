import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import { reindexCompany } from "../../../../lib/rag/index";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const result = await reindexCompany(session.user.companyId);
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    console.error("[reindex] error:", err);
    return NextResponse.json({ error: "Reindex failed" }, { status: 500 });
  }
}