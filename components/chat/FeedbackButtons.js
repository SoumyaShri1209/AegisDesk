"use client";

import { useState } from "react";
import { ThumbsUp, ThumbsDown, Loader2, Check } from "lucide-react";

export default function FeedbackButtons({ messageId, initialRating = null }) {
  const [rating, setRating] = useState(initialRating);
  const [busy, setBusy] = useState(false);
  const [thanks, setThanks] = useState(false);

  async function vote(next) {
    if (busy) return;
    setBusy(true);
    try {
      // Clicking the same rating removes it
      if (rating === next) {
        const res = await fetch(`/api/feedback?messageId=${messageId}`, {
          method: "DELETE",
        });
        if (res.ok) setRating(null);
        return;
      }

      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId, rating: next }),
      });
      if (res.ok) {
        setRating(next);
        setThanks(true);
        setTimeout(() => setThanks(false), 2000);
      }
    } catch {
      // silent
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-2 mt-2">
      <span className="text-[10px] uppercase tracking-wide text-white/30">
        Helpful?
      </span>

      <button
        type="button"
        onClick={() => vote("up")}
        disabled={busy}
        className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded border transition ${
          rating === "up"
            ? "bg-green-500/15 border-green-500/30 text-green-300"
            : "border-white/10 text-white/50 hover:border-green-500/30 hover:text-green-300"
        } disabled:opacity-60`}
      >
        {busy && rating !== "up" ? (
          <Loader2 className="w-3 h-3 animate-spin" />
        ) : (
          <ThumbsUp className="w-3 h-3" />
        )}
        Yes
      </button>

      <button
        type="button"
        onClick={() => vote("down")}
        disabled={busy}
        className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded border transition ${
          rating === "down"
            ? "bg-red-500/15 border-red-500/30 text-red-300"
            : "border-white/10 text-white/50 hover:border-red-500/30 hover:text-red-300"
        } disabled:opacity-60`}
      >
        {busy && rating !== "down" ? (
          <Loader2 className="w-3 h-3 animate-spin" />
        ) : (
          <ThumbsDown className="w-3 h-3" />
        )}
        No
      </button>

      {thanks && (
        <span className="inline-flex items-center gap-1 text-[10px] text-green-300">
          <Check className="w-3 h-3" /> Thanks
        </span>
      )}
    </div>
  );
}