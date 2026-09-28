"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Send } from "lucide-react";

export default function EmployeeReplyForm({ ticketId, disabled }) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();
    if (!text.trim() || busy) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/tickets/${ticketId}/employee-reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Reply failed");
      setText("");
      router.refresh();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  if (disabled) {
    return (
      <div className="card p-4 text-center text-sm text-white/50">
        This ticket is closed.
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="card p-4">
      <h3 className="text-sm font-medium mb-3">Reply</h3>
      <textarea
        rows={3}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type your reply to the team…"
        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 focus:border-brand-500 outline-none text-sm"
      />
      {error && (
        <div className="mt-2 text-xs text-red-300 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
          {error}
        </div>
      )}
      <div className="flex justify-end mt-2">
        <button
          type="submit"
          disabled={!text.trim() || busy}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-brand-500 hover:bg-brand-600 transition text-xs disabled:opacity-60"
        >
          {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
          Send reply
        </button>
      </div>
    </form>
  );
}