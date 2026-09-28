"use client";

import { useState } from "react";
import { RefreshCw, Loader2 } from "lucide-react";

export default function ReindexButton() {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  async function run() {
    setLoading(true);
    setMsg("");
    setErr("");
    try {
      const res = await fetch("/api/policies/reindex", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Reindex failed");
      setMsg(`Reindexed ${data.policies} policies → ${data.chunks} chunks.`);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        type="button"
        onClick={run}
        disabled={loading}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 hover:border-brand-500/40 hover:bg-brand-500/10 transition text-sm disabled:opacity-60"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <RefreshCw className="w-4 h-4" />
        )}
        {loading ? "Reindexing…" : "Reindex policies"}
      </button>

      {msg && (
        <p className="text-xs text-green-300 bg-green-500/10 border border-green-500/20 rounded px-2 py-1">
          {msg}
        </p>
      )}
      {err && (
        <p className="text-xs text-red-300 bg-red-500/10 border border-red-500/20 rounded px-2 py-1">
          {err}
        </p>
      )}
    </div>
  );
}