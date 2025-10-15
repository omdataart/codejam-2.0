// src/pages/Settings.jsx
import { useEffect, useState } from "react";
import { useSettings, UNIT, EFF } from "../store/settingsStore";
import { useAuthStore } from "../store/authStore";
import api from "../lib/api";

export default function Settings() {
  const settings = useSettings();
  const setCurrency = useSettings((s) => s.setCurrency);
  const setUnits = useSettings((s) => s.setUnits);

  // Auth actions (fallback to either signOut or logout depending on your store)
  const signOut =
    useAuthStore((s) => s.signOut) || useAuthStore((s) => s.logout);

  const [form, setForm] = useState({
    displayName: "",
    currency: settings.currency || "INR",
    distanceUnit: settings.distanceUnit,
    volumeUnit: settings.volumeUnit,
    efficiencyUnit: settings.efficiencyUnit,
    priceDecimals: settings.priceDecimals ?? 2,
  });

  // Delete-account dialog state
  const [showDelete, setShowDelete] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

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
        setForm((f) => ({
          ...f,
          displayName: p.displayName ?? f.displayName,
          currency: p.preferredCurrency || f.currency || "INR",
          distanceUnit: p.preferredDistanceUnit ?? f.distanceUnit,
          volumeUnit: p.preferredVolumeUnit ?? f.volumeUnit,
          // If BE returns efficiencyUnit/priceDecimals, map them here similarly
        }));
      } catch {
        // silently ignore
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function save(e) {
    e.preventDefault();

    // optimistic local store update
    setCurrency(form.currency);
    setUnits({
      distanceUnit: form.distanceUnit,
      volumeUnit: form.volumeUnit,
      efficiencyUnit: form.efficiencyUnit,
      priceDecimals: form.priceDecimals,
    });

    // persist to backend
    await api.put("/Profile", {
      displayName: form.displayName,
      preferredCurrency: form.currency,
      preferredDistanceUnit: form.distanceUnit,
      preferredVolumeUnit: form.volumeUnit,
      efficiencyUnit: form.efficiencyUnit,
      priceDecimals: form.priceDecimals,
    });
  }

  async function handleSignOut() {
    try {
      await signOut?.();
    } catch {
      // optionally toast error
    }
  }

  function openDeleteDialog() {
    setConfirmText("");
    setDeleteError("");
    setShowDelete(true);
  }

  function closeDeleteDialog() {
    if (!deleting) setShowDelete(false);
  }

  async function handleDeleteAccount() {
    if (confirmText !== "DELETE") return;
    try {
      setDeleting(true);
      setDeleteError("");
      // 🔁 Replace with your real endpoint
      await api.delete("/profile");
      await signOut?.();
    } catch (e) {
      setDeleteError(
        e?.response?.data?.message || e.message || "Failed to delete account"
      );
      setDeleting(false);
    }
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
              {/* Distance */}
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

              {/* Volume */}
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

        {/* Account / Danger Zone */}
        {/* Account / Danger Zone */}
        {/* Account / Danger Zone */}
        <section className="mt-10 rounded-2xl border border-rose-200 bg-gradient-to-br from-rose-50 to-white p-6 shadow-sm">
          <h3 className="mb-5 text-lg font-semibold text-rose-900 flex items-center gap-2">
            <span className="i-lucide-shield-alert text-rose-600" />
            Account Management
          </h3>

          {/* Sign Out */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-rose-100">
            <div>
              <p className="text-sm font-medium text-slate-900">Sign out</p>
              <p className="text-xs text-slate-600">
                Log out of FuelTracker safely on this device.
              </p>
            </div>
            <button
              onClick={handleSignOut}
              type="button"
              className="rounded-xl border border-slate-300 bg-white px-5 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
            >
              Sign out
            </button>
          </div>

          {/* Delete Account */}
          <div className="mt-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-rose-900">
                Delete account
              </p>
              <p className="text-xs text-rose-700">
                Permanently delete your account and all data.{" "}
                <span className="font-semibold">
                  This action cannot be undone.
                </span>
              </p>
            </div>
            <button
              type="button"
              onClick={openDeleteDialog}
              className="rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 px-5 py-2 text-sm font-medium text-white shadow-md shadow-rose-600/30 transition hover:from-rose-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-rose-600 focus:ring-offset-2"
            >
              Delete account
            </button>
          </div>
        </section>
      </div>

      {/* Delete-account Modal */}
      {showDelete && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          aria-labelledby="delete-account-title"
          role="dialog"
          aria-modal="true"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-slate-900/50"
            onClick={closeDeleteDialog}
          />

          {/* Dialog */}
          <div className="relative z-[101] w-full max-w-md rounded-2xl bg-white p-5 shadow-xl ring-1 ring-slate-200">
            <h4
              id="delete-account-title"
              className="text-lg font-semibold text-slate-900"
            >
              Delete account?
            </h4>
            <p className="mt-2 text-sm text-slate-600">
              This will permanently remove your account and all associated data
              from FuelTracker.{" "}
              <span className="font-semibold">
                This action cannot be undone.
              </span>
            </p>

            <div className="mt-4">
              <label className="text-sm text-slate-700">
                Type <span className="font-mono font-semibold">DELETE</span> to
                confirm:
              </label>
              <input
                autoFocus
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-600 focus:ring-offset-2"
                placeholder="DELETE"
              />
              {deleteError && (
                <p className="mt-2 text-sm text-rose-600">{deleteError}</p>
              )}
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                disabled={deleting}
                onClick={closeDeleteDialog}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={confirmText !== "DELETE" || deleting}
                className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-600 focus:ring-offset-2 disabled:opacity-60"
              >
                {deleting ? "Deleting…" : "Delete account"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
