import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "../../../lib/auth";
import {
  ShieldCheck,
  LayoutDashboard,
  BookOpen,
  Upload,
  LogOut,
} from "lucide-react";

export default async function AdminLayout({ children }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/login");
  if (session.user.role !== "admin") redirect("/dashboard");

  const links = [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/policies", label: "Policies", icon: BookOpen },
    { href: "/admin/policies/upload", label: "Upload PDF", icon: Upload },
  ];

  return (
    <div className="min-h-screen flex">
      <aside className="hidden md:flex w-64 flex-col border-r border-white/10 bg-white/[0.02]">
        <div className="h-16 flex items-center gap-2 px-5 border-b border-white/10">
          <div className="p-1.5 rounded-lg bg-brand-500/20">
            <ShieldCheck className="w-5 h-5 text-brand-300" />
          </div>
          <span className="font-semibold">AegisDesk</span>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/5 transition"
            >
              <l.icon className="w-4 h-4" />
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="p-3 border-t border-white/10">
          <div className="px-3 py-2 text-xs text-white/40">
            Signed in as
            <div className="text-white/80 text-sm mt-0.5">
              {session.user.name}
            </div>
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
          <span className="font-semibold">AegisDesk Admin</span>
          <Link href="/signout" className="text-sm text-white/60">
            Sign out
          </Link>
        </header>

        <main className="p-4 md:p-8 max-w-5xl mx-auto">{children}</main>
      </div>
    </div>
  );
}