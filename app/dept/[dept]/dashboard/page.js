import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";
import {
  Headphones,
  Lock,
  Wallet,
  Users,
  BookOpen,
  Ticket,
  Clock,
} from "lucide-react";

const DEPT_META = {
  it: {
    label: "IT Support",
    icon: Headphones,
    accent: "text-blue-300",
    bg: "bg-blue-500/15",
  },
  security: {
    label: "Security",
    icon: Lock,
    accent: "text-red-300",
    bg: "bg-red-500/15",
  },
  finance: {
    label: "Finance",
    icon: Wallet,
    accent: "text-emerald-300",
    bg: "bg-emerald-500/15",
  },
  manager: {
    label: "Manager",
    icon: Users,
    accent: "text-amber-300",
    bg: "bg-amber-500/15",
  },
};

export default async function DeptDashboard({ params }) {
  const session = await getServerSession(authOptions);
  const { dept } = await params;

  if (!session) redirect(`/dept/${dept}/login`);

  const role = session.user.role;

  // Ensure this role can only access its own dashboard
  if (role !== dept) {
    redirect(`/dept/${role}/dashboard`);
  }

  const meta = DEPT_META[role] || DEPT_META.it;
  const Icon = meta.icon;

  // Count policies for context (all company policies are visible to departments)
  const policyCount = await prisma.policy.count({
    where: { companyId: session.user.companyId, active: true },
  });

  return (
    <div className="min-h-screen glow-bg">
      {/* Top bar */}
      <header className="border-b border-white/10">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg ${meta.bg}`}>
              <Icon className={`w-4 h-4 ${meta.accent}`} />
            </div>
            <span className="text-sm font-medium">{meta.label}</span>
          </div>

          <Link
            href="/api/auth/signout"
            className="text-sm text-white/60 hover:text-white transition"
          >
            Sign out
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Greeting */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold">Hi, {session.user.name}</h1>
          <p className="text-sm text-white/50 mt-1">
            Tickets routed to {meta.label} will appear here.
          </p>
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link
            href={`/dept/${role}/tickets`}
            className="card p-5 hover:border-brand-500/40 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-brand-500/15">
                <Ticket className="w-5 h-5 text-brand-300" />
              </div>
              <div>
                <h3 className="font-medium group-hover:text-white">My tickets</h3>
                <p className="text-xs text-white/50 mt-0.5">
                  Tickets routed to {meta.label}
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/dept/policies"
            className="card p-5 hover:border-brand-500/40 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-brand-500/15">
                <BookOpen className="w-5 h-5 text-brand-300" />
              </div>
              <div>
                <h3 className="font-medium group-hover:text-white">
                  Company policies
                </h3>
                <p className="text-xs text-white/50 mt-0.5">
                  {policyCount} {policyCount === 1 ? "policy" : "policies"} — read-only
                </p>
              </div>
            </div>
          </Link>
        </div>

        {/* Placeholder — real SLA/ticket widgets come in Stage 7 & 8 */}
        <div className="mt-8 card p-6">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-4 h-4 text-white/50" />
            <h3 className="text-sm font-medium text-white/80">
              SLA tracking
            </h3>
          </div>
          <p className="text-sm text-white/50">
            SLA timers, priority sorting, and auto-escalation appear here in Stage 7.
          </p>
        </div>

        {/* Bottom note */}
        <div className="mt-8">
          <Link
            href="/dept/policies"
            className="text-sm text-brand-300 hover:underline"
          >
            View company policies →
          </Link>
        </div>
      </main>
    </div>
  );
}