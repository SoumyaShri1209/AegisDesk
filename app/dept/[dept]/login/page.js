"use client";

import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Headphones, Lock, Wallet, Users } from "lucide-react";

const META = {
  it: { label: "IT Support", icon: Headphones, accent: "text-blue-300" },
  security: { label: "Security", icon: Lock, accent: "text-red-300" },
  finance: { label: "Finance", icon: Wallet, accent: "text-emerald-300" },
  manager: { label: "Manager", icon: Users, accent: "text-amber-300" },
};

export default function DeptLogin() {
  const router = useRouter();
  const params = useParams();
  const { status } = useSession();
  const dept = params?.dept || "it";

  const meta = META[dept] || META.it;
  const Icon = meta.icon;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      router.replace(`/dept/${dept}/dashboard`);
    }
  }, [status, router, dept]);

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

    router.replace(`/dept/${dept}/dashboard`);
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
            <Icon className={`w-5 h-5 ${meta.accent}`} />
          </div>
          <span className="font-semibold">AegisDesk — {meta.label}</span>
        </div>

        <h1 className="text-2xl font-semibold">{meta.label} sign in</h1>
        <p className="text-sm text-white/60 mt-1">
          You&apos;ll only see tickets routed to your department.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-3">
          <input
            required
            type="email"
            placeholder={`${meta.label} email`}
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
          Wrong portal?{" "}
          <Link href="/login" className="text-brand-300 hover:underline">
            Employee login
          </Link>
        </p>
      </motion.div>
    </main>
  );
}