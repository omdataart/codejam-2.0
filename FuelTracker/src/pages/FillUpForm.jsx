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
        vehicleId: f.vehicleId || response.data[0]?.id || "",
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
    <div className="mx-auto max-w-3xl p-6">
      <h2 className="text-2xl font-semibold mb-4">Add Fill-Up</h2>
      {err && <p className="text-red-600 mb-2">{err}</p>}

      <form onSubmit={submit} className="grid gap-4">
        <div className="grid md:grid-cols-2 gap-3">
          <label className="flex flex-col">
            <span className="text-sm text-gray-600">Vehicle *</span>
            <select
              className="border rounded p-2"
              value={form.vehicleId}
              onChange={(e) => setForm({ ...form, vehicleId: Number(e.target.value) })}
            >
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.label}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col">
            <span className="text-sm text-gray-600">Date *</span>
            <input
              type="date"
              className="border rounded p-2"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
            {!v.date.ok && (
              <span className="text-xs text-red-600">{v.date.msg}</span>
            )}
          </label>
        </div>

        <div className="grid md:grid-cols-3 gap-3">
          <label className="flex flex-col">
            <span className="text-sm text-gray-600">Odometer (km) *</span>
            <input
              className="border rounded p-2"
              value={form.odometerKm}
              onChange={(e) =>
                setForm({ ...form, odometerKm: e.target.value })
              }
            />
            {!v.odo.ok && (
              <span className="text-xs text-red-600">{v.odo.msg}</span>
            )}
          </label>

          <label className="flex flex-col">
            <span className="text-sm text-gray-600">
              Volume ({volumeLabel(volumeUnit)}) *
            </span>
            <input
              className="border rounded p-2"
              value={form.liters}
              onChange={(e) => setForm({ ...form, liters: e.target.value })}
              placeholder={
                volumeUnit === "gal" ? "auto-converts to liters on save" : ""
              }
            />
            {!v.liters.ok && (
              <span className="text-xs text-red-600">{v.liters.msg}</span>
            )}
          </label>

          <label className="flex flex-col">
            <span className="text-sm text-gray-600">Total ({currency}) *</span>
            <input
              className="border rounded p-2"
              value={form.totalAmount}
              onChange={(e) =>
                setForm({ ...form, totalAmount: e.target.value })
              }
            />
            {!v.total.ok && (
              <span className="text-xs text-red-600">{v.total.msg}</span>
            )}
          </label>
        </div>

        <div className="grid md:grid-cols-3 gap-3">
          <label className="flex flex-col">
            <span className="text-sm text-gray-600">Station</span>
            <input
              className="border rounded p-2"
              value={form.station}
              onChange={(e) =>
                setForm({ ...form, station: e.target.value })
              }
            />
          </label>
          <label className="flex flex-col">
            <span className="text-sm text-gray-600">Brand</span>
            <input
              className="border rounded p-2"
              value={form.brand}
              onChange={(e) => setForm({ ...form, brand: e.target.value })}
            />
          </label>
          <label className="flex flex-col">
            <span className="text-sm text-gray-600">Grade</span>
            <input
              className="border rounded p-2"
              value={form.grade}
              onChange={(e) => setForm({ ...form, grade: e.target.value })}
            />
          </label>
        </div>

        <label className="flex flex-col">
          <span className="text-sm text-gray-600">Notes (max 500)</span>
          <textarea
            className="border rounded p-2"
            rows={3}
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
          {!v.notes.ok && (
            <span className="text-xs text-red-600">{v.notes.msg}</span>
          )}
        </label>

        {/* Live unit price preview */}
        <div className="text-sm text-gray-700">
          Unit price preview:{" "}
          <span className="font-medium">
            {unitPriceDisplay
              ? `${unitPriceDisplay}/${volumeLabel(volumeUnit)}`
              : "—"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            className="bg-black text-white rounded px-4 py-2 disabled:opacity-50"
            disabled={!canSave}
          >
            {saving ? "Saving..." : "Save"}
          </button>
          {!v.ok && <span className="text-xs text-red-600">{v.msg}</span>}
        </div>
      </form>
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
