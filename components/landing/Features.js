"use client";

import { motion } from "framer-motion";
import { BookOpen, Bot, Timer, ShieldCheck } from "lucide-react";

const features = [
  {
    icon: BookOpen,
    title: "Your policies, your rules",
    text: "Upload your own IT / HR / Finance / Security policies. The agent never invents rules.",
  },
  {
    icon: Bot,
    title: "Plain-language agent",
    text: "Employees ask like they'd message a colleague. The agent understands and decides.",
  },
  {
    icon: Timer,
    title: "SLA for every ticket",
    text: "Every ticket gets a due time based on priority. Breaches auto-escalate to the lead.",
  },
  {
    icon: ShieldCheck,
    title: "Policy citation on every reply",
    text: "Users see exactly which policy was applied, why, and which department handled it.",
  },
];

export default function Features() {
  return (
    <section id="features" className="py-20 px-4">
      <div className="mx-auto max-w-6xl">
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl sm:text-4xl font-semibold text-center"
        >
          Built for real internal support
        </motion.h2>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -4 }}
              className="card p-5 hover:border-brand-500/40 transition-colors"
            >
              <div className="p-2 w-fit rounded-lg bg-brand-500/15 mb-3">
                <f.icon className="w-5 h-5 text-brand-300" />
              </div>
              <h3 className="font-medium">{f.title}</h3>
              <p className="text-sm text-white/60 mt-2">{f.text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}