// src/pages/Settings.jsx
import { useEffect, useState } from "react";
import { useSettings, UNIT, EFF } from "../store/settingsStore";
import api from "../lib/api";

export default function Settings() {
  const settings = useSettings();
  const setCurrency = useSettings((s) => s.setCurrency);
  const setUnits = useSettings((s) => s.setUnits);
  const [form, setForm] = useState({
    displayName: "",
    currency: settings.currency || "INR",
    distanceUnit: settings.distanceUnit,
    volumeUnit: settings.volumeUnit,
    efficiencyUnit: settings.efficiencyUnit,
    priceDecimals: settings.priceDecimals ?? 2,
  });

  const currencies = [
    { code: "INR", label: "Indian Rupee (INR)" },
    { code: "USD", label: "US Dollar (USD)" },
    { code: "EUR", label: "Euro (EUR)" },
    { code: "GBP", label: "British Pound (GBP)" },
    { code: "JPY", label: "Japanese Yen (JPY)" },
    { code: "AUD", label: "Australian Dollar (AUD)" },
    { code: "CAD", label: "Canadian Dollar (CAD)" },
    { code: "CHF", label: "Swiss Franc (CHF)" },
    { code: "SGD", label: "Singapore Dollar (SGD)" },
    { code: "AED", label: "UAE Dirham (AED)" },
  ];

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/auth/me");
        const p = data?.data || {};
        // Map BE fields -> local form/store naming
        setForm((f) => ({
          ...f,
          displayName: p.displayName ?? f.displayName,
          currency: p.preferredCurrency || f.currency || "INR",
          distanceUnit: p.preferredDistanceUnit ?? f.distanceUnit,
          volumeUnit: p.preferredVolumeUnit ?? f.volumeUnit,
          // efficiencyUnit / priceDecimals as needed if BE returns them
        }));
      } catch {}
    })();
    // we don’t need settings in deps; form is independent
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function save(e) {
    e.preventDefault();
    // Optimistic update to local store so UI updates immediately
    setCurrency(form.currency);
    setUnits({
      distanceUnit: form.distanceUnit,
      volumeUnit: form.volumeUnit,
      efficiencyUnit: form.efficiencyUnit,
      priceDecimals: form.priceDecimals,
    });

    // Persist to backend (map local -> BE fields)
    await api.put("/Profile", {
      displayName: form.displayName,
      preferredCurrency: form.currency,
      preferredDistanceUnit: form.distanceUnit,
      preferredVolumeUnit: form.volumeUnit,
      efficiencyUnit: form.efficiencyUnit,
      priceDecimals: form.priceDecimals,
    });
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="mx-auto max-w-3xl px-4 py-6 sm:py-10">
        <div className="mb-4 sm:mb-6">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
            Profile &amp; Display Settings
          </h2>
          <p className="text-sm text-slate-600">
            Update your profile and preferred display units. Changes affect how
            values are shown.
          </p>
        </div>

        <form onSubmit={save} className="grid gap-5" noValidate>
          {/* Profile */}
          <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
            <h3 className="mb-3 text-sm font-semibold text-slate-900">
              Profile
            </h3>
            <div className="grid gap-3 md:grid-cols-2">
              {/* Display Name */}
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-slate-800">
                  Display name
                </span>
                <input
                  className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
                  value={form.displayName}
                  onChange={(e) =>
                    setForm({ ...form, displayName: e.target.value })
                  }
                  placeholder="Your name"
                  aria-label="Display name"
                />
              </label>

              {/* Currency Dropdown */}
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-slate-800">
                  Currency (ISO code)
                </span>
                <select
                  className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
                  value={form.currency}
                  onChange={(e) =>
                    setForm({ ...form, currency: e.target.value })
                  }
                  aria-label="Preferred currency"
                >
                  {currencies.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.label}
                    </option>
                  ))}
                </select>
                <span className="text-xs text-slate-500">
                  Select preferred display currency
                </span>
              </label>
            </div>
          </section>

          {/* Units */}
          <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
            <h3 className="mb-3 text-sm font-semibold text-slate-900">
              Units{" "}
              <span className="text-slate-500 font-normal">(view only)</span>
            </h3>

            <div className="grid gap-3 md:grid-cols-3">
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-slate-800">
                  Distance
                </span>
                <select
                  className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
                  value={form.distanceUnit}
                  onChange={(e) =>
                    setForm({ ...form, distanceUnit: e.target.value })
                  }
                  aria-label="Preferred distance unit"
                >
                  <option value={UNIT.DIST_KM}>Kilometers (km)</option>
                  <option value={UNIT.DIST_MI}>Miles (mi)</option>
                </select>
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-slate-800">
                  Volume
                </span>
                <select
                  className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
                  value={form.volumeUnit}
                  onChange={(e) =>
                    setForm({ ...form, volumeUnit: e.target.value })
                  }
                  aria-label="Preferred volume unit"
                >
                  <option value={UNIT.VOL_L}>Liters (L)</option>
                  <option value={UNIT.VOL_GAL}>US Gallons (gal)</option>
                </select>
              </label>
            </div>
          </section>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-md shadow-blue-600/20 transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
              title="Save settings"
            >
              Save
            </button>
            <span className="text-xs text-slate-500" aria-hidden="true">
              Changes apply to how values are displayed.
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}
