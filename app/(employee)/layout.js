import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import EmployeeNav from "@/components/employee/EmployeeNav";
import EmployeeBottomNav from "@/components/employee/EmployeeBottomNav";
import FadeIn from "@/components/ui/FadeIn";
import { ShieldCheck, LogOut } from "lucide-react";

const DEPT_ROLES = ["it", "security", "finance", "manager"];

export default async function EmployeeLayout({ children }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  if (session.user.role === "admin") redirect("/admin/dashboard");
  if (DEPT_ROLES.includes(session.user.role)) {
    redirect(`/dept/${session.user.role}/dashboard`);
  }

  const firstName = (session.user.name || "").split(" ")[0] || "there";

  return (
    <div className="min-h-screen glow-bg pb-20 md:pb-0">
      <header className="border-b border-white/10 bg-white/[0.02] sticky top-0 z-10 backdrop-blur">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/dashboard" className="flex items-center gap-2 shrink-0">
            <div className="p-1.5 rounded-lg bg-brand-500/20">
              <ShieldCheck className="w-4 h-4 text-brand-300" />
            </div>
            <span className="font-semibold text-sm hidden sm:block">AegisDesk</span>
          </Link>

          <div className="hidden md:block ml-2">
            <EmployeeNav />
          </div>

          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-white/50 hidden sm:block">
              Hi, {firstName}
            </span>
            <Link
              href="/signout"
              className="inline-flex items-center gap-1.5 text-xs text-white/60 hover:text-white px-2 py-1.5 rounded-lg hover:bg-white/5 transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign out</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        <FadeIn>{children}</FadeIn>
      </main>

      <EmployeeBottomNav />
    </div>
  );
}