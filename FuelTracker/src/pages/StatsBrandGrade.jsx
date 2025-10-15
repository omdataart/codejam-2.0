import { useEffect, useMemo, useState } from "react";
import api from "../lib/api";
import { num } from "../utils/format";
import PeriodSelector, { periodRange } from "../components/PeriodSelector";
import InfoTip from "../components/InfoTip";

import { useSettings } from "../store/settingsStore";
import {
  volumeLabel,
  effLabel,
  L_PER_GAL,
  lPer100kmToMpg,
} from "../utils/conversions";

export default function StatsBrandGrade() {
  const [vehicles, setVehicles] = useState([]);
  const [fills, setFills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [vehicleId, setVehicleId] = useState(0);
  const [period, setPeriod] = useState(30); // "30" | "90" | "ytd" | "custom"
  const [customFrom, setCustomFrom] = useState(""); // yyyy-mm-dd
  const [customTo, setCustomTo] = useState("");

  const { currency, volumeUnit, efficiencyUnit, priceDecimals } = useSettings();

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [v] = await Promise.all([api.get("/vehicles")]);
        setVehicles(v.data.data || []);
        

        setError("");
      } catch (e) {
        setError(e?.response?.data?.message || e.message || "Failed to load");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        var datefilter = `&windowDays=${period}`;
        if (
          period === "custom" &&
          (!customFrom ||
            !customTo ||
            new Date(customFrom) > new Date(customTo))
        ) {
          return;
        } else {
          if (customFrom && customTo) {
            datefilter = `&from=${customFrom}&to=${customTo}`;
          }
        }
        const [f] = await Promise.all([
          api.get(
            `Stats/brand-comparison?vehicleId=${
              vehicleId === 0 ? "" : vehicleId
            }&&${datefilter}`
          ),
        ]);
        setFills(f.data.data.aggregates || []);

        setError("");
      } catch (e) {
        setError(e?.response?.data?.message || e.message || "Failed to load");
      } finally {
        setLoading(false);
      }
    })();
  }, [vehicleId, period, customFrom, customTo]);

  // const { rows } = useMemo(() => {
  //   ...
  // }, [fills, vehicleId, period, customFrom, customTo]);

  const showCustomMsg =
    period === "custom" &&
    (!customFrom || !customTo || new Date(customFrom) > new Date(customTo));

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:py-10">
        <div className="mb-4 sm:mb-6">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
            Brand / Grade Statistics
          </h2>
          <p className="text-sm text-slate-600">
            Compare average cost and consumption by fuel brand × grade.
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

        {/* Controls */}
        <div className="mb-6 rounded-xl border border-slate-200 bg-white p-3 sm:p-4 shadow-sm">
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <label
              className="text-sm font-medium text-slate-700"
              htmlFor="vehicle"
            >
              Vehicle
            </label>
            <select
              id="vehicle"
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
              value={vehicleId}
              onChange={(e) => setVehicleId(Number(e.target.value))}
              aria-label="Select vehicle"
            >
              {/* Keep values as in MVP to avoid logic changes */}
              <option value="all">All vehicles</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.label}
                </option>
              ))}
            </select>

            <div className="ml-auto">
              <PeriodSelector
                value={period}
                onChange={setPeriod}
                customFrom={customFrom}
                customTo={customTo}
                onChangeFrom={setCustomFrom}
                onChangeTo={setCustomTo}
                autoApply={true}
              />
            </div>
          </div>

          {showCustomMsg && (
            <p className="mt-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700">
              Pick a valid custom range (From ≤ To) to see data.
            </p>
          )}
        </div>

        {/* Loading placeholder */}
        {loading ? (
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-slate-700">Loading…</p>
            <div className="mt-4 h-2 w-full animate-pulse rounded bg-slate-100" />
          </div>
        ) : (
          <>
            {/* Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
              <table className="min-w-full text-sm">
                <thead className="sticky top-0 z-10 bg-slate-50 text-slate-700">
                  <tr className="border-b border-slate-200">
                    <th className="text-left px-3 py-2">
                      Brand{" "}
                      <InfoTip title="Fuel brand as entered on fill-up." />
                    </th>
                    <th className="text-left px-3 py-2">
                      Grade{" "}
                      <InfoTip title="Fuel grade as entered (e.g., Regular, Premium, 95)." />
                    </th>
                    <th className="text-left px-3 py-2">
                      Avg Cost / {volumeLabel(volumeUnit)}{" "}
                      <InfoTip
                        title={`Mean of unit price in range. Converted to ${volumeLabel(
                          volumeUnit
                        )} if needed.`}
                      />
                    </th>
                    <th className="text-left px-3 py-2">
                      Avg Consumption ({effLabel(efficiencyUnit)}){" "}
                      <InfoTip title="Mean of per-fill efficiency where distance since last fill > 0." />
                    </th>
                    <th className="text-left px-3 py-2">
                      # Fill-ups{" "}
                      <InfoTip title="Number of fill-ups matching brand × grade in the selected scope." />
                    </th>
                  </tr>
                </thead>

                <tbody className="text-slate-800">
                  {fills.map((r, idx) => (
                    <tr
                      key={`${r.brand}|${r.grade}|${idx}`}
                      className="border-t border-slate-200 hover:bg-slate-50/60"
                    >
                      <td className="px-3 py-2">{r.brand}</td>
                      <td className="px-3 py-2">{r.grade}</td>
                      <td className="px-3 py-2">{r.avgCostPerLiter}</td>
                      <td className="px-3 py-2">{r.avgConsumptionLPer100Km}</td>
                      <td className="px-3 py-2">{r.fillUpCount}</td>
                    </tr>
                  ))}

                  {fills.length === 0 && (
                    <tr>
                      <td
                        className="px-3 py-6 text-center text-slate-500"
                        colSpan={5}
                      >
                        {showCustomMsg
                          ? "Pick a valid custom range (From ≤ To) to see data."
                          : "No data in the selected scope."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <p className="mt-2 text-xs text-slate-500">
              Notes: Avg Cost uses unit price (total ÷ volume) converted to{" "}
              {volumeLabel(volumeUnit)} for display. Consumption averages
              per-fill efficiency where a valid previous fill exists (same
              vehicle, increasing odometer).
            </p>
          </>
        )}
      </div>
    </div>
  );
}
