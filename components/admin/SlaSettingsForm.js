"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save, RotateCcw, Check } from "lucide-react";

const PRIORITIES = [
  {
    key: "critical",
    label: "Critical",
    tone: "text-red-300",
    desc: "Whole team blocked. Emergency.",
  },
  {
    key: "high",
    label: "High",
    tone: "text-orange-300",
    desc: "Individual blocked from working.",
  },
  {
    key: "medium",
    label: "Medium",
    tone: "text-yellow-300",
    desc: "Needed, but a workaround exists.",
  },
  {
    key: "low",
    label: "Low",
    tone: "text-green-300",
    desc: "Nice to have. Not urgent.",
  },
];

const DEFAULT_HOURS = { critical: 2, high: 8, medium: 24, low: 72 };

export default function SlaSettingsForm({ initialHours }) {
  const router = useRouter();
  const [hours, setHours] = useState(initialHours);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  function update(key, value) {
    const num = Number(value);
    setHours((prev) => ({ ...prev, [key]: num }));
    setSaved(false);
  }

  function resetDefaults() {
    setHours(DEFAULT_HOURS);
    setSaved(false);
  }

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const res = await fetch("/api/settings/sla", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hours }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      setHours(data.hours);
      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={save} className="card p-5 space-y-5 max-w-2xl">
      <div className="space-y-4">
        {PRIORITIES.map((p) => (
          <div key={p.key} className="flex items-center gap-4">
            <div className="flex-1 min-w-0">
              <div className={`text-sm font-medium ${p.tone}`}>{p.label}</div>
              <div className="text-xs text-white/40 mt-0.5">{p.desc}</div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <input
                type="number"
                min={1}
                max={720}
                value={hours[p.key] ?? ""}
                onChange={(e) => update(p.key, e.target.value)}
                className="w-20 px-3 py-2 rounded-lg bg-white/5 border border-white/10 focus:border-brand-500 outline-none text-sm text-right tabular-nums"
              />
              <span className="text-sm text-white/50 w-10">hours</span>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-lg bg-white/[0.03] border border-white/5 px-3 py-2 text-xs text-white/50">
        Min 1 hour · Max 720 hours (30 days). Values are used only for
        <span className="text-white/80"> new tickets</span> created after this change.
      </div>

      {error && (
        <div className="text-sm text-red-300 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
          {error}
        </div>
      )}
      {saved && (
        <div className="text-sm text-green-300 bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2 inline-flex items-center gap-2">
          <Check className="w-4 h-4" /> SLA rules saved.
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-2 justify-between pt-2 border-t border-white/10">
        <button
          type="button"
          onClick={resetDefaults}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-white/10 hover:bg-white/5 transition text-sm"
        >
          <RotateCcw className="w-4 h-4" /> Reset to defaults
        </button>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-brand-500 hover:bg-brand-600 transition text-sm disabled:opacity-60"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Saving…
            </>
          ) : (
            <>
              <Save className="w-4 h-4" /> Save changes
            </>
          )}
        </button>
      </div>
    </form>
  );
}