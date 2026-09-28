"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageSquare, Ticket, BookOpen } from "lucide-react";

const LINKS = [
  { href: "/dashboard", label: "Ask AI", icon: MessageSquare },
  { href: "/tickets", label: "My requests", icon: Ticket },
  { href: "/policies", label: "Policies", icon: BookOpen },
];

export default function EmployeeNav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-1">
      {LINKS.map((l) => {
        const active = pathname === l.href || pathname.startsWith(l.href + "/");
        const Icon = l.icon;
        return (
          <Link
            key={l.href}
            href={l.href}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition ${
              active
                ? "bg-brand-500/15 text-white border border-brand-500/30"
                : "text-white/60 hover:text-white hover:bg-white/5 border border-transparent"
            }`}
          >
            <Icon className="w-4 h-4" />
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}