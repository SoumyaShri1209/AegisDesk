"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BookOpen } from "lucide-react";

const ICONS = {
  dashboard: LayoutDashboard,
  policies: BookOpen,
};

export default function DeptNav({ links }) {
  const pathname = usePathname();

  return (
    <nav className="flex-1 p-3 space-y-1">
      {links.map((l) => {
        const Icon = ICONS[l.icon] || LayoutDashboard;
        const isActive = pathname === l.href || pathname.startsWith(l.href + "/");
        return (
          <Link
            key={l.href}
            href={l.href}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
              isActive
                ? "bg-brand-500/15 text-white border border-brand-500/30"
                : "text-white/70 hover:text-white hover:bg-white/5 border border-transparent"
            }`}
          >
            <Icon className={`w-4 h-4 ${isActive ? "text-brand-300" : ""}`} />
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}