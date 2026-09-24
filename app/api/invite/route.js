import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { createUser } from "../../../lib/users-store";

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { email, name, role, department, password } = await req.json();

  if (!email || !name || !password || !role) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  try {
    await createUser({
      email,
      name,
      password,
      role,
      department: department || null,
      companyId: session.user.companyId,
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}