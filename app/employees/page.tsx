"use client";

import { useEffect, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { supabase } from "@/lib/supabase";
interface Employee {
  id: string;
  name: string;
}

export default function EmployeesPage() {
  const [companyName, setCompanyName] = useState("");
const [companyId, setCompanyId] = useState("");
  const [employeeName, setEmployeeName] = useState("");
  const [employees, setEmployees] = useState<Employee[]>([]);
const [loaded, setLoaded] = useState(false);
const [siteOrigin, setSiteOrigin] = useState("");
useEffect(() => {
    setSiteOrigin(window.location.origin);
  }, []);

  useEffect(() => {
    async function loadCompanyAndEmployees() {
      const { data: { user }, error: authError } = await supabase.auth.getUser();

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
        console.error("Could not load company:", companyError.message);
        setLoaded(true);
        return;
      }

      const company = companies?.[0];

      if (!company) {
        setCompanyName("");
        setCompanyId("");
        setEmployees([]);
        setLoaded(true);
        return;
      }

      setCompanyName(company.name);
      setCompanyId(company.id);

      const { data: employeeData, error: employeeError } = await supabase
        .from("employees")
        .select("id, name")
        .eq("company_id", company.id)
        .order("created_at", { ascending: true });

      if (employeeError) {
        console.error("Could not load employees:", employeeError.message);
      } else {
        setEmployees(employeeData ?? []);
      }

      setLoaded(true);
    }

    loadCompanyAndEmployees();
  }, []);

  async function addEmployee(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const name = employeeName.trim();

    if (!name) return;

    if (!companyId) {
      alert("Please register a company before adding employees.");
      return;
    }

    const { data, error } = await supabase
      .from("employees")
      .insert({
        company_id: companyId,
        name,
      })
      .select("id, name")
      .single();

    if (error) {
      alert("Could not add employee: " + error.message);
      return;
    }

    setEmployees((current) => [...current, data]);
    setEmployeeName("");
  }

  async function removeEmployee(id: string) {
    const { error } = await supabase
      .from("employees")
      .delete()
      .eq("id", id)
      .eq("company_id", companyId);

    if (error) {
      alert("Could not remove employee: " + error.message);
      return;
    }

    setEmployees((current) =>
      current.filter((employee) => employee.id !== id)
    );
  }

  if (!loaded) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        Loading Attendance Holder...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-5 py-10 text-white sm:px-10">
      <div className="mx-auto max-w-4xl">
        <a
          href="/"
          className="text-sm font-medium text-emerald-400 hover:underline"
        >
          ← Attendance Holder
        </a>

        <header className="mt-10">
          <div className="inline-block rounded-full bg-emerald-400/10 px-4 py-2 text-sm text-emerald-300">
            Company setup
          </div>

          <h1 className="mt-5 text-4xl font-black sm:text-5xl">
            Employee register
          </h1>

          <p className="mt-4 text-slate-400">
            Company:{" "}
            <span className="font-semibold text-white">
              {companyName || "No company selected"}
            </span>
          </p>
        </header>

        {companyName && companyId && siteOrigin && (
          <section className="mt-8 rounded-3xl border border-slate-800 bg-slate-900 p-6 text-center">
            <h2 className="text-2xl font-bold">Company Check-in QR Code</h2>
            <p className="mt-2 text-sm text-slate-400">
              Share this one QR code with all registered employees.
            </p>

            <div className="mt-6 inline-flex flex-col items-center rounded-xl bg-white p-5 text-slate-950">
              <QRCodeCanvas
                value={`${siteOrigin}/check-in?company=${companyId}`}
                size={240}
                level="H"
                title={`Check-in QR code for ${companyName}`}
              />
              <p className="mt-4 text-lg font-bold">{companyName}</p>
              <p className="mt-1 text-sm text-slate-600">Scan to check in</p>
            </div>

            <div>
              <button
                type="button"
                onClick={() => window.print()}
                className="mt-5 rounded-xl bg-emerald-400 px-5 py-3 font-bold text-slate-950 hover:bg-emerald-300 print:hidden"
              >
                Print Company QR Code
              </button>
            </div>
          </section>
        )}

        {!companyName ? (
          <div className="mt-8 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-6">
            <p className="font-semibold text-amber-200">
              No company has been registered in this browser.
            </p>

            <a
              href="/"
              className="mt-4 inline-block text-emerald-400 hover:underline"
            >
              Return to company setup →
            </a>
          </div>
        ) : (
          <>
            <form
              onSubmit={addEmployee}
              className="mt-8 rounded-3xl border border-slate-800 bg-slate-900 p-6 sm:p-8"
            >
              <h2 className="text-xl font-bold">
                Add a new employee
              </h2>

              <p className="mt-2 text-sm text-slate-400">
                Enter the employee's full name to add them to your register.
              </p>

              <label
                htmlFor="employeeName"
                className="mt-6 block text-sm font-semibold"
              >
                Employee full name
              </label>

              <input
                id="employeeName"
                value={employeeName}
                onChange={(event) =>
                  setEmployeeName(event.target.value)
                }
                placeholder="e.g. Sunish Kumar"
                maxLength={100}
                required
                className="mt-3 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none placeholder:text-slate-600 focus:border-emerald-400"
              />

              <button
                type="submit"
                className="mt-5 w-full rounded-xl bg-emerald-400 px-6 py-3 font-bold text-slate-950 transition hover:bg-emerald-300 sm:w-auto"
              >
                + Add employee
              </button>
            </form>

            <section className="mt-10">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-2xl font-bold">
                  Registered employees
                </h2>

                <span className="rounded-full bg-slate-800 px-3 py-2 text-sm">
                  {employees.length} total
                </span>
              </div>

              {employees.length === 0 ? (
                <div className="mt-5 rounded-2xl border border-dashed border-slate-700 p-10 text-center">
                  <div className="text-4xl">👥</div>

                  <p className="mt-4 font-semibold">
                    Your employee register is empty
                  </p>

                  <p className="mt-2 text-sm text-slate-400">
                    Add your first employee using the form above.
                  </p>
                </div>
              ) : (
                <div className="mt-5 space-y-3">
                  {employees.map((employee, index) => (
  <div
    key={employee.id}
    className="rounded-2xl border border-slate-800 bg-slate-900 p-5"
  >
    <div className="flex items-center justify-between gap-4">
      <div className="flex min-w-0 items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-400/10 font-bold text-emerald-400">
          {index + 1}
        </div>

        <div className="min-w-0">
          <p className="break-words font-semibold">{employee.name}</p>
          <p className="mt-1 text-xs text-slate-500">
            ID: {employee.id.slice(0, 8)}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => removeEmployee(employee.id)}
        className="shrink-0 rounded-lg border border-red-500/30 px-3 py-2 text-sm text-red-300 hover:bg-red-500/10"
      >
        Remove
      </button>
    </div>

  </div>
))}
                </div>
              )}
            </section>

            <div className="mt-10 rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
              <h3 className="font-bold">Next: Employee QR codes</h3>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                Once your employees are registered, we'll generate a unique
                QR code for each person, with their name underneath, ready
                to print and display at your workplace.
              </p>
            </div>
          </>
        )}

        <footer className="mt-12 border-t border-slate-800 pt-6 text-xs leading-5 text-slate-500">
          Prototype version. Company and employee information is stored
          locally in this browser and is not yet shared between devices.
        </footer>
      </div>
    </main>
  );
}
