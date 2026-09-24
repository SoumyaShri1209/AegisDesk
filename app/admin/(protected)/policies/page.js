import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";
import { BookOpen, Upload } from "lucide-react";

export default async function PoliciesPage() {
  const session = await getServerSession(authOptions);
  const companyId = session.user.companyId;

  const policies = await prisma.policy.findMany({
    where: { companyId },
    orderBy: [{ code: "asc" }, { createdAt: "desc" }],
  });

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Policies</h1>
          <p className="text-sm text-white/50 mt-1">
            {policies.length} {policies.length === 1 ? "policy" : "policies"} in your company
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            href="/admin/policies/upload"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-500 hover:bg-brand-600 transition text-sm"
          >
            <Upload className="w-4 h-4" />
            Upload PDF
          </Link>
        </div>
      </div>

      {policies.length === 0 ? (
        <div className="card p-10 text-center">
          <div className="mx-auto w-12 h-12 rounded-xl bg-brand-500/15 flex items-center justify-center mb-4">
            <BookOpen className="w-6 h-6 text-brand-300" />
          </div>
          <h2 className="font-medium">No policies yet</h2>
          <p className="text-sm text-white/50 mt-1 mb-5 max-w-sm mx-auto">
            Upload a PDF of your company&apos;s policies, or add policies manually.
            The agent will only use what&apos;s saved here.
          </p>
          <Link
            href="/admin/policies/upload"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-500 hover:bg-brand-600 transition text-sm"
          >
            <Upload className="w-4 h-4" />
            Upload your first policy
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {policies.map((p) => (
            <Link
              key={p.id}
              href={`/admin/policies/${p.id}`}
              className="card block p-4 hover:border-brand-500/40 transition-colors"
            >
              <div className="flex items-start gap-3">
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
                    <h3 className="font-medium truncate">{p.title}</h3>
                    {!p.active && (
                      <span className="text-xs px-2 py-0.5 rounded bg-red-500/15 text-red-300">
                        Disabled
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-white/50 mt-1 line-clamp-2">
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
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}