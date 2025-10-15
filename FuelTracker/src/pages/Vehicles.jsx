import { useEffect, useState } from "react";
import api from "../lib/api";

export default function Vehicles() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    label: "",
    make: "",
    model: "",
    year: "",
    fuelType: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [edit, setEdit] = useState(null);
  const [error, setError] = useState("");

  async function load() {
    try {
      setLoading(true);
      const { data } = await api.get("/vehicles");
      setList(data.data || []);
      setError("");
    } catch (e) {
      setError(e?.response?.data?.message || e.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, []);

  async function add(e) {
    e.preventDefault();
    if (!form.label.trim()) return alert("Name is required");
    await api.post("/vehicles", {
      label: form.label.trim(),
      make: form.make || "",
      model: form.model || "",
      year: form.year ? Number(form.year) : null,
      fuelType: form.fuelType || "",
    });
    setForm({ label: "", make: "", model: "", year: "", fuelType: "" });
    load();
  }

  function startEdit(v) {
    setEditingId(v.id);
    console.log(v);
    setEdit({
      label: v.label || "",
      make: v.make || "",
      model: v.model || "",
      year: v.year || "",
      fuelType: v.fuelType || "",
    });
  }

  async function saveEdit(id) {
    if (!edit.label.trim()) return alert("Name is required");
    await api.put(`/vehicles/${id}`, {
      label: edit.label.trim(),
      make: edit.make || "",
      model: edit.model || "",
      year: edit.year ? Number(edit.year) : null,
      fuelType: edit.fuelType || "",
    });
    setEditingId(null);
    setEdit(null);
    load();
  }

  async function remove(id) {
    if (!confirm("Delete this vehicle?")) return;
    await api.delete(`/vehicles/${id}`);
    load();
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:py-10">
        <div className="mb-4 sm:mb-6">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
            Vehicles
          </h2>
          <p className="text-sm text-slate-600">
            Manage your garage—add, edit, or remove vehicles.
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
          >
            {error}
          </div>
        )}

        {/* MVP Toolbar (presentational only; not wired) */}
        <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-3 sm:p-4 shadow-sm">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-full sm:w-80">
              <input
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 pl-9 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
                placeholder="Search vehicles (MVP preview)"
                aria-label="Search vehicles (not active yet)"
              />
              <svg
                className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-slate-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-3.5-3.5" />
              </svg>
            </div>

            <span className="ml-auto hidden text-xs text-slate-500 sm:inline">
              Quick brands (MVP): tap has no effect yet
            </span>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {["Toyota", "Honda", "Ford", "Hyundai", "Maruti"].map((b) => (
              <button
                key={b}
                type="button"
                aria-disabled="true"
                title="Coming soon"
                className="cursor-default rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700"
              >
                {b}
              </button>
            ))}
          </div>
        </div>

        {/* Add form */}
        <form
          onSubmit={add}
          className="mb-6 rounded-2xl border border-slate-200 bg-white p-3 sm:p-4 shadow-sm"
          noValidate
        >
          <div className="grid gap-2 md:grid-cols-5">
            <input
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
              placeholder="Name *"
              value={form.label}
              onChange={(e) => setForm({ ...form, label: e.target.value })}
              aria-label="Vehicle name"
              required
            />
            <input
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
              placeholder="Make"
              value={form.make}
              onChange={(e) => setForm({ ...form, make: e.target.value })}
              aria-label="Vehicle make"
            />
            <input
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
              placeholder="Model"
              value={form.model}
              onChange={(e) => setForm({ ...form, model: e.target.value })}
              aria-label="Vehicle model"
            />
            <input
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
              placeholder="Year"
              value={form.year}
              onChange={(e) => setForm({ ...form, year: e.target.value })}
              inputMode="numeric"
              aria-label="Vehicle year"
            />
            <div className="flex gap-2">
              <input
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
                placeholder="Fuel type"
                value={form.fuelType}
                onChange={(e) => setForm({ ...form, fuelType: e.target.value })}
                aria-label="Fuel type"
              />
              <button
                className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-md shadow-blue-600/20 transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
                title="Add vehicle"
              >
                Add
              </button>
            </div>
          </div>
        </form>

        {/* List */}
        {loading ? (
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-slate-700">Loading…</p>
            <div className="mt-4 h-2 w-full animate-pulse rounded bg-slate-100" />
          </div>
        ) : (
          <ul className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white shadow-sm">
            {list.map((v) => (
              <li key={v.id} className="p-3 sm:p-4">
                {editingId !== v.id ? (
                  <div className="flex items-start justify-between gap-3">
                    {/* Left: avatar-ish chip + meta */}
                    <div className="flex items-start gap-3">
                      <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 ring-1 ring-slate-200"
                        aria-hidden="true"
                        title={v.make || v.label}
                      >
                        <span className="text-sm font-semibold text-slate-700">
                          {String(v.make || v.label || "?")
                            .slice(0, 2)
                            .toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {v.label}
                        </p>
                        <p className="text-xs text-slate-600">
                          {[v.make, v.model, v.year].filter(Boolean).join(" ")}
                        </p>
                        {v.fuelType && (
                          <p className="mt-0.5 inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700 ring-1 ring-blue-200">
                            <svg
                              className="h-3 w-3"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              aria-hidden="true"
                            >
                              <path d="M12 2s7 6.16 7 12a7 7 0 0 1-14 0C5 8.16 12 2 12 2Z" />
                            </svg>
                            Fuel: {v.fuelType}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        className="rounded-md px-2 py-1 text-blue-700 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
                        onClick={() => startEdit(v)}
                        title="Edit vehicle"
                      >
                        Edit
                      </button>
                      <button
                        className="rounded-md px-2 py-1 text-red-700 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2"
                        onClick={() => remove(v.id)}
                        title="Delete vehicle"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-2 md:grid-cols-5">
                    <input
                      className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
                      placeholder="Name *"
                      value={edit.label}
                      onChange={(e) =>
                        setEdit({ ...edit, label: e.target.value })
                      }
                      aria-label="Vehicle name"
                      required
                    />
                    <input
                      className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
                      placeholder="Make"
                      value={edit.make}
                      onChange={(e) =>
                        setEdit({ ...edit, make: e.target.value })
                      }
                      aria-label="Vehicle make"
                    />
                    <input
                      className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
                      placeholder="Model"
                      value={edit.model}
                      onChange={(e) =>
                        setEdit({ ...edit, model: e.target.value })
                      }
                      aria-label="Vehicle model"
                    />
                    <input
                      className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
                      placeholder="Year"
                      value={edit.year}
                      onChange={(e) =>
                        setEdit({ ...edit, year: e.target.value })
                      }
                      inputMode="numeric"
                      aria-label="Vehicle year"
                    />
                    <div className="flex gap-2">
                      <input
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
                        placeholder="Fuel type"
                        value={edit.fuelType}
                        onChange={(e) =>
                          setEdit({ ...edit, fuelType: e.target.value })
                        }
                        aria-label="Fuel type"
                      />
                      <button
                        className="rounded-xl bg-blue-600 px-3 py-2 text-sm font-medium text-white shadow-md shadow-blue-600/20 transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
                        onClick={() => saveEdit(v.id)}
                        title="Save vehicle"
                      >
                        Save
                      </button>
                      <button
                        className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
                        onClick={() => {
                          setEditingId(null);
                          setEdit(null);
                        }}
                        title="Cancel edit"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
            {list.length === 0 && (
              <li className="p-6 text-center text-slate-500">
                <div
                  className="mx-auto mb-2 h-10 w-10 rounded-2xl bg-slate-100 ring-1 ring-slate-200"
                  aria-hidden="true"
                />
                No vehicles yet. Add your first vehicle above.
              </li>
            )}
          </ul>
        )}
      </div>
    </div>
  );
}
