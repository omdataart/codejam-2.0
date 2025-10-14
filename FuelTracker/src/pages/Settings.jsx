import { useState } from "react";
import { useSettings, UNIT, EFF } from "../store/settingsStore";

export default function Settings() {
  const settings = useSettings();
  const [form, setForm] = useState({
    displayName: settings.displayName || "",
    currency: settings.currency || "INR",
    distanceUnit: settings.distanceUnit,
    volumeUnit: settings.volumeUnit,
    efficiencyUnit: settings.efficiencyUnit,
    priceDecimals: settings.priceDecimals ?? 2,
  });

  function save(e) {
    e.preventDefault();
    useSettings.getState().setProfile({
      displayName: form.displayName.trim(),
      currency: form.currency,
    });
    useSettings.getState().setUnits({
      distanceUnit: form.distanceUnit,
      volumeUnit: form.volumeUnit,
      efficiencyUnit: form.efficiencyUnit,
      priceDecimals: Math.min(3, Math.max(2, Number(form.priceDecimals) || 2)),
    });
    alert("Saved settings");
  }

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h2 className="text-2xl font-semibold mb-4">
        Profile & Display Settings
      </h2>
      <form onSubmit={save} className="grid gap-4">
        <section className="border rounded p-4">
          <h3 className="font-medium mb-2">Profile</h3>
          <div className="grid md:grid-cols-2 gap-3">
            <label className="flex flex-col">
              <span className="text-sm text-gray-600">Display name</span>
              <input
                className="border rounded p-2"
                value={form.displayName}
                onChange={(e) =>
                  setForm({ ...form, displayName: e.target.value })
                }
              />
            </label>
            <label className="flex flex-col">
              <span className="text-sm text-gray-600">Currency (ISO code)</span>
              <input
                className="border rounded p-2"
                value={form.currency}
                onChange={(e) =>
                  setForm({
                    ...form,
                    currency: e.target.value.toUpperCase().slice(0, 3),
                  })
                }
              />
            </label>
          </div>
        </section>

        <section className="border rounded p-4">
          <h3 className="font-medium mb-2">Units (view only)</h3>
          <div className="grid md:grid-cols-3 gap-3">
            <label className="flex flex-col">
              <span className="text-sm text-gray-600">Distance</span>
              <select
                className="border rounded p-2"
                value={form.distanceUnit}
                onChange={(e) =>
                  setForm({ ...form, distanceUnit: e.target.value })
                }
              >
                <option value={UNIT.DIST_KM}>Kilometers (km)</option>
                <option value={UNIT.DIST_MI}>Miles (mi)</option>
              </select>
            </label>

            <label className="flex flex-col">
              <span className="text-sm text-gray-600">Volume</span>
              <select
                className="border rounded p-2"
                value={form.volumeUnit}
                onChange={(e) =>
                  setForm({ ...form, volumeUnit: e.target.value })
                }
              >
                <option value={UNIT.VOL_L}>Liters (L)</option>
                <option value={UNIT.VOL_GAL}>US Gallons (gal)</option>
              </select>
            </label>

            <label className="flex flex-col">
              <span className="text-sm text-gray-600">Efficiency</span>
              <select
                className="border rounded p-2"
                value={form.efficiencyUnit}
                onChange={(e) =>
                  setForm({ ...form, efficiencyUnit: e.target.value })
                }
              >
                <option value={EFF.L_PER_100KM}>
                  L/100km (lower is better)
                </option>
                <option value={EFF.MPG}>MPG (higher is better)</option>
              </select>
            </label>
          </div>

          <div className="mt-3 grid md:grid-cols-3 gap-3">
            <label className="flex flex-col">
              <span className="text-sm text-gray-600">
                Price decimals (per L/gal)
              </span>
              <input
                className="border rounded p-2"
                type="number"
                min="2"
                max="3"
                value={form.priceDecimals}
                onChange={(e) =>
                  setForm({ ...form, priceDecimals: e.target.value })
                }
              />
            </label>
            <div className="text-xs text-gray-500 md:col-span-2">
              Display only: data stays stored as metric (km, L). Conversions are
              computed at view time.
            </div>
          </div>
        </section>

        <div>
          <button className="bg-black text-white rounded px-4 py-2">
            Save
          </button>
        </div>
      </form>
    </div>
  );
}
