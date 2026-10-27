"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface Employee {
  id: string;
  name: string;
  company_id: string;
}

interface AttendanceResult {
  success: boolean;
  message: string;
}

export default function AttendancePage() {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [companyName, setCompanyName] = useState("");
  const [markedPresent, setMarkedPresent] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadEmployee() {
      const employeeId = window.location.pathname
        .split("/")
        .filter(Boolean)
        .pop();

      if (!employeeId) {
        setMessage("Invalid employee link.");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("employees")
        .select("id, name, company_id, companies(name)")
        .eq("id", employeeId)
        .single();

      if (error || !data) {
        console.error("Employee loading error:", error);
        setMessage("Employee not found. Please check the QR code.");
        setLoading(false);
        return;
      }

      setEmployee({
        id: data.id,
        name: data.name,
        company_id: data.company_id,
      });

      const company = data.companies as unknown as
        | { name: string }
        | null;

      setCompanyName(company?.name || "Company");

      const today = new Date().toLocaleDateString("en-CA");

      const { data: attendance, error: attendanceError } =
        await supabase
          .from("attendance")
          .select("id")
          .eq("employee_id", data.id)
          .eq("attendance_date", today)
          .maybeSingle();

      if (attendanceError) {
        console.error("Attendance lookup error:", attendanceError);
      } else if (attendance) {
        setMarkedPresent(true);
      }

      setLoading(false);
    }

    loadEmployee();
  }, []);

  async function markPresent() {
    if (!employee || saving || markedPresent) return;

    setSaving(true);
    setMessage("");

    const { data, error } = await supabase.rpc(
      "record_attendance",
      {
        p_employee_id: employee.id,
      }
    );

    if (error) {
      console.error("Attendance recording error:", error);
      setMessage("Could not record attendance. Please try again.");
    } else {
      const result = data as AttendanceResult;

      if (result?.success) {
        setMarkedPresent(true);
        setMessage(result.message);
      } else {
        setMessage(result?.message || "Could not record attendance.");
      }
    }

    setSaving(false);
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        Loading attendance...
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-5 py-10 text-white">
      <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-8 text-center shadow-2xl">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-400/10 text-3xl">
          ✓
        </div>

        <p className="mt-5 text-sm font-semibold uppercase tracking-widest text-emerald-400">
          Attendance Holder
        </p>

        <h1 className="mt-3 text-3xl font-black">
          Employee Attendance
        </h1>

        <p className="mt-3 text-slate-400">
          {companyName || "Company"}
        </p>

        {!employee ? (
          <div className="mt-8 rounded-xl border border-red-500/30 bg-red-500/10 p-5">
            <p className="font-semibold text-red-300">
              Employee not found
            </p>
            <p className="mt-2 text-sm text-slate-400">
              {message || "This QR code does not match an employee."}
            </p>
          </div>
        ) : (
          <>
            <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-950 p-5">
              <p className="text-sm text-slate-400">
                Employee name
              </p>

              <p className="mt-2 break-words text-2xl font-bold">
                {employee.name}
              </p>

              <p className="mt-2 text-xs text-slate-500">
                ID: {employee.id.slice(0, 8)}
              </p>
            </div>

            {markedPresent ? (
              <div className="mt-6 rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-5">
                <p className="text-lg font-bold text-emerald-300">
                  ✓ You're marked present!
                </p>

                <p className="mt-2 text-sm text-slate-400">
                  Your attendance has been processed.
                </p>
              </div>
            ) : (
              <button
                type="button"
                onClick={markPresent}
                disabled={saving}
                className="mt-6 w-full rounded-xl bg-emerald-400 px-6 py-4 font-bold text-slate-950 transition hover:bg-emerald-300 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Mark Me Present"}
              </button>
            )}

            {message && (
              <p className="mt-4 text-sm text-slate-300">
                {message}
              </p>
            )}

            <p className="mt-6 text-xs leading-5 text-slate-500">
              Attendance recording is connected to Supabase.
            </p>
          </>
        )}
      </div>
    </main>
  );
}
