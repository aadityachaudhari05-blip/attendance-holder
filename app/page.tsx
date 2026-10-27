"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const [showForm, setShowForm] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [checkingCompany, setCheckingCompany] = useState(true);

  useEffect(() => {
    let active = true;

    async function checkExistingCompany() {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        if (active) setCheckingCompany(false);
        return;
      }

      const { data: company, error } = await supabase
        .from("companies")
        .select("id")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!active) return;

      if (error) {
        console.error("Could not check existing company:", error.message);
        setCheckingCompany(false);
        return;
      }

      if (company) {
        window.location.replace("/dashboard");
        return;
      }

      setCheckingCompany(false);
    }

    checkExistingCompany();

    return () => {
      active = false;
    };
  }, []);

  async function createCompany(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const name = companyName.trim();
    if (!name) return;

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      alert("Please sign in to your manager account before creating a company.");
      window.location.href = "/login";
      return;
    }

    const { data: existingCompany, error: lookupError } = await supabase
      .from("companies")
      .select("id")
      .eq("owner_id", user.id)
      .limit(1)
      .maybeSingle();

    if (lookupError) {
      alert("Could not check your existing company: " + lookupError.message);
      return;
    }

    if (existingCompany) {
      window.location.href = "/dashboard";
      return;
    }

    const { error } = await supabase
      .from("companies")
      .insert({ name, owner_id: user.id });

    if (error) {
      alert("Could not create company: " + error.message);
      return;
    }

    window.location.href = "/employees";
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-400 text-xl font-black text-slate-950">
            A
          </div>

          <span className="text-xl font-bold tracking-tight">
            Attendance <span className="text-emerald-400">Holder</span>
          </span>
        </div>

        <span className="hidden text-sm text-slate-400 sm:block">
          Simple attendance. Smarter workplaces.
        </span>
      </nav>

      <section className="mx-auto grid min-h-[75vh] max-w-7xl items-center gap-12 px-6 py-16 md:grid-cols-2">
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-sm text-emerald-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Attendance management, simplified
          </div>

          <h1 className="max-w-xl text-5xl font-black leading-tight tracking-tight sm:text-6xl">
            Every workday,
            <span className="block text-emerald-400">
              accounted for.
            </span>
          </h1>

          <p className="mt-6 max-w-lg text-lg leading-8 text-slate-300">
            Manage employees, generate individual QR codes, and track
            attendance from one simple platform. Built for companies
            everywhere.
          </p>

          <div className="mt-9 flex flex-col gap-4 sm:flex-row">
            <button
              onClick={() => setShowForm(true)}
              className="rounded-xl bg-emerald-400 px-7 py-4 font-bold text-slate-950 transition hover:bg-emerald-300"
            >
              Create your company →
            </button>

            <a
              href="#features"
              className="rounded-xl border border-slate-700 px-7 py-4 text-center font-semibold transition hover:bg-slate-900"
            >
              Explore features
            </a>
          </div>

          <p className="mt-5 text-sm text-slate-500">
            One platform. Your employees. Your attendance records.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl sm:p-8">
          <div className="flex items-center justify-between border-b border-slate-800 pb-6">
            <div>
              <p className="text-sm text-slate-400">Dashboard preview</p>
              <h2 className="mt-1 text-xl font-bold">Today's attendance</h2>
            </div>

            <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300">
              LIVE PREVIEW
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 py-6">
            <div className="rounded-2xl bg-slate-800 p-5">
              <p className="text-sm text-slate-400">Employees</p>
              <p className="mt-3 text-3xl font-black">—</p>
              <p className="mt-2 text-xs text-slate-500">
                Your company register
              </p>
            </div>

            <div className="rounded-2xl bg-slate-800 p-5">
              <p className="text-sm text-slate-400">Present today</p>
              <p className="mt-3 text-3xl font-black text-emerald-400">—</p>
              <p className="mt-2 text-xs text-slate-500">
                Recorded attendance
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-dashed border-slate-700 p-6 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-400/10 text-2xl">
              ▦
            </div>

            <h3 className="mt-4 font-bold">Employee QR codes</h3>

            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-400">
              Give every registered employee a unique QR code to open
              their attendance page.
            </p>
          </div>
        </div>
      </section>

      <section id="features" className="border-t border-slate-800 bg-slate-900/50">
        <div className="mx-auto grid max-w-7xl gap-6 px-6 py-16 sm:grid-cols-3">
          <Feature
            icon="🏢"
            title="Company management"
            description="Create your company register and organise employee information."
          />

          <Feature
            icon="▦"
            title="Personal QR codes"
            description="Generate printable QR codes linked to individual employees."
          />

          <Feature
            icon="📊"
            title="Attendance reports"
            description="View attendance records and track employee check-ins."
          />
        </div>
      </section>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-5">
          <form
            onSubmit={createCompany}
            className="w-full max-w-md rounded-3xl border border-slate-700 bg-slate-900 p-7 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold">Create your company</h2>
                <p className="mt-2 text-sm text-slate-400">
                  Start setting up your attendance register.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="text-xl text-slate-400 hover:text-white"
                aria-label="Close form"
              >
                ×
              </button>
            </div>

            <label
              htmlFor="companyName"
              className="mt-7 block text-sm font-semibold"
            >
              Company name
            </label>

            <input
              id="companyName"
              autoFocus
              required
              maxLength={100}
              value={companyName}
              onChange={(event) => setCompanyName(event.target.value)}
              placeholder="e.g. METCEM"
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-600 focus:border-emerald-400"
            />

            <button
              type="submit"
              className="mt-5 w-full rounded-xl bg-emerald-400 px-5 py-3 font-bold text-slate-950 hover:bg-emerald-300"
            >
              Continue →
            </button>

            <p className="mt-4 text-xs leading-5 text-slate-500">
              Your company will be saved to your manager account.
            </p>
          </form>
        </div>
      )}

      <footer className="border-t border-slate-800 px-6 py-7 text-center text-sm text-slate-500">
        © 2026 Attendance Holder. Built for workplaces everywhere.
      </footer>
    </main>
  );
}

function Feature({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <div className="text-3xl">{icon}</div>
      <h3 className="mt-4 text-lg font-bold">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
    </div>
  );
}
