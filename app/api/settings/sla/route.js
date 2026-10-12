import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  getSlaHoursForCompany,
  saveSlaHours,
} from "@/lib/tickets/sla-settings";
import { logAudit } from "@/lib/audit/log";

export const runtime = "nodejs";

// GET — current SLA hours for the company
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const hours = await getSlaHoursForCompany(session.user.companyId);
  return NextResponse.json({ ok: true, hours });
}

// PATCH — update SLA hours (admin only)
export async function PATCH(req) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { hours } = body;
  if (!hours || typeof hours !== "object") {
    return NextResponse.json({ error: "hours object required" }, { status: 400 });
  }

  const required = ["critical", "high", "medium", "low"];
  for (const k of required) {
    if (typeof hours[k] !== "number" || !Number.isFinite(hours[k])) {
      return NextResponse.json(
        { error: `Invalid value for ${k}` },
        { status: 400 }
      );
    }
  }

  await saveSlaHours({
    companyId: session.user.companyId,
    hoursMap: hours,
  });

  await logAudit({
    companyId: session.user.companyId,
    actorId: session.user.id,
    action: "settings.sla_updated",
    entityType: "settings",
    entityId: session.user.companyId,
    metadata: { hours },
  });

  const updated = await getSlaHoursForCompany(session.user.companyId);
  return NextResponse.json({ ok: true, hours: updated });
}