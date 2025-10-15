import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import { useSettings } from "../store/settingsStore";
import { L_PER_GAL, volumeLabel } from "../utils/conversions";

export default function FillUpForm() {
  const nav = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [form, setForm] = useState({
    vehicleId: "",
    date: new Date().toISOString().slice(0, 10),
    odometerKm: "",
    station: "",
    brand: "",
    grade: "",
    liters: "",
    totalAmount: "",
    notes: "",
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const { currency, volumeUnit, priceDecimals } = useSettings();

  useEffect(() => {
    (async () => {
      const response = await api.get("/vehicles");
      setVehicles(response.data.data || []);
      setForm((f) => ({
        ...f,
        vehicleId: f.vehicleId || response.data.data[0]?.id || "",
      }));
    })();
  }, []);

  const unitPriceDisplay = useMemo(() => {
    const liters = Number(form.liters);
    const total = Number(form.totalAmount);
    if (!(liters > 0) || !(total > 0)) return null;
    // canonical unit price per L
    const perL = total / liters;
    const display = volumeUnit === "gal" ? perL * L_PER_GAL : perL;
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: priceDecimals,
    }).format(display);
  }, [form.liters, form.totalAmount, currency, volumeUnit, priceDecimals]);

  const v = validate(form);
  const canSave = v.ok && !saving;

  async function submit(e) {
    e.preventDefault();
    if (!v.ok) return;
    try {
      setSaving(true);
      await api.post("/FuelEntries", {
        ...form,
        odometerKm: Number(form.odometerKm),
        liters: Number(form.liters),
        totalAmount: Number(form.totalAmount),
      });
      nav("/app/history");
    } catch (e) {
      setErr(e?.response?.data?.message || e.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="mx-auto max-w-3xl px-4 py-6 sm:py-10">
        <div className="mb-4 sm:mb-6">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
            Add Fill-Up
          </h2>
          <p className="text-sm text-slate-600">
            Log a new fuel entry. Fields marked{" "}
            <span className="text-red-600">*</span> are required.
          </p>
        </div>

        {err && (
          <div
            role="alert"
            className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
          >
            {err}
          </div>
        )}

        <form
          onSubmit={submit}
          className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm space-y-5"
          noValidate
        >
          {/* Row 1 */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Vehicle */}
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-slate-800">
                Vehicle <span className="text-red-600">*</span>
              </span>
              <select
                className={[
                  "rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm",
                  "transition focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2",
                ].join(" ")}
                value={form.vehicleId}
                onChange={(e) =>
                  setForm({ ...form, vehicleId: Number(e.target.value) })
                }
                aria-invalid={!v.ok && !form.vehicleId ? true : undefined}
              >
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.label}
                  </option>
                ))}
              </select>
            </label>

            {/* Date */}
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-slate-800">
                Date <span className="text-red-600">*</span>
              </span>
              <input
                type="date"
                className={[
                  "rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm",
                  "transition focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2",
                  !v.date.ok
                    ? "border-red-300 ring-red-400 focus:ring-red-500"
                    : "",
                ].join(" ")}
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                aria-invalid={!v.date.ok}
                aria-describedby={!v.date.ok ? "date-error" : undefined}
              />
              {!v.date.ok && (
                <span
                  id="date-error"
                  className="text-xs font-medium text-red-600"
                >
                  {v.date.msg}
                </span>
              )}
            </label>
          </div>

          {/* Row 2 */}
          <div className="grid gap-4 md:grid-cols-3">
            {/* Odometer */}
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-slate-800">
                Odometer (km) <span className="text-red-600">*</span>
              </span>
              <input
                className={[
                  "rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm",
                  "transition focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2",
                  !v.odo.ok
                    ? "border-red-300 ring-red-400 focus:ring-red-500"
                    : "",
                ].join(" ")}
                value={form.odometerKm}
                onChange={(e) =>
                  setForm({ ...form, odometerKm: e.target.value })
                }
                placeholder="e.g., 45210"
                inputMode="numeric"
                aria-invalid={!v.odo.ok}
                aria-describedby={!v.odo.ok ? "odo-error" : undefined}
              />
              {!v.odo.ok && (
                <span
                  id="odo-error"
                  className="text-xs font-medium text-red-600"
                >
                  {v.odo.msg}
                </span>
              )}
            </label>

            {/* Volume */}
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-slate-800">
                Volume ({volumeLabel(volumeUnit)}){" "}
                <span className="text-red-600">*</span>
              </span>
              <input
                className={[
                  "rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm",
                  "transition focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2",
                  !v.liters.ok
                    ? "border-red-300 ring-red-400 focus:ring-red-500"
                    : "",
                ].join(" ")}
                value={form.liters}
                onChange={(e) => setForm({ ...form, liters: e.target.value })}
                placeholder={
                  volumeUnit === "gal"
                    ? "auto-converts to liters on save"
                    : "e.g., 35.2"
                }
                inputMode="decimal"
                aria-invalid={!v.liters.ok}
                aria-describedby={!v.liters.ok ? "liters-error" : undefined}
              />
              {!v.liters.ok && (
                <span
                  id="liters-error"
                  className="text-xs font-medium text-red-600"
                >
                  {v.liters.msg}
                </span>
              )}
            </label>

            {/* Total */}
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-slate-800">
                Total ({currency}) <span className="text-red-600">*</span>
              </span>
              <input
                className={[
                  "rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm",
                  "transition focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2",
                  !v.total.ok
                    ? "border-red-300 ring-red-400 focus:ring-red-500"
                    : "",
                ].join(" ")}
                value={form.totalAmount}
                onChange={(e) =>
                  setForm({ ...form, totalAmount: e.target.value })
                }
                placeholder="e.g., 2500"
                inputMode="decimal"
                aria-invalid={!v.total.ok}
                aria-describedby={!v.total.ok ? "total-error" : undefined}
              />
              {!v.total.ok && (
                <span
                  id="total-error"
                  className="text-xs font-medium text-red-600"
                >
                  {v.total.msg}
                </span>
              )}
            </label>
          </div>

          {/* Row 3 */}
          <div className="grid gap-4 md:grid-cols-3">
            {/* Station */}
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-slate-800">
                Station
              </span>
              <input
                className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
                value={form.station}
                onChange={(e) => setForm({ ...form, station: e.target.value })}
                placeholder="e.g., Shell Indiranagar"
              />
            </label>

            {/* Brand */}
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-slate-800">Brand</span>
              <input
                className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
                value={form.brand}
                onChange={(e) => setForm({ ...form, brand: e.target.value })}
                placeholder="e.g., Shell"
              />
            </label>

            {/* Grade */}
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-slate-800">Grade</span>
              <input
                className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
                value={form.grade}
                onChange={(e) => setForm({ ...form, grade: e.target.value })}
                placeholder="e.g., Petrol 91"
              />
            </label>
          </div>

          {/* Notes */}
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-slate-800">
              Notes{" "}
              <span className="text-slate-500 font-normal">(max 500)</span>
            </span>
            <textarea
              className={[
                "rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm",
                "transition focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2",
                !v.notes.ok
                  ? "border-red-300 ring-red-400 focus:ring-red-500"
                  : "",
              ].join(" ")}
              rows={3}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Optional remarks about this fill-up"
              aria-invalid={!v.notes.ok}
              aria-describedby={!v.notes.ok ? "notes-error" : undefined}
            />
            {!v.notes.ok && (
              <span
                id="notes-error"
                className="text-xs font-medium text-red-600"
              >
                {v.notes.msg}
              </span>
            )}
          </label>

          {/* Live unit price preview */}
          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
            <p className="text-sm text-slate-700">
              Unit price preview:
              <span className="ml-2 font-semibold text-slate-900">
                {unitPriceDisplay
                  ? `${unitPriceDisplay}/${volumeLabel(volumeUnit)}`
                  : "—"}
              </span>
            </p>
            {unitPriceDisplay && (
              <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 ring-1 ring-blue-200">
                Auto-calculated
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              className={[
                "rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-md shadow-blue-600/20",
                "transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2",
                "disabled:cursor-not-allowed disabled:opacity-60",
              ].join(" ")}
              disabled={!canSave}
              title="Save fill-up"
            >
              {saving ? "Saving..." : "Save"}
            </button>
            {!v.ok && (
              <span
                className="text-xs font-medium text-red-600"
                role="status"
                aria-live="polite"
              >
                {v.msg}
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

function validate(f) {
  const today = new Date().toISOString().slice(0, 10);
  const res = {
    ok: true,
    msg: "",
    date: { ok: true, msg: "" },
    odo: { ok: true, msg: "" },
    liters: { ok: true, msg: "" },
    total: { ok: true, msg: "" },
    notes: { ok: true, msg: "" },
  };
  if (!f.vehicleId) mark("Vehicle is required");
  if (!f.date || f.date > today)
    markField("date", "Date cannot be in the future.");
  if (!(Number(f.odometerKm) >= 0))
    markField("odo", "Odometer must be a number ≥ 0.");
  if (!(Number(f.liters) > 0)) markField("liters", "Volume must be > 0.");
  if (!(Number(f.totalAmount) > 0)) markField("total", "Total must be > 0.");
  if ((f.notes || "").length > 500)
    markField("notes", "Notes must be ≤ 500 characters.");

  return res;

  function mark(msg) {
    res.ok = false;
    res.msg = msg || res.msg;
  }
  function markField(field, msg) {
    res.ok = false;
    res.msg = res.msg || "Please fix form errors.";
    res[field].ok = false;
    res[field].msg = msg;
  }
}
