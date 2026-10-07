"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RotateCcw, Loader2 } from "lucide-react";

export default function ReopenButton({ ticketId }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function reopen() {
    if (!confirm("Reopen this ticket? The team will pick it up again.")) return;

    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/tickets/${ticketId}/reopen`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Reopen failed");
      router.refresh();
    } catch (e) {
      setError(e.message);
      setBusy(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={reopen}
        disabled={busy}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 hover:border-brand-500/40 hover:bg-brand-500/10 transition text-sm disabled:opacity-60"
      >
        {busy ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <RotateCcw className="w-4 h-4" />
        )}
        {busy ? "Reopening…" : "Reopen ticket"}
      </button>
      {error && (
        <p className="text-xs text-red-300 mt-2">{error}</p>
      )}
    </div>
  );
}