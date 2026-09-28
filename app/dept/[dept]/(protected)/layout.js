import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { runSlaBreachCheck } from "@/lib/tickets/sla-check";
import DeptNav from "@/components/dept/DeptNav";
import FadeIn from "@/components/ui/FadeIn";
import {
  ShieldCheck,
  LogOut,
  Cpu,
  Shield,
  DollarSign,
  Users,
} from "lucide-react";

const DEPT_ICON = {
  it: Cpu,
  security: Shield,
  finance: DollarSign,
  manager: Users,
};

const DEPT_LABEL = {
  it: "IT",
  security: "Security",
  finance: "Finance",
  manager: "Manager",
};

const DEPT_ROLES = ["it", "security", "finance", "manager"];

export default async function DeptLayout({ children, params }) {
  const { dept } = await params;

  const session = await getServerSession(authOptions);
  if (!session) redirect(`/dept/${dept}/login`);
  if (!DEPT_ROLES.includes(session.user.role)) redirect("/dashboard");
  if (session.user.role !== dept) redirect(`/dept/${session.user.role}/dashboard`);

  try {
    await runSlaBreachCheck({ companyId: session.user.companyId });
  } catch (err) {
    console.error("[sla-check] failed:", err);
  }

  const Icon = DEPT_ICON[dept] || ShieldCheck;
  const label = DEPT_LABEL[dept] || dept.toUpperCase();

  const links = [
    { href: `/dept/${dept}/dashboard`, label: "Queue", icon: "dashboard" },
    { href: `/dept/${dept}/policies`, label: "Policies", icon: "policies" },
  ];

  return (
    <div className="min-h-screen flex">
      <aside className="hidden md:flex w-64 flex-col border-r border-white/10 bg-white/[0.02]">
        <div className="h-16 flex items-center gap-2 px-5 border-b border-white/10">
          <div className="p-1.5 rounded-lg bg-brand-500/20">
            <Icon className="w-5 h-5 text-brand-300" />
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-sm leading-tight">AegisDesk</div>
            <div className="text-xs text-white/50 leading-tight">{label} team</div>
          </div>
        </div>

        <DeptNav links={links} />

        <div className="p-3 border-t border-white/10">
          <div className="px-3 py-2 text-xs text-white/40">
            Signed in as
            <div className="text-white/80 text-sm mt-0.5">{session.user.name}</div>
            <div className="text-white/40">{session.user.email}</div>
          </div>

          <Link
            href="/signout"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/5 transition"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </Link>
        </div>
      </aside>

      <div className="flex-1 min-w-0">
        <header className="md:hidden h-14 flex items-center justify-between px-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Icon className="w-4 h-4 text-brand-300" />
            <span className="font-semibold text-sm">{label} team</span>
          </div>
          <Link href="/signout" className="text-sm text-white/60">
            Sign out
          </Link>
        </header>

        <div className="md:hidden border-b border-white/10 px-3 py-2 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs whitespace-nowrap"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>

        <main className="p-4 md:p-8 max-w-5xl mx-auto">
          <FadeIn>{children}</FadeIn>
        </main>
      </div>
    </div>
  );
}