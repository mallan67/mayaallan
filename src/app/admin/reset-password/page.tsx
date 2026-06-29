"use client";
import { useEffect, useState } from "react";

export default function ResetPassword() {
  const [token, setToken] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  // Read the token from the URL on the client. Using window.location instead of
  // useSearchParams avoids needing a Suspense boundary during prerender.
  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get("token");
    setToken(t);
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);

    if (password.length < 8) return setErr("Password must be at least 8 characters.");
    if (password !== confirm) return setErr("Passwords don't match.");
    if (!token) return setErr("Missing reset token. Open the link from your email again.");

    setBusy(true);
    const res = await fetch("/api/admin/reset-password", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ token, password }),
    }).catch(() => null);
    setBusy(false);

    if (!res) return setErr("Network error. Please try again.");
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      return setErr(data?.error ?? "Could not reset password.");
    }
    setDone(true);
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm rounded-2xl border p-6 space-y-4">
        <h1 className="text-xl font-semibold">Set a new password</h1>
        {done ? (
          <>
            <p className="text-sm text-muted-foreground">
              Your password has been updated. You can now sign in with it.
            </p>
            <a href="/admin/login" className="block w-full text-center rounded-xl border p-3">
              Go to login
            </a>
          </>
        ) : token === null ? (
          // null = not yet read; empty string handled by submit guard
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <input
              className="w-full border rounded-xl p-3"
              placeholder="New password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <input
              className="w-full border rounded-xl p-3"
              placeholder="Confirm new password"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
            {err ? <p className="text-sm text-red-600">{err}</p> : null}
            <button disabled={busy} className="w-full rounded-xl border p-3 disabled:opacity-50">
              {busy ? "Saving…" : "Update password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
