"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Trash2, Loader2, Power } from "lucide-react";

export default function PolicyEditor({ policy }) {
  const router = useRouter();
  const [form, setForm] = useState(policy);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  function update(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
    setSaved(false);
  }

  async function handleSave(e) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const res = await fetch(`/api/policies/${policy.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: form.code,
          title: form.title,
          content: form.content,
          department: form.department,
          priorityHint: form.priorityHint,
          active: form.active,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      setSaved(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this policy permanently?")) return;
    setError("");
    setDeleting(true);
    try {
      const res = await fetch(`/api/policies/${policy.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Delete failed");
      router.push("/admin/policies");
    } catch (err) {
      setError(err.message);
      setDeleting(false);
    }
  }

  async function toggleActive() {
    const next = !form.active;
    setForm((f) => ({ ...f, active: next }));
    await fetch(`/api/policies/${policy.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: next }),
    });
  }

  return (
    <div>
      <Link
        href="/admin/policies"
        className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to policies
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <h1 className="text-2xl font-semibold">Edit policy</h1>

        <button
          type="button"
          onClick={toggleActive}
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition ${
            form.active
              ? "bg-green-500/15 text-green-300 hover:bg-green-500/25"
              : "bg-red-500/15 text-red-300 hover:bg-red-500/25"
          }`}
        >
          <Power className="w-3.5 h-3.5" />
          {form.active ? "Active" : "Disabled"}
        </button>
      </div>

      <form onSubmit={handleSave} className="card p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-xs text-white/50 mb-1 block">Code</label>
            <input
              value={form.code}
              onChange={(e) => update("code", e.target.value)}
              placeholder="K-01"
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 focus:border-brand-500 outline-none text-sm"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="text-xs text-white/50 mb-1 block">Title</label>
            <input
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
              placeholder="Password Reset"
              required
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 focus:border-brand-500 outline-none text-sm"
            />
          </div>

          <div>
            <label className="text-xs text-white/50 mb-1 block">
              Department / Role / Category
            </label>
            <input
              value={form.department}
              onChange={(e) => update("department", e.target.value)}
              placeholder="IT"
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 focus:border-brand-500 outline-none text-sm"
            />
          </div>

          <div>
            <label className="text-xs text-white/50 mb-1 block">Priority hint</label>
            <input
              value={form.priorityHint}
              onChange={(e) => update("priorityHint", e.target.value)}
              placeholder="High"
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 focus:border-brand-500 outline-none text-sm"
            />
          </div>

          <div className="text-xs text-white/40 self-end">
            {form.sourceFile && <>Source: {form.sourceFile}</>}
          </div>
        </div>

        <div>
          <label className="text-xs text-white/50 mb-1 block">Content</label>
          <textarea
            rows={8}
            value={form.content}
            onChange={(e) => update("content", e.target.value)}
            required
            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 focus:border-brand-500 outline-none text-sm"
          />
        </div>

        {error && (
          <div className="text-sm text-red-300 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
            {error}
          </div>
        )}
        {saved && (
          <div className="text-sm text-green-300 bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2">
            Policy saved.
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-2 justify-between pt-2">
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-red-500/30 text-red-300 hover:bg-red-500/10 transition text-sm disabled:opacity-60"
          >
            {deleting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            Delete
          </button>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-brand-500 hover:bg-brand-600 transition text-sm disabled:opacity-60"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving…
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}