"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface Employee {
  id: string;
  name: string;
}

interface AttendanceRecord {
  id: string;
  employee_id: string;
  attendance_date: string;
  arrival_time: string;
  status: string;
}

function getLagosDate() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Lagos",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const value = (type: string) =>
    parts.find((part) => part.type === type)?.value ?? "";

  return `${value("year")}-${value("month")}-${value("day")}`;
}

export default function DashboardPage() {
  const [companyName, setCompanyName] = useState("");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        window.location.href = "/login";
        return;
      }

      const { data: companies, error: companyError } = await supabase
        .from("companies")
        .select("id, name")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1);

      if (companyError) {
        setErrorMessage("Could not load your company: " + companyError.message);
        setLoading(false);
        return;
      }

      const company = companies?.[0];

      if (!company) {
        setErrorMessage("You haven't registered a company yet.");
        setLoading(false);
        return;
      }

      setCompanyName(company.name);

      const { data: employeeData, error: employeeError } = await supabase
        .from("employees")
        .select("id, name")
        .eq("company_id", company.id)
        .order("name", { ascending: true });

      if (employeeError) {
        setErrorMessage("Could not load employees: " + employeeError.message);
        setLoading(false);
        return;
      }

      const { data: attendanceData, error: attendanceError } = await supabase
        .from("attendance")
        .select("id, employee_id, attendance_date, arrival_time, status")
        .eq("company_id", company.id)
        .eq("attendance_date", getLagosDate())
        .order("arrival_time", { ascending: true });

      if (attendanceError) {
        setErrorMessage(
          "Could not load today's attendance: " + attendanceError.message
        );
        setLoading(false);
        return;
      }

      setEmployees(employeeData ?? []);
      setAttendance(attendanceData ?? []);
      setLoading(false);
    }

    loadDashboard();
  }, []);

  const presentIds = new Set(attendance.map((record) => record.employee_id));
  const presentCount = attendance.filter(
    (record) => record.status.toLowerCase() === "present"
  ).length;
  const lateCount = attendance.filter(
    (record) => record.status.toLowerCase() === "late"
  ).length;
  const absentCount = employees.filter(
    (employee) => !presentIds.has(employee.id)
  ).length;

  function formatTime(value: string) {
    return new Intl.DateTimeFormat("en-GB", {
      timeZone: "Africa/Lagos",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        Loading your dashboard...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white sm:px-8">
      <div className="mx-auto max-w-6xl">
        <nav className="flex flex-wrap items-center justify-between gap-4">
          <a href="/" className="text-lg font-black">
            Attendance <span className="text-emerald-400">Holder</span>
          </a>

          <div className="flex flex-wrap gap-3 text-sm">
            <a
              href="/employees"
              className="rounded-xl border border-slate-700 px-4 py-2 hover:bg-slate-800"
            >
              Employees
            </a>
            <button
              onClick={async () => {
                await supabase.auth.signOut();
                window.location.href = "/login";
              }}
              className="rounded-xl border border-slate-700 px-4 py-2 hover:bg-slate-800"
            >
              Sign out
            </button>
          </div>
        </nav>

        <header className="mt-10">
          <p className="text-sm font-semibold text-emerald-400">
            MANAGER DASHBOARD
          </p>
          <h1 className="mt-2 text-3xl font-black sm:text-4xl">
            {companyName || "Your company"}
          </h1>
          <p className="mt-3 text-slate-400">
            Today's attendance overview · {getLagosDate()}
          </p>
        </header>

        {errorMessage ? (
          <section className="mt-8 rounded-2xl border border-amber-400/30 bg-amber-400/10 p-6">
            <p className="text-amber-200">{errorMessage}</p>
            <a
              href="/"
              className="mt-4 inline-block font-semibold text-emerald-400 hover:underline"
            >
              Go to company setup →
            </a>
          </section>
        ) : (
          <>
            <section className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="Total employees" value={employees.length} />
              <StatCard
                label="Present"
                value={presentCount}
                color="text-emerald-400"
              />
              <StatCard
                label="Late"
                value={lateCount}
                color="text-amber-400"
              />
              <StatCard
                label="No check-in recorded"
                value={absentCount}
                color="text-rose-400"
              />
            </section>

            <section className="mt-8 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 p-5 sm:p-6">
                <div>
                  <h2 className="text-xl font-bold">Today's check-ins</h2>
                  <p className="mt-1 text-sm text-slate-400">
                    Attendance recorded for {getLagosDate()}
                  </p>
                </div>
                <a
                  href="/employees"
                  className="rounded-xl bg-emerald-400 px-4 py-2 text-sm font-bold text-slate-950 hover:bg-emerald-300"
                >
                  Manage employees
                </a>
              </div>

              {attendance.length === 0 ? (
                <div className="p-10 text-center">
                  <p className="text-lg font-semibold">No check-ins yet</p>
                  <p className="mt-2 text-sm text-slate-400">
                    Today's attendance will appear here when employees check in.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[520px] text-left text-sm">
                    <thead className="bg-slate-800/70 text-slate-300">
                      <tr>
                        <th className="px-5 py-4 font-semibold">Employee</th>
                        <th className="px-5 py-4 font-semibold">Arrival</th>
                        <th className="px-5 py-4 font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendance.map((record) => {
                        const employee = employees.find(
                          (item) => item.id === record.employee_id
                        );

                        return (
                          <tr
                            key={record.id}
                            className="border-t border-slate-800"
                          >
                            <td className="px-5 py-4 font-medium">
                              {employee?.name ?? "Unknown employee"}
                            </td>
                            <td className="px-5 py-4 text-slate-300">
                              {formatTime(record.arrival_time)}
                            </td>
                            <td className="px-5 py-4">
                              <span
                                className={`rounded-full px-3 py-1 text-xs font-bold ${
                                  record.status.toLowerCase() === "late"
                                    ? "bg-amber-400/10 text-amber-300"
                                    : "bg-emerald-400/10 text-emerald-300"
                                }`}
                              >
                                {record.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            <p className="mt-6 text-center text-xs text-slate-500">
              Attendance data is loaded from your Supabase database.
              Refresh the page to retrieve the latest records.
            </p>
          </>
        )}
      </div>
    </main>
  );
}

function StatCard({
  label,
  value,
  color = "text-white",
}: {
  label: string;
  value: number;
  color?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <p className="text-sm text-slate-400">{label}</p>
      <p className={`mt-3 text-4xl font-black ${color}`}>{value}</p>
    </div>
  );
}
