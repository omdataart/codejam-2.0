import { useEffect, useState } from "react";
import { useSettings, UNIT, EFF } from "../store/settingsStore";
import api from "../lib/api";
export default function Settings() {
  const settings = useSettings();
  const [form, setForm] = useState({
    displayName: "",
    preferredCurrency: "INR",
    preferredDistanceUnit: settings.preferredDistanceUnit,
    preferredVolumeUnit: settings.preferredVolumeUnit,
    efficiencyUnit: settings.efficiencyUnit,
    priceDecimals: settings.priceDecimals ?? 2,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get("/auth/me"); // Replace with your API endpoint
        const userProfile = response.data.data;
        setForm((f) => ({
          ...f,
          displayName: userProfile.displayName,
          preferredCurrency: userProfile.preferredCurrency || "INR",
          preferredDistanceUnit: userProfile.preferredDistanceUnit,
          preferredVolumeUnit: userProfile.preferredVolumeUnit,
        }));
        console.log(response.data.data);
      } catch {
        /* empty */
      } finally {
        /* empty */
      }
    };
    fetchData(); // Call the async function
  }, [settings]);

  async function save(e) {
    e.preventDefault();
    // useSettings.getState().setProfile({
    //   displayName: form.displayName.trim(),
    //   preferredCurrency: form.preferredCurrency,
    // });
    // useSettings.getState().setUnits({
    //   preferredDistanceUnit: form.preferredDistanceUnit,
    //   preferredVolumeUnit: form.preferredVolumeUnit,
    //   efficiencyUnit: form.efficiencyUnit,
    //   priceDecimals: Math.min(3, Math.max(2, Number(form.priceDecimals) || 2)),
    // });
    await api.put(`/Profile/`, {
      ...form,
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
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-slate-800">
                  Currency (ISO code)
                </span>
                <input
                  className="uppercase tracking-widest rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
                  value={form.preferredCurrency}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      preferredCurrency: e.target.value
                        .toUpperCase()
                        .slice(0, 3),
                    })
                  }
                  placeholder="e.g., INR"
                  aria-label="Preferred currency in ISO format"
                />
                <span className="text-xs text-slate-500">
                  Example: INR, USD, EUR
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
                  value={form.preferredDistanceUnit}
                  onChange={(e) =>
                    setForm({ ...form, preferredDistanceUnit: e.target.value })
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
                  value={form.preferredVolumeUnit}
                  onChange={(e) =>
                    setForm({ ...form, preferredVolumeUnit: e.target.value })
                  }
                  aria-label="Preferred volume unit"
                >
                  <option value={UNIT.VOL_L}>Liters (L)</option>
                  <option value={UNIT.VOL_GAL}>US Gallons (gal)</option>
                </select>
              </label>

              {/* Keeping efficiency selector commented as in your codebase */}
              {/* <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-slate-800">Efficiency</span>
                <select
                  className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
                  value={form.efficiencyUnit}
                  onChange={(e) =>
                    setForm({ ...form, efficiencyUnit: e.target.value })
                  }
                >
                  <option value={EFF.L_PER_100KM}>L/100km (lower is better)</option>
                  <option value={EFF.MPG}>MPG (higher is better)</option>
                </select>
              </label> */}
            </div>

            {/* Keeping price decimals commented as in your codebase */}
            {/* <div className="mt-3 grid gap-3 md:grid-cols-3">
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-slate-800">Price decimals (per L/gal)</span>
                <input
                  className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
                  type="number"
                  min="2"
                  max="3"
                  value={form.priceDecimals}
                  onChange={(e) =>
                    setForm({ ...form, priceDecimals: e.target.value })
                  }
                  aria-label="Price decimals"
                />
              </label>
              <div className="md:col-span-2 text-xs text-slate-500">
                Display only: data stays stored as metric (km, L). Conversions are computed at view time.
              </div>
            </div> */}
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
