import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BookOpen } from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";

export default async function DeptPoliciesPage() {
  const session = await getServerSession(authOptions);

  const policies = await prisma.policy.findMany({
    where: { companyId: session.user.companyId, active: true },
    orderBy: [{ code: "asc" }, { createdAt: "desc" }],
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Company policies</h1>
        <p className="text-sm text-white/50 mt-1">
          {policies.length} {policies.length === 1 ? "policy" : "policies"} available
        </p>
      </div>

      {policies.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No policies published yet"
          description="Your admin hasn't uploaded any policies."
        />
      ) : (
        <div className="space-y-3">
          {policies.map((p) => (
            <details key={p.id} className="card p-4">
              <summary className="flex items-start gap-3 cursor-pointer list-none">
                <div className="p-2 rounded-lg bg-brand-500/15 shrink-0">
                  <BookOpen className="w-4 h-4 text-brand-300" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    {p.code && (
                      <span className="text-xs px-2 py-0.5 rounded bg-white/5 text-white/60">
                        {p.code}
                      </span>
                    )}
                    <h3 className="font-medium">{p.title}</h3>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-2 text-xs text-white/40">
                    {p.department && (
                      <span className="px-2 py-0.5 rounded bg-white/5">
                        {p.department}
                      </span>
                    )}
                  </div>
                </div>
              </summary>
              <div className="mt-3 pt-3 border-t border-white/5 text-sm text-white/70 whitespace-pre-line leading-relaxed">
                {p.content}
              </div>
            </details>
          ))}
        </div>
      )}
    </div>
  );
}