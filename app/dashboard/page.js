import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function EmployeeDashboard() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return (
    <main className="min-h-screen glow-bg px-4 py-16">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-semibold">Hi, {session.user.name}</h1>
        <p className="text-white/60 mt-2">Employee dashboard — coming in Stage 6.</p>
      </div>
    </main>
  );
}