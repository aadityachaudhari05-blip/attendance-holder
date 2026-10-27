"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

function CheckInContent() {
  const searchParams = useSearchParams();
  const companyId = searchParams.get("company");

  const [companyName, setCompanyName] = useState("");
  const [enteredCompanyName, setEnteredCompanyName] = useState("");
  const [employeeName, setEmployeeName] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadCompany() {
      if (!companyId) {
        setMessage("Invalid check-in link. Please scan your company's QR code.");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("companies")
        .select("id, name")
        .eq("id", companyId)
        .single();

      if (error || !data) {
        setMessage("Company not found. Please check the QR code.");
      } else {
        setCompanyName(data.name);
      }

      setLoading(false);
    }

    loadCompany();
  }, [companyId]);

  async function handleCheckIn(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    const enteredCompany = enteredCompanyName.trim();
    const name = employeeName.trim();

    if (!companyId || !enteredCompany || !name) {
      setMessage("Please enter your company name and your full name.");
      return;
    }

    if (enteredCompany.toLowerCase() !== companyName.trim().toLowerCase()) {
      setMessage("Company name does not match. Please check the name and try again.");
      return;
    }

    setSubmitting(true);

    try {
      const { data, error } = await supabase.rpc("record_attendance_by_name", {
        p_company_id: companyId,
        p_company_name: enteredCompany,
        p_employee_name: name,
      });

      if (error) {
        console.error("Attendance check-in error:", error);
        setMessage("Check-in failed. Please try again or contact your manager.");
      } else if (data && data.success === false) {
        setMessage(data.message || "Check-in could not be completed.");
      } else {
        setMessage(data?.message || "Attendance recorded successfully!");
        setEnteredCompanyName("");
        setEmployeeName("");
      }
    } catch {
      setMessage("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6">
        Loading company...
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 p-6">
      <section className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">
          Attendance Holder
        </h1>

        <p className="mb-6 text-gray-600">
          {companyName ? `Check in for ${companyName}` : "Company check-in"}
        </p>

        {companyName && (
          <form onSubmit={handleCheckIn} className="space-y-4">
            <div>
              <label
                htmlFor="companyName"
                className="mb-2 block font-medium text-gray-700"
              >
                Company name
              </label>
              <input
                id="companyName"
                type="text"
                value={enteredCompanyName}
                onChange={(event) => setEnteredCompanyName(event.target.value)}
                placeholder="Enter your company name"
                autoComplete="organization"
                required
                maxLength={200}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="employeeName"
                className="mb-2 block font-medium text-gray-700"
              >
                Your full name
              </label>
              <input
                id="employeeName"
                type="text"
                value={employeeName}
                onChange={(event) => setEmployeeName(event.target.value)}
                placeholder="Enter your full name"
                autoComplete="name"
                required
                maxLength={100}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "PROCESSING..." : "PRESENT"}
            </button>
          </form>
        )}

        {message && (
          <p
            role="status"
            className="mt-5 rounded-lg bg-gray-100 p-3 text-gray-800"
          >
            {message}
          </p>
        )}

        <p className="mt-6 text-sm text-gray-500">
          Enter the company name registered with Attendance Holder and your own
          name.
        </p>
      </section>
    </main>
  );
}

export default function CheckInPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center p-6">
          Loading check-in page...
        </main>
      }
    >
      <CheckInContent />
    </Suspense>
  );
}
