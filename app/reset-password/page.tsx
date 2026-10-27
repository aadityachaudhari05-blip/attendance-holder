"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleReset(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    });

    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("If an account exists for this email, check your inbox for the password reset link.");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-5 text-white">
      <form
        onSubmit={handleReset}
        className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-2xl"
      >
        <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-400 text-xl font-black text-slate-950">
          A
        </div>

        <h1 className="text-3xl font-black">
          Forgot <span className="text-emerald-400">Password?</span>
        </h1>

        <p className="mt-3 text-sm leading-6 text-slate-400">
          Enter your registered email address and we will send you a secure
          password-reset link.
        </p>

        <label htmlFor="email" className="mt-7 block text-sm font-semibold">
          Gmail address
        </label>

        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-400"
          placeholder="you@gmail.com"
        />

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-xl bg-emerald-400 px-5 py-3 font-bold text-slate-950 transition hover:bg-emerald-300 disabled:opacity-50"
        >
          {loading ? "Sending..." : "Send Reset Link"}
        </button>

        {message && (
          <p
            role="status"
            className="mt-4 rounded-xl bg-slate-800 p-3 text-sm"
          >
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
