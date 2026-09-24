import { NextResponse } from "next/server";
import { createUser } from "../../../lib/users-store";

export async function POST(req) {
  try {
    const body = await req.json();
    const { companyName, companyDomain, name, email, password } = body;

    if (!companyName || !name || !email || !password) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const companyId = crypto.randomUUID();

    await createUser({
      email,
      name,
      password,
      role: "admin",
      companyId,
      companyName,
      companyDomain,
    });

    return NextResponse.json({ ok: true, companyId });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}