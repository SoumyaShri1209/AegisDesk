import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { BookOpen } from "lucide-react";

export default async function EmployeePoliciesPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const policies = await prisma.policy.findMany({
    where: { companyId: session.user.companyId, active: true },
    orderBy: [{ code: "asc" }, { title: "asc" }],
  });

  return (
    <div className="min-h-screen glow-bg">
      <header className="border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/dashboard" className="text-sm text-white/60 hover:text-white">
            ← Dashboard
          </Link>
          <span className="text-sm text-white/60">Company policies</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold">Policies</h1>
        <p className="text-sm text-white/50 mt-1">
          {policies.length} {policies.length === 1 ? "policy" : "policies"} in your company.
        </p>

        {policies.length === 0 ? (
          <div className="card p-10 text-center mt-6">
            <p className="text-white/60 text-sm">
              No policies have been published yet. Contact your admin.
            </p>
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            {policies.map((p) => (
              <div key={p.id} className="card p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-brand-500/15 shrink-0">
                    <BookOpen className="w-4 h-4 text-brand-300" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {p.code && (
                        <span className="text-xs px-2 py-0.5 rounded bg-white/5 text-white/60">
                          {p.code}
                        </span>
                      )}
                      <h3 className="font-medium">{p.title}</h3>
                    </div>
                    <p className="text-sm text-white/70 mt-2 whitespace-pre-wrap">
                      {p.content}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs text-white/40">
                      {p.department && (
                        <span className="px-2 py-0.5 rounded bg-white/5">
                          {p.department}
                        </span>
                      )}
                      {p.priorityHint && (
                        <span className="px-2 py-0.5 rounded bg-white/5">
                          {p.priorityHint}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}