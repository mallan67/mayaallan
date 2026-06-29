"use client";
import { useState } from "react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    // The endpoint always returns a generic success so we can't (and shouldn't)
    // reveal whether the address matched the admin account. Show the same
    // confirmation regardless.
    await fetch("/api/admin/forgot-password", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email }),
    }).catch(() => {});
    setBusy(false);
    setSubmitted(true);
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm rounded-2xl border p-6 space-y-4">
        <h1 className="text-xl font-semibold">Reset password</h1>
        {submitted ? (
          <>
            <p className="text-sm text-muted-foreground">
              If that email matches the admin account, a reset link is on its way.
              It expires in 1 hour. Check your inbox (and spam).
            </p>
            <p className="text-center text-sm">
              <a href="/admin/login" className="underline underline-offset-4">Back to login</a>
            </p>
          </>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Enter the admin email and we'll send a reset link.
            </p>
            <input
              className="w-full border rounded-xl p-3"
              placeholder="Email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button disabled={busy} className="w-full rounded-xl border p-3 disabled:opacity-50">
              {busy ? "Sending…" : "Send reset link"}
            </button>
            <p className="text-center text-sm">
              <a href="/admin/login" className="text-muted-foreground underline underline-offset-4 hover:text-foreground">
                Back to login
              </a>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
