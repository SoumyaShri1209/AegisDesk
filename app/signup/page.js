"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    companyName: "",
    companyDomain: "",
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Something went wrong");
      return;
    }

    router.push("/admin/login?created=1");
  }

  return (
    <main className="min-h-screen glow-bg flex items-center justify-center px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="card w-full max-w-md p-8"
      >
        <Link href="/" className="flex items-center gap-2 mb-6">
          <div className="p-1.5 rounded-lg bg-brand-500/20">
            <ShieldCheck className="w-5 h-5 text-brand-300" />
          </div>
          <span className="font-semibold">AegisDesk</span>
        </Link>

        <h1 className="text-2xl font-semibold">Create your workspace</h1>
        <p className="text-sm text-white/60 mt-1">
          You&apos;ll be the first admin of this company.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-3">
          <input
            required
            placeholder="Company name"
            value={form.companyName}
            onChange={(e) => update("companyName", e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 focus:border-brand-500 outline-none"
          />
          <input
            required
            placeholder="Company domain (e.g. acme.com)"
            value={form.companyDomain}
            onChange={(e) => update("companyDomain", e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 focus:border-brand-500 outline-none"
          />
          <input
            required
            placeholder="Your name"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 focus:border-brand-500 outline-none"
          />
          <input
            required
            type="email"
            placeholder="Your work email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 focus:border-brand-500 outline-none"
          />
          <input
            required
            type="password"
            minLength={6}
            placeholder="Password (min 6 chars)"
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
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
            {loading ? "Creating…" : "Create workspace"}
          </button>
        </form>

        <p className="text-sm text-white/50 mt-6 text-center">
          Already have an account?{" "}
          <Link href="/login" className="text-brand-300 hover:underline">
            Sign in
          </Link>
        </p>
      </motion.div>
    </main>
  );
}