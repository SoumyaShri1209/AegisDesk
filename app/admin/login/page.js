"use client";

import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Building2 } from "lucide-react";

export default function AdminLogin() {
  const router = useRouter();
  const { status } = useSession();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState(false);

  // Read the "created" query without useSearchParams (avoids re-render loop)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("created") === "1") setCreated(true);
    }
  }, []);

  // If already logged in as admin, go straight to dashboard
  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/admin/dashboard");
    }
  }, [status, router]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError("Invalid email or password");
      return;
    }

    router.replace("/admin/dashboard");
  }

  return (
    <main className="min-h-screen glow-bg flex items-center justify-center px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="card w-full max-w-md p-8"
      >
        <div className="flex items-center gap-2 mb-6">
          <div className="p-1.5 rounded-lg bg-brand-500/20">
            <Building2 className="w-5 h-5 text-brand-300" />
          </div>
          <span className="font-semibold">AegisDesk — Admin</span>
        </div>

        <h1 className="text-2xl font-semibold">Company admin sign in</h1>
        <p className="text-sm text-white/60 mt-1">
          Manage policies, users, tickets, and SLAs.
        </p>

        {created && (
          <div className="mt-4 text-sm text-green-300 bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2">
            Workspace created. Sign in to continue.
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-3">
          <input
            required
            type="email"
            placeholder="Admin email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 focus:border-brand-500 outline-none"
          />
          <input
            required
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 focus:border-brand-500 outline-none"
          />

          {error && (
            <div className="text-sm text-red-300 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-brand-500 hover:bg-brand-600 transition disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="text-sm text-white/50 mt-6 text-center">
          Not a company?{" "}
          <Link href="/signup" className="text-brand-300 hover:underline">
            Create workspace
          </Link>
        </p>
      </motion.div>
    </main>
  );
}