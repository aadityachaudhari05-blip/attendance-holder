"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setMessage("Login failed. Check your email and password.");
      return;
    }

    setMessage("Login successful! Redirecting...");
window.location.href = "/";
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-5 text-white">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-2xl"
      >
        <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-400 text-xl font-black text-slate-950">
          A
        </div>

        <h1 className="text-3xl font-black">
          Manager <span className="text-emerald-400">Login</span>
        </h1>

        <p className="mt-3 text-sm leading-6 text-slate-400">
          Sign in to your Attendance Holder manager account.
        </p>

        <label htmlFor="email" className="mt-7 block text-sm font-semibold">
          Email address
        </label>

        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-400"
          placeholder="manager@example.com"
        />

        <label
          htmlFor="password"
          className="mt-5 block text-sm font-semibold"
        >
          Password
        </label>

        <input
          id="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-400"
          placeholder="Enter your password"
        />

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-xl bg-emerald-400 px-5 py-3 font-bold text-slate-950 transition hover:bg-emerald-300 disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Sign in"}
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
          href="/reset-password"
          className="mt-6 block text-center text-sm font-semibold text-emerald-400 hover:text-emerald-300"
        >
          Forgot Password?
        </a>

        <a
          href="/"
          className="mt-3 block text-center text-sm text-slate-400 hover:text-emerald-400"
        >
          ← Back to homepage
        </a>
      </form>
    </main>
  );
}
