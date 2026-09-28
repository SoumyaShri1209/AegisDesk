"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageSquare, Ticket, BookOpen } from "lucide-react";

const LINKS = [
  { href: "/dashboard", label: "Ask AI", icon: MessageSquare },
  { href: "/tickets", label: "Requests", icon: Ticket },
  { href: "/policies", label: "Policies", icon: BookOpen },
];

export default function EmployeeBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 border-t border-white/10 bg-[#0b1020]/95 backdrop-blur z-20">
      <div className="flex items-center justify-around h-16 px-2">
        {LINKS.map((l) => {
          const active =
            pathname === l.href || pathname.startsWith(l.href + "/");
          const Icon = l.icon;
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 rounded-lg transition ${
                active ? "text-brand-300" : "text-white/50 hover:text-white"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{l.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}