"use client";

import { useEffect, useState } from "react";
import { Loader2, UserPlus, Mail, Shield, Cpu, DollarSign, Users as UsersIcon } from "lucide-react";

const ROLE_ICON = {
  admin: Shield,
  employee: UsersIcon,
  it: Cpu,
  security: Shield,
  finance: DollarSign,
  manager: UsersIcon,
};

const ROLES = ["employee", "it", "security", "finance", "manager", "admin"];

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "employee", department: "" });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      if (res.ok) setUsers(data.users || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function invite(e) {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    setErr("");
    try {
      const res = await fetch("/api/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Invite failed");
      setMsg(`Created ${form.email}`);
      setForm({ name: "", email: "", password: "", role: "employee", department: "" });
      load();
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Users</h1>
        <p className="text-sm text-white/50 mt-1">{users.length} people in your company</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1">
          <form onSubmit={invite} className="card p-4 space-y-3">
            <h2 className="text-sm font-medium flex items-center gap-2">
              <UserPlus className="w-4 h-4" /> Add user
            </h2>

            <input
              placeholder="Full name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 focus:border-brand-500 outline-none text-sm"
            />
            <input
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 focus:border-brand-500 outline-none text-sm"
            />
            <input
              type="password"
              placeholder="Temporary password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              minLength={6}
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 focus:border-brand-500 outline-none text-sm"
            />
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 focus:border-brand-500 outline-none text-sm"
            >
              {ROLES.map((r) => (
                <option key={r} value={r} className="bg-[#0b1020]">
                  {r}
                </option>
              ))}
            </select>
            {(form.role === "it" || form.role === "security" || form.role === "finance" || form.role === "manager") && (
              <input
                placeholder={`Department (defaults to "${form.role}")`}
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 focus:border-brand-500 outline-none text-sm"
              />
            )}

            {msg && <div className="text-xs text-green-300 bg-green-500/10 border border-green-500/20 rounded px-2 py-1">{msg}</div>}
            {err && <div className="text-xs text-red-300 bg-red-500/10 border border-red-500/20 rounded px-2 py-1">{err}</div>}

            <button
              type="submit"
              disabled={busy}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-brand-500 hover:bg-brand-600 transition text-sm disabled:opacity-60"
            >
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
              Add user
            </button>
          </form>
        </div>

        <div className="lg:col-span-2">
          {loading ? (
            <div className="card p-6 text-center text-sm text-white/50">
              <Loader2 className="w-4 h-4 animate-spin inline mr-2" /> Loading users…
            </div>
          ) : users.length === 0 ? (
            <div className="card p-6 text-center text-sm text-white/50">No users yet.</div>
          ) : (
            <div className="card divide-y divide-white/5">
              {users.map((u) => {
                const Icon = ROLE_ICON[u.role] || UsersIcon;
                return (
                  <div key={u.id} className="p-4 flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-white/5 shrink-0">
                      <Icon className="w-4 h-4 text-white/60" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm">{u.name}</span>
                        <span className="text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-white/5 text-white/60">
                          {u.role}
                        </span>
                      </div>
                      <div className="text-xs text-white/50 flex items-center gap-1 mt-0.5">
                        <Mail className="w-3 h-3" /> {u.email}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}