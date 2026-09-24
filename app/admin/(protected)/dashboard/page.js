import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";
import { BookOpen, Upload, Ticket } from "lucide-react";

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/login");
  if (session.user.role !== "admin") redirect("/dashboard");

  const companyId = session.user.companyId;

  const [policyCount, activePolicyCount] = await Promise.all([
    prisma.policy.count({ where: { companyId } }),
    prisma.policy.count({ where: { companyId, active: true } }),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-semibold">Welcome, {session.user.name}</h1>
      <p className="text-sm text-white/50 mt-1">
        Manage your company&apos;s policies and agent settings.
      </p>

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Link
          href="/admin/policies"
          className="card p-5 hover:border-brand-500/40 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-brand-500/15">
              <BookOpen className="w-5 h-5 text-brand-300" />
            </div>
            <div>
              <div className="text-2xl font-semibold">{policyCount}</div>
              <div className="text-xs text-white/50">
                {policyCount === 1 ? "Policy" : "Policies"} total
              </div>
            </div>
          </div>
        </Link>

        <Link
          href="/admin/policies"
          className="card p-5 hover:border-brand-500/40 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/15">
              <Ticket className="w-5 h-5 text-green-300" />
            </div>
            <div>
              <div className="text-2xl font-semibold">{activePolicyCount}</div>
              <div className="text-xs text-white/50">Active policies</div>
            </div>
          </div>
        </Link>

        <Link
          href="/admin/policies/upload"
          className="card p-5 hover:border-brand-500/40 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-brand-500/15">
              <Upload className="w-5 h-5 text-brand-300" />
            </div>
            <div>
              <div className="text-sm font-medium">Upload policies</div>
              <div className="text-xs text-white/50">PDF or paste text</div>
            </div>
          </div>
        </Link>
      </div>

      {policyCount === 0 && (
        <div className="mt-8 card p-6">
          <h2 className="font-medium">Get started</h2>
          <p className="text-sm text-white/50 mt-1 mb-4">
            Upload a PDF of your company&apos;s policies. The agent will only use
            what you save here.
          </p>
          <Link
            href="/admin/policies/upload"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-500 hover:bg-brand-600 transition text-sm"
          >
            <Upload className="w-4 h-4" />
            Upload your first policy
          </Link>
        </div>
      )}
    </div>
  );
}