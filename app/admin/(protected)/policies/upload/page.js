"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, FileText, Trash2, Save, Loader2 } from "lucide-react";

export default function UploadPoliciesPage() {
  const router = useRouter();
  const [mode, setMode] = useState("pdf");
  const [file, setFile] = useState(null);
  const [text, setText] = useState("");
  const [preview, setPreview] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function handleParse(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      let res;

      if (mode === "pdf") {
        if (!file) throw new Error("Choose a PDF file first");
        const fd = new FormData();
        fd.append("file", file);
        res = await fetch("/api/policies/parse", { method: "POST", body: fd });
      } else {
        if (!text.trim()) throw new Error("Paste policy text first");
        res = await fetch("/api/policies/parse", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, sourceFile: "manual-paste" }),
        });
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Parse failed");

      if (!data.policies || data.policies.length === 0) {
        throw new Error("No policies detected. Check the file or paste text instead.");
      }

      setPreview(data.policies);
      setMessage(`Detected ${data.policies.length} policies. Review and save.`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function updateRow(i, key, value) {
    setPreview((rows) =>
      rows.map((r, idx) => (idx === i ? { ...r, [key]: value } : r))
    );
  }

  function removeRow(i) {
    setPreview((rows) => rows.filter((_, idx) => idx !== i));
  }

  async function handleSave() {
    setError("");
    setSaving(true);
    try {
      const res = await fetch("/api/policies/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ policies: preview }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      router.push("/admin/policies");
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold">Upload policies</h1>
      <p className="text-sm text-white/50 mt-1">
        Upload a PDF or paste text. We&apos;ll detect policies so you can review them before saving.
      </p>

      <div className="mt-6 inline-flex rounded-lg border border-white/10 p-1 bg-white/5">
        <button
          onClick={() => setMode("pdf")}
          className={`px-4 py-1.5 text-sm rounded-md transition ${
            mode === "pdf" ? "bg-brand-500" : "text-white/60 hover:text-white"
          }`}
        >
          PDF file
        </button>
        <button
          onClick={() => setMode("text")}
          className={`px-4 py-1.5 text-sm rounded-md transition ${
            mode === "text" ? "bg-brand-500" : "text-white/60 hover:text-white"
          }`}
        >
          Paste text
        </button>
      </div>

      <form onSubmit={handleParse} className="mt-4 card p-5 space-y-4">
        {mode === "pdf" ? (
          <label className="flex items-center justify-center gap-3 border border-dashed border-white/15 rounded-xl py-10 cursor-pointer hover:border-brand-500/40 transition">
            <Upload className="w-5 h-5 text-brand-300" />
            <span className="text-sm text-white/70">
              {file ? file.name : "Choose a PDF file"}
            </span>
            <input
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </label>
        ) : (
          <textarea
            rows={10}
            placeholder={"Paste your policy text here...\n\n## K-01 - Password Reset\nEmployees can reset...\nCategory: IT | Priority hint: High"}
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-brand-500 outline-none font-mono text-sm"
          />
        )}

        {error && (
          <div className="text-sm text-red-300 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
            {error}
          </div>
        )}
        {message && (
          <div className="text-sm text-green-300 bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2">
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-500 hover:bg-brand-600 transition disabled:opacity-60 text-sm"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Parsing…
            </>
          ) : (
            <>
              <FileText className="w-4 h-4" />
              Parse
            </>
          )}
        </button>
      </form>

      {preview.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-medium">Preview ({preview.length})</h2>
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500/80 hover:bg-green-500 transition disabled:opacity-60 text-sm"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save all
                </>
              )}
            </button>
          </div>

          <div className="space-y-3">
            {preview.map((p, i) => (
              <div key={i} className="card p-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    placeholder="Code (e.g. K-01)"
                    value={p.code || ""}
                    onChange={(e) => updateRow(i, "code", e.target.value)}
                    className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm focus:border-brand-500 outline-none"
                  />
                  <input
                    placeholder="Title"
                    value={p.title || ""}
                    onChange={(e) => updateRow(i, "title", e.target.value)}
                    className="sm:col-span-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm focus:border-brand-500 outline-none"
                  />
                  <input
                    placeholder="Department / Role / Category"
                    value={p.department || ""}
                    onChange={(e) => updateRow(i, "department", e.target.value)}
                    className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm focus:border-brand-500 outline-none"
                  />
                  <input
                    placeholder="Priority hint"
                    value={p.priorityHint || ""}
                    onChange={(e) => updateRow(i, "priorityHint", e.target.value)}
                    className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm focus:border-brand-500 outline-none"
                  />
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => removeRow(i)}
                      className="inline-flex items-center gap-1 text-xs text-red-300 hover:text-red-200 px-3 py-1.5 rounded-md hover:bg-red-500/10 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Remove
                    </button>
                  </div>
                  <textarea
                    rows={4}
                    placeholder="Policy content"
                    value={p.content || ""}
                    onChange={(e) => updateRow(i, "content", e.target.value)}
                    className="sm:col-span-3 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm focus:border-brand-500 outline-none"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}