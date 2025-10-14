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
        const [v, f] = await Promise.all([
          api.get("/vehicles"),

        ]);
        setVehicles(v.data.data || []);
        console.log(f.data);
      
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
        var datefilter =`&windowDays=${period}`;
        if(period==="custom" && (!customFrom || !customTo || new Date(customFrom) > new Date(customTo))){
         
          return;
        } else {
          if(customFrom && customTo){
            
             datefilter = `&from=${customFrom}&to=${customTo}`;
          }
         
        }
        const [f] = await Promise.all([
          api.get(`Stats/brand-comparison?vehicleId=${vehicleId === 0 ? "" : vehicleId}&&${datefilter}`),
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
  //   if (!fills.length) return { rows: [] };

  //   const range = periodRange(period, customFrom, customTo);
  //   if (period === "custom" && !range.valid) return { rows: [] };
  //   const { from, to } = range;

  //   const scoped = fills.filter((f) => {
  //     const d = new Date(f.date);
  //     const inRange = d >= new Date(from.toDateString()) && d <= to;
  //     const vMatch = vehicleId === 0 || f.vehicleId === vehicleId;
  //     return inRange && vMatch;
  //   });
  //   if (!scoped.length) return { rows: [] };

  //   const byVehicle = new Map();
  //   for (const f of scoped) {
  //     if (!byVehicle.has(f.vehicleId)) byVehicle.set(f.vehicleId, []);
  //     byVehicle.get(f.vehicleId).push({ ...f });
  //   }
  //   for (const [, arr] of byVehicle) {
  //     arr.sort((a, b) => new Date(a.date) - new Date(b.date));
  //     let prev = null;
  //     for (const f of arr) {
  //       f.unitPrice = Number(f.totalAmount) / Number(f.liters); // per L canonical
  //       if (prev && f.odometerKm > prev.odometerKm) {
  //         const dist = f.odometerKm - prev.odometerKm;
  //         f.l100 = (Number(f.liters) / dist) * 100; // canonical L/100km
  //       } else {
  //         f.l100 = null;
  //       }
  //       prev = f;
  //     }
  //   }
  //   const withMetrics = [...byVehicle.values()].flat();

  //   const key = (f) =>
  //     `${(f.fuel_brand || "").trim().toLowerCase()}|${(f.grade || "")
  //       .trim()
  //       .toLowerCase()}`;
  //   const groups = new Map();
  //   for (const f of withMetrics) {
  //     const k = key(f);
  //     if (!groups.has(k)) {
  //       groups.set(k, {
  //         brand: (f.fuel_brand || "").trim() || "—",
  //         grade: (f.grade || "").trim() || "—",
  //         count: 0,
  //         costPerL: [],
  //         l100s: [],
  //       });
  //     }
  //     const g = groups.get(k);
  //     g.count += 1;
  //     const up = f.unitPrice;
  //     if (isFinite(up)) g.costPerL.push(up);
  //     if (isFinite(f.l100)) g.l100s.push(f.l100);
  //   }

  //   const rows = [...groups.values()]
  //     .map((g) => ({
  //       brand: g.brand,
  //       grade: g.grade,
  //       count: g.count,
  //       avgCostPerL: g.costPerL.length
  //         ? g.costPerL.reduce((a, b) => a + b, 0) / g.costPerL.length
  //         : null, // canonical per L
  //       avgL100: g.l100s.length
  //         ? g.l100s.reduce((a, b) => a + b, 0) / g.l100s.length
  //         : null, // canonical L/100km
  //     }))
  //     .sort(
  //       (a, b) =>
  //         b.count - a.count ||
  //         a.brand.localeCompare(b.brand) ||
  //         a.grade.localeCompare(b.grade)
  //     );

  //   return { rows };
  // }, [fills, vehicleId, period, customFrom, customTo]);

  const showCustomMsg =
    period === "custom" &&
    (!customFrom || !customTo || new Date(customFrom) > new Date(customTo));

  return (
    <div className="mx-auto max-w-6xl p-6">
      <h2 className="text-2xl font-semibold mb-4">Brand / Grade Statistics</h2>
      {error && <p className="text-red-600 mb-2">{error}</p>}

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <select
          className="border rounded p-2"
          value={vehicleId}
          onChange={(e) => setVehicleId(Number(e.target.value))}
        >
          <option value="all">All vehicles</option>
          {vehicles.map((v) => (
            <option key={v.id} value={v.id}>
              {v.label}
            </option>
          ))}
        </select>

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

      {/* Table */}
      <div className="overflow-x-auto border rounded">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-2">
                Brand
                <InfoTip title="Fuel brand as entered on fill-up." />
              </th>
              <th className="text-left p-2">
                Grade
                <InfoTip title="Fuel grade as entered (e.g., Regular, Premium, 95)." />
              </th>
              <th className="text-left p-2">
                Avg Cost / {volumeLabel(volumeUnit)}
                <InfoTip
                  title={`Mean of unit price in range. Converted to ${volumeLabel(
                    volumeUnit
                  )} if needed.`}
                />
              </th>
              <th className="text-left p-2">
                Avg Consumption ({effLabel(efficiencyUnit)})
                <InfoTip title="Mean of per-fill efficiency where distance since last fill > 0." />
              </th>
              <th className="text-left p-2">
                # Fill-ups
                <InfoTip title="Number of fill-ups matching brand × grade in the selected scope." />
              </th>
            </tr>
          </thead>
          <tbody>
            {fills.map((r, idx) => {
              // const avgPriceDisp =
              //   r.avgCostPerL != null
              //     ? volumeUnit === "gal"
              //       ? r.avgCostPerL * L_PER_GAL
              //       : r.avgCostPerL
              //     : null;
              // const priceStr =
              //   avgPriceDisp != null
              //     ? `${new Intl.NumberFormat(undefined, {
              //         style: "currency",
              //         currency,
              //         maximumFractionDigits: priceDecimals,
              //       }).format(avgPriceDisp)}/${volumeLabel(volumeUnit)}`
              //     : "—";

              // const avgEffDisp =
              //   r.avgL100 != null
              //     ? efficiencyUnit === "mpg"
              //       ? lPer100kmToMpg(r.avgL100)
              //       : r.avgL100
              //     : null;

              return (
                <tr key={`${r.brand}|${r.grade}|${idx}`} className="border-t">
                  <td className="p-2">{r.brand}</td>
                  <td className="p-2">{r.grade}</td>
                  <td className="p-2">{r.avgCostPerLiter}</td>
                  <td className="p-2">
                    {r.avgConsumptionLPer100Km}
                  </td>
                  <td className="p-2">{r.fillUpCount}</td>
                </tr>
              );
            })}

            {fills.length === 0 && (
              <tr>
                <td className="p-4 text-gray-500" colSpan={5}>
                  {showCustomMsg
                    ? "Pick a valid custom range (From ≤ To) to see data."
                    : "No data in the selected scope."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-gray-500 mt-2">
        Notes: Avg Cost uses unit price (total ÷ volume) converted to{" "}
        {volumeLabel(volumeUnit)} for display. Consumption averages per-fill
        efficiency where a valid previous fill exists (same vehicle, increasing
        odometer).
      </p>
    </div>
  );
}
