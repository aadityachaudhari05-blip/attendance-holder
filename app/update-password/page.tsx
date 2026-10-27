"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleUpdate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (password.length < 8) {
      setMessage("Your password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("The passwords do not match.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({ password });

    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Password updated successfully! You can now return to Manager Login.");
    setPassword("");
    setConfirmPassword("");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-5 text-white">
      <form
        onSubmit={handleUpdate}
        className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-2xl"
      >
        <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-400 text-xl font-black text-slate-950">
          A
        </div>

        <h1 className="text-3xl font-black">
          Create New <span className="text-emerald-400">Password</span>
        </h1>

        <p className="mt-3 text-sm leading-6 text-slate-400">
          Choose a new password for your Attendance Holder manager account.
          Use at least 8 characters.
        </p>

        <label htmlFor="password" className="mt-7 block text-sm font-semibold">
          New password
        </label>

        <input
          id="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-400"
          placeholder="At least 8 characters"
        />

        <label
          htmlFor="confirmPassword"
          className="mt-5 block text-sm font-semibold"
        >
          Confirm new password
        </label>

        <input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-400"
          placeholder="Enter the password again"
        />

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-xl bg-emerald-400 px-5 py-3 font-bold text-slate-950 transition hover:bg-emerald-300 disabled:opacity-50"
        >
          {loading ? "Updating..." : "Update Password"}
        </button>

        {message && (
          <p role="status" className="mt-4 rounded-xl bg-slate-800 p-3 text-sm">
            {message}
          </p>
        )}

        <a
          href="/login"
          className="mt-6 block text-center text-sm text-slate-400 hover:text-emerald-400"
        >
          ← Back to Manager Login
        </a>
      </form>
    </main>
  );
}
