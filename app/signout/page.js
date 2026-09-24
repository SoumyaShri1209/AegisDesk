"use client";

import { signOut } from "next-auth/react";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function SignOutPage() {
  useEffect(() => {
    signOut({ callbackUrl: "/" });
  }, []);

  return (
    <main className="min-h-screen glow-bg flex items-center justify-center">
      <div className="card p-6 flex items-center gap-3">
        <Loader2 className="w-5 h-5 animate-spin text-brand-300" />
        <span className="text-sm text-white/70">Signing you out…</span>
      </div>
    </main>
  );
}