"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Send, CheckCircle2, Clock, Play, Lock } from "lucide-react";

export default function DeptTicketActions({ ticket }) {
  const router = useRouter();
  const [reply, setReply] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [resolution, setResolution] = useState("");
  const [showResolve, setShowResolve] = useState(false);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");

  async function postJSON(url, body, method = "POST") {
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Request failed");
    return data;
  }

  async function sendReply(e) {
    e.preventDefault();
    if (!reply.trim()) return;
    setBusy("reply");
    setError("");
    try {
      await postJSON(`/api/tickets/${ticket.id}/reply`, { body: reply, isInternal });
      setReply("");
      setIsInternal(false);
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy("");
    }
  }

  async function changeStatus(next, extra = {}) {
    setBusy(next);
    setError("");
    try {
      await postJSON(`/api/tickets/${ticket.id}/status`, { status: next, ...extra }, "PATCH");
      setShowResolve(false);
      setResolution("");
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy("");
    }
  }

  const s = ticket.status;
  const canStart = s === "open" || s === "waiting_on_employee";
  const canWait = s === "open" || s === "in_progress";
  const canResolve = s === "open" || s === "in_progress" || s === "waiting_on_employee";
  const canClose = s === "resolved";

  return (
    <div className="space-y-4">
      {/* Status action buttons */}
      <div className="card p-4">
        <h3 className="text-sm font-medium mb-3">Actions</h3>
        <div className="flex flex-wrap gap-2">
          {canStart && (
            <button
              type="button"
              onClick={() => changeStatus("in_progress")}
              disabled={!!busy}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-brand-500 hover:bg-brand-600 transition text-xs disabled:opacity-60"
            >
              {busy === "in_progress" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
              Start working
            </button>
          )}
          {canWait && (
            <button
              type="button"
              onClick={() => changeStatus("waiting_on_employee")}
              disabled={!!busy}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 hover:border-purple-500/40 hover:bg-purple-500/10 transition text-xs disabled:opacity-60"
            >
              {busy === "waiting_on_employee" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Clock className="w-3.5 h-3.5" />}
              Waiting on employee
            </button>
          )}
          {canResolve && (
            <button
              type="button"
              onClick={() => setShowResolve(true)}
              disabled={!!busy}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-500/15 border border-green-500/30 text-green-300 hover:bg-green-500/25 transition text-xs disabled:opacity-60"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Resolve
            </button>
          )}
          {canClose && (
            <button
              type="button"
              onClick={() => changeStatus("closed")}
              disabled={!!busy}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/5 transition text-xs disabled:opacity-60"
            >
              {busy === "closed" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Lock className="w-3.5 h-3.5" />}
              Close ticket
            </button>
          )}
        </div>

        {showResolve && (
          <div className="mt-4 border-t border-white/10 pt-4">
            <label className="text-xs text-white/50 mb-1 block">
              Resolution note (visible to employee)
            </label>
            <textarea
              rows={3}
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              placeholder="What did you do to fix it?"
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 focus:border-brand-500 outline-none text-sm"
            />
            <div className="flex gap-2 mt-2">
              <button
                type="button"
                onClick={() => changeStatus("resolved", { resolution })}
                disabled={!resolution.trim() || busy === "resolved"}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-500 hover:bg-green-600 text-white transition text-xs disabled:opacity-60"
              >
                {busy === "resolved" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                Confirm resolve
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowResolve(false);
                  setResolution("");
                }}
                className="px-3 py-1.5 rounded-lg text-xs text-white/50 hover:text-white"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-3 text-xs text-red-300 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
            {error}
          </div>
        )}
      </div>

      {/* Reply form */}
      <form onSubmit={sendReply} className="card p-4">
        <h3 className="text-sm font-medium mb-3">Reply</h3>
        <textarea
          rows={3}
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          placeholder={isInternal ? "Internal note — only visible to your team" : "Public reply — the employee will see this in their chat"}
          className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 focus:border-brand-500 outline-none text-sm"
        />
        <div className="flex items-center justify-between mt-2">
          <label className="inline-flex items-center gap-2 text-xs text-white/60 cursor-pointer">
            <input
              type="checkbox"
              checked={isInternal}
              onChange={(e) => setIsInternal(e.target.checked)}
              className="accent-brand-500"
            />
            Internal note (hidden from employee)
          </label>
          <button
            type="submit"
            disabled={!reply.trim() || busy === "reply"}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-brand-500 hover:bg-brand-600 transition text-xs disabled:opacity-60"
          >
            {busy === "reply" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            Send reply
          </button>
        </div>
      </form>
    </div>
  );
}