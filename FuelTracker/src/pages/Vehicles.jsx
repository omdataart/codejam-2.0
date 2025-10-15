import { useEffect, useMemo, useState } from "react";
import api from "../lib/api";

export default function Vehicles() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Add form state
  const currentYear = new Date().getFullYear();
  const YEAR_MIN = 1950;
  const YEAR_MAX = currentYear + 1;
  const FUEL_TYPES = ["Petrol", "Diesel", "CNG", "Electric", "Hybrid"];

  const [form, setForm] = useState({
    label: "",
    make: "",
    model: "",
    year: "",
    fuelType: "",
  });
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [showAdd, setShowAdd] = useState(false);

  // Edit row state
  const [editingId, setEditingId] = useState(null);
  const [edit, setEdit] = useState(null);

  // Filters
  const [search, setSearch] = useState("");

  // Normalizer: trims, lowercases, and collapses spaces
  function norm(s = "") {
    return s.trim().toLowerCase().replace(/\s+/g, " ");
  }
  // Store normalized brand key
  const [activeBrand, setActiveBrand] = useState("");

  async function load() {
    try {
      setLoading(true);
      const { data } = await api.get("/vehicles");
      setList(data?.data || []);
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

  // ---------- Validation ----------
  function validate(values) {
    const errs = {};
    // Name
    if (!values.label.trim()) errs.label = "Name is required.";
    else if (values.label.trim().length < 2)
      errs.label = "Name must be at least 2 characters.";

    // Make
    if (!values.make.trim()) errs.make = "Make is required.";

    // Model
    if (!values.model.trim()) errs.model = "Model is required.";

    // Year
    const y = String(values.year).trim();
    if (!y) errs.year = "Year is required.";
    else if (!/^\d{4}$/.test(y)) errs.year = "Enter a 4-digit year.";
    else {
      const yn = Number(y);
      if (yn < YEAR_MIN || yn > YEAR_MAX)
        errs.year = `Year must be between ${YEAR_MIN} and ${YEAR_MAX}.`;
    }

    // Fuel Type
    if (!values.fuelType) errs.fuelType = "Fuel type is required.";
    else if (!FUEL_TYPES.includes(values.fuelType))
      errs.fuelType = "Choose a valid fuel type.";

    return errs;
  }

  useEffect(() => {
    setErrors(validate(form));
  }, [form]);

  const isAddDisabled = Object.keys(errors).length > 0;

  function markTouched(field) {
    setTouched((t) => ({ ...t, [field]: true }));
  }

  function handleChange(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function add(e) {
    e.preventDefault();
    const v = validate(form);
    setErrors(v);
    // mark all touched to show inline messages if user tries to submit early
    setTouched({
      label: true,
      make: true,
      model: true,
      year: true,
      fuelType: true,
    });
    if (Object.keys(v).length) return;

    await api.post("/vehicles", {
      label: form.label.trim(),
      make: form.make.trim(),
      model: form.model.trim(),
      year: Number(form.year),
      fuelType: form.fuelType,
    });
    setForm({ label: "", make: "", model: "", year: "", fuelType: "" });
    setTouched({});
    setShowAdd(false);
    load();
  }

  function startEdit(v) {
    setEditingId(v.id);
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

  // ---------- Brand chips derived from data (with counts) ----------
  const brandOptions = useMemo(() => {
    const map = new Map(); // key: normalized make, value: { label, count }
    for (const v of list) {
      const raw = (v.make ?? "").trim();
      if (!raw) continue;
      const key = norm(raw);
      if (!map.has(key)) map.set(key, { label: raw, count: 0 });
      map.get(key).count += 1;
    }
    return Array.from(map.entries())
      .map(([key, val]) => ({ key, label: val.label, count: val.count }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [list]);

  // Clear stale activeBrand if data changes and brand disappears
  useEffect(() => {
    if (!activeBrand) return;
    const exists = brandOptions.some((b) => b.key === activeBrand);
    if (!exists) setActiveBrand("");
  }, [brandOptions, activeBrand]);

  // ---------- Client-side filtering ----------
  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    return list.filter((v) => {
      // brand filter via normalized key
      if (activeBrand) {
        const makeKey = norm(v.make || "");
        if (makeKey !== activeBrand) return false;
      }
      if (!s) return true;
      const hay = [
        v.label,
        v.make,
        v.model,
        v.year != null ? String(v.year) : "",
        v.fuelType,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(s);
    });
  }, [list, search, activeBrand]);

  function clearFilters() {
    setSearch("");
    setActiveBrand("");
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:py-10">
        {/* Header */}
        <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
              Vehicles
            </h2>
            <p className="text-sm text-slate-600">
              Manage your garage - add, edit, or remove vehicles.
            </p>
          </div>

          <button
            onClick={() => setShowAdd(true)}
            className="mt-3 sm:mt-0 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
          >
            + Add Vehicle
          </button>
        </div>

        {/* Error */}
        {error && (
          <div
            role="alert"
            className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
          >
            {error}
          </div>
        )}

        {/* 🔎 Search + Chips */}
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white/70 backdrop-blur-sm p-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="relative flex-1">
              <input
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 pl-9 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
                placeholder="Search vehicles..."
                aria-label="Search vehicles"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
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

            {(activeBrand || search) && (
              <button
                type="button"
                onClick={clearFilters}
                className="sm:ml-auto rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                title="Clear filters"
              >
                Clear Filters
              </button>
            )}
          </div>

          {/* Dynamic brand chips with counts */}
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setActiveBrand("")}
              aria-pressed={activeBrand === ""}
              className={[
                "rounded-full px-3 py-1 text-xs font-medium transition ring-1",
                activeBrand === ""
                  ? "bg-blue-600 text-white ring-blue-600 shadow-sm shadow-blue-600/20"
                  : "bg-slate-50 text-slate-700 ring-slate-200 hover:bg-slate-100",
              ].join(" ")}
            >
              All {brandOptions.length ? `(${list.length})` : ""}
            </button>

            {brandOptions.map(({ key, label, count }) => {
              const isActive = activeBrand === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActiveBrand(isActive ? "" : key)}
                  aria-pressed={isActive}
                  className={[
                    "rounded-full px-3 py-1 text-xs font-medium transition ring-1",
                    isActive
                      ? "bg-blue-600 text-white ring-blue-600 shadow-sm shadow-blue-600/20"
                      : "bg-slate-50 text-slate-700 ring-slate-200 hover:bg-slate-100",
                  ].join(" ")}
                  title={`${label} (${count})`}
                >
                  {label} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* 📋 Vehicle list */}
        {loading ? (
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-slate-700">Loading…</p>
            <div className="mt-4 h-2 w-full animate-pulse rounded bg-slate-100" />
          </div>
        ) : (
          <ul className="space-y-3">
            {filtered.map((v) => (
              <li
                key={v.id}
                className="rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-sm p-4 shadow-sm transition hover:shadow-md"
              >
                {editingId !== v.id ? (
                  <div className="flex items-start justify-between gap-3">
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
                          <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700 ring-1 ring-blue-200">
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
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        className="rounded-md px-2 py-1 text-blue-700 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
                        onClick={() => startEdit(v)}
                      >
                        Edit
                      </button>
                      <button
                        className="rounded-md px-2 py-1 text-red-700 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2"
                        onClick={() => remove(v.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-2 md:grid-cols-6">
                    <input
                      className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 md:col-span-2"
                      placeholder="Name *"
                      value={edit.label}
                      onChange={(e) =>
                        setEdit({ ...edit, label: e.target.value })
                      }
                      required
                    />
                    <input
                      className="rounded-xl border border-slate-300 px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-blue-600"
                      placeholder="Make *"
                      value={edit.make}
                      onChange={(e) =>
                        setEdit({ ...edit, make: e.target.value })
                      }
                    />
                    <input
                      className="rounded-xl border border-slate-300 px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-blue-600"
                      placeholder="Model *"
                      value={edit.model}
                      onChange={(e) =>
                        setEdit({ ...edit, model: e.target.value })
                      }
                    />
                    <input
                      type="number"
                      min={YEAR_MIN}
                      max={YEAR_MAX}
                      className="rounded-xl border border-slate-300 px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-blue-600"
                      placeholder="Year *"
                      value={edit.year}
                      onChange={(e) =>
                        setEdit({ ...edit, year: e.target.value })
                      }
                    />
                    <input
                      className="rounded-xl border border-slate-300 px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-blue-600"
                      placeholder="Fuel type *"
                      value={edit.fuelType}
                      onChange={(e) =>
                        setEdit({ ...edit, fuelType: e.target.value })
                      }
                    />
                    <div className="flex gap-2 md:col-span-6">
                      <button
                        className="rounded-xl bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
                        onClick={() => saveEdit(v.id)}
                      >
                        Save
                      </button>
                      <button
                        className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                        onClick={() => {
                          setEditingId(null);
                          setEdit(null);
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}

            {filtered.length === 0 && (
              <li className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-slate-500 shadow-sm">
                <div className="mx-auto mb-2 h-10 w-10 rounded-2xl bg-slate-100 ring-1 ring-slate-200" />
                {list.length === 0
                  ? "No vehicles yet. Add your first vehicle above."
                  : "No results found. Try clearing filters or searching again."}
              </li>
            )}
          </ul>
        )}
      </div>

      {/* 🪟 Modal Add Form (with full validation) */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-slate-800">
                Add New Vehicle
              </h3>
              <button
                onClick={() => {
                  setShowAdd(false);
                  setTouched({});
                }}
                className="text-slate-500 hover:text-slate-700 text-xl leading-none"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <form onSubmit={add} noValidate>
              {/* Name */}
              <div className="grid gap-1 mb-3">
                <label className="text-xs font-medium text-slate-700">
                  Name *
                </label>
                <input
                  className={`rounded-xl border px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-blue-600 ${
                    touched.label && errors.label
                      ? "border-red-300"
                      : "border-slate-300"
                  }`}
                  placeholder="e.g., My Swift VXI"
                  value={form.label}
                  onChange={(e) => handleChange("label", e.target.value)}
                  onBlur={() => markTouched("label")}
                  aria-invalid={touched.label && !!errors.label}
                  aria-describedby={errors.label ? "err-label" : undefined}
                />
                {touched.label && errors.label && (
                  <p id="err-label" className="text-xs text-red-600">
                    {errors.label}
                  </p>
                )}
              </div>

              {/* Make & Model */}
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="grid gap-1">
                  <label className="text-xs font-medium text-slate-700">
                    Make *
                  </label>
                  <input
                    className={`rounded-xl border px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-blue-600 ${
                      touched.make && errors.make
                        ? "border-red-300"
                        : "border-slate-300"
                    }`}
                    placeholder="e.g., Maruti"
                    value={form.make}
                    onChange={(e) => handleChange("make", e.target.value)}
                    onBlur={() => markTouched("make")}
                    aria-invalid={touched.make && !!errors.make}
                    aria-describedby={errors.make ? "err-make" : undefined}
                  />
                  {touched.make && errors.make && (
                    <p id="err-make" className="text-xs text-red-600">
                      {errors.make}
                    </p>
                  )}
                </div>

                <div className="grid gap-1">
                  <label className="text-xs font-medium text-slate-700">
                    Model *
                  </label>
                  <input
                    className={`rounded-xl border px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-blue-600 ${
                      touched.model && errors.model
                        ? "border-red-300"
                        : "border-slate-300"
                    }`}
                    placeholder="e.g., Swift"
                    value={form.model}
                    onChange={(e) => handleChange("model", e.target.value)}
                    onBlur={() => markTouched("model")}
                    aria-invalid={touched.model && !!errors.model}
                    aria-describedby={errors.model ? "err-model" : undefined}
                  />
                  {touched.model && errors.model && (
                    <p id="err-model" className="text-xs text-red-600">
                      {errors.model}
                    </p>
                  )}
                </div>
              </div>

              {/* Year & Fuel Type */}
              <div className="grid sm:grid-cols-2 gap-3 mt-3">
                <div className="grid gap-1">
                  <label className="text-xs font-medium text-slate-700">
                    Year *
                  </label>
                  <input
                    type="number"
                    inputMode="numeric"
                    min={YEAR_MIN}
                    max={YEAR_MAX}
                    className={`rounded-xl border px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-blue-600 ${
                      touched.year && errors.year
                        ? "border-red-300"
                        : "border-slate-300"
                    }`}
                    placeholder={`${YEAR_MIN}–${YEAR_MAX}`}
                    value={form.year}
                    onChange={(e) => handleChange("year", e.target.value)}
                    onBlur={() => markTouched("year")}
                    aria-invalid={touched.year && !!errors.year}
                    aria-describedby={errors.year ? "err-year" : undefined}
                  />
                  {touched.year && errors.year && (
                    <p id="err-year" className="text-xs text-red-600">
                      {errors.year}
                    </p>
                  )}
                </div>

                <div className="grid gap-1">
                  <label className="text-xs font-medium text-slate-700">
                    Fuel Type *
                  </label>
                  <select
                    className={`rounded-xl border px-3 py-2 text-sm shadow-sm bg-white focus:ring-2 focus:ring-blue-600 ${
                      touched.fuelType && errors.fuelType
                        ? "border-red-300"
                        : "border-slate-300"
                    }`}
                    value={form.fuelType}
                    onChange={(e) => handleChange("fuelType", e.target.value)}
                    onBlur={() => markTouched("fuelType")}
                    aria-invalid={touched.fuelType && !!errors.fuelType}
                    aria-describedby={errors.fuelType ? "err-fuel" : undefined}
                  >
                    <option value="">Select</option>
                    {FUEL_TYPES.map((ft) => (
                      <option key={ft} value={ft}>
                        {ft}
                      </option>
                    ))}
                  </select>
                  {touched.fuelType && errors.fuelType && (
                    <p id="err-fuel" className="text-xs text-red-600">
                      {errors.fuelType}
                    </p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 mt-5">
                <button
                  type="button"
                  onClick={() => {
                    setShowAdd(false);
                    setTouched({});
                  }}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAddDisabled}
                  className={`rounded-xl px-4 py-2 text-sm font-medium text-white shadow-md ${
                    isAddDisabled
                      ? "bg-blue-300 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                  aria-disabled={isAddDisabled}
                  title={
                    isAddDisabled
                      ? "Please fix the errors above"
                      : "Add vehicle"
                  }
                >
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
