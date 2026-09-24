"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";

export default function Hero() {
  return (
    <section className="glow-bg relative pt-32 pb-24 px-4">
      <div className="mx-auto max-w-4xl text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs text-white/70"
        >
          <Sparkles className="w-3.5 h-3.5 text-brand-300" />
          Policy-aware AI for internal IT support
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight leading-tight"
        >
          Your company&apos;s helpdesk,
          <br />
          <span className="text-gradient animate-gradient-x">
            solved by AI that follows your rules.
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="mt-6 text-white/70 text-base sm:text-lg max-w-2xl mx-auto"
        >
          Add your policies. Employees ask in plain language.
          The agent resolves or routes — always citing the exact policy it used.
        </motion.p>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <Link
            href="/signup"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 transition shadow-lg shadow-brand-500/30"
          >
            Create your workspace
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 rounded-xl border border-white/15 hover:bg-white/5 transition"
          >
            I have an account
          </Link>
        </motion.div>
      </div>

      {/* Floating preview card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="mx-auto max-w-3xl mt-16"
      >
        <div className="card p-6 animate-float">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 rounded-full bg-red-400/70" />
            <div className="w-3 h-3 rounded-full bg-yellow-400/70" />
            <div className="w-3 h-3 rounded-full bg-green-400/70" />
          </div>

          <div className="space-y-3 text-sm">
            <div className="p-3 rounded-lg bg-white/5 text-white/80">
              <span className="text-white/40 mr-2">Employee:</span>
              I think I got a phishing email asking for my login.
            </div>

            <div className="p-3 rounded-lg bg-brand-500/10 border border-brand-500/20">
              <span className="text-brand-300 mr-2">Agent:</span>
              Do not forward it. I&apos;ve escalated this to your Security team
              immediately.
              <div className="mt-2 flex flex-wrap gap-2 text-xs">
                <span className="px-2 py-0.5 rounded bg-white/5">
                  Policy: K-09
                </span>
                <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-300">
                  Priority: Critical
                </span>
                <span className="px-2 py-0.5 rounded bg-white/5">
                  SLA: 1 hour
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}