import { useEffect, useMemo, useState } from "react";
import api from "../lib/api";
import { num } from "../utils/format";
import PeriodSelector, { periodRange } from "../components/PeriodSelector";
import InfoTip from "../components/InfoTip";
import AddFillUpFAB from "../components/AddFillUpFAB";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

import { useSettings } from "../store/settingsStore";
import {
  distanceLabel,
  volumeLabel,
  effLabel,
  KM_PER_MILE,
  L_PER_GAL,
  kmToMi,
  lPer100kmToMpg,
} from "../utils/conversions";

export default function Dashboard() {
  const [vehicles, setVehicles] = useState([]);
  const [fills, setFills] = useState([]);
  const [vehicleId, setVehicleId] = useState(0);

  const [period, setPeriod] = useState("30"); // "30" | "90" | "ytd" | "custom"
  const [customFrom, setCustomFrom] = useState(""); // yyyy-mm-dd
  const [customTo, setCustomTo] = useState("");

  const [loading, setLoading] = useState(true);

  const { currency, distanceUnit, volumeUnit, efficiencyUnit, priceDecimals } =
    useSettings();

  // helpers for display conversions
  const dist = (km) =>
    distanceUnit === "mi" ? Math.round(kmToMi(km)) : Math.round(km);
  const eff = (l100) =>
    efficiencyUnit === "mpg"
      ? l100
        ? Number(lPer100kmToMpg(l100).toFixed(1))
        : null
      : l100 != null
      ? Number(l100.toFixed(1))
      : null;
  const pricePerVol = (pricePerL) => {
    const p = volumeUnit === "gal" ? pricePerL * L_PER_GAL : pricePerL;
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: priceDecimals,
    }).format(p);
  };
  const costPerDistance = (costPerKm) => {
    const v = distanceUnit === "mi" ? costPerKm * KM_PER_MILE : costPerKm;
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(v);
  };
  const totalMoney = (n) =>
    new Intl.NumberFormat(undefined, { style: "currency", currency }).format(
      n ?? 0
    );

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [v, f] = await Promise.all([
        api.get("/vehicles"),
        api.get("/FuelEntries"),
      ]);
      setVehicles(v.data.data || []);
      setFills(f.data.data.items || []);
      setLoading(false);
    })();
  }, []);

  const { cards, series } = useMemo(() => {
    if (fills && !fills.length)
      return { cards: null, series: { costPerL: [], l100: [] } };

    const range = periodRange(period, customFrom, customTo);
    if (period === "custom" && !range.valid) {
      return { cards: { empty: true }, series: { costPerL: [], l100: [] } };
    }
    const { from, to } = range;

    const scoped = fills.filter((f) => {
      const d = new Date(f.date);
      const inRange = d >= new Date(from.toDateString()) && d <= to;
      const vMatch = vehicleId === 0 || f.vehicleId === vehicleId;
      return inRange && vMatch;
    });

    if (!scoped.length)
      return { cards: { empty: true }, series: { costPerL: [], l100: [] } };

    // group by vehicle to compute distance_since_last
    const byVeh = new Map();
    for (const f of scoped) {
      if (!byVeh.has(f.vehicleId)) byVeh.set(f.vehicleId, []);
      byVeh.get(f.vehicleId).push({ ...f });
    }

    let totalSpend = 0;
    let totalDistance = 0;
    const unitPrices = [];
    const perFillCostPerKm = [];
    const perFillL100 = [];
    const points = []; // timeline points (merged across vehicles)

    for (const [, arr] of byVeh) {
      arr.sort((a, b) => new Date(a.date) - new Date(b.date));
      let prev = null;
      for (const f of arr) {
        const unit = Number(f.totalAmount) / Number(f.liters); // per L canonical
        if (isFinite(unit)) unitPrices.push(unit);
        totalSpend += Number(f.totalAmount);

        // add cost/L point (always)
        points.push({
          date: f.date,
          unitPrice: isFinite(unit) ? unit : null,
          l100: null,
        });

        if (prev && f.odometerKm > prev.odometerKm) {
          const distKm = f.odometerKm - prev.odometerKm;
          totalDistance += distKm;
          const l100 = (Number(f.liters) / distKm) * 100;
          const cpk = Number(f.totalAmount) / distKm; // cost per km
          if (isFinite(l100)) perFillL100.push(l100);
          if (isFinite(cpk)) perFillCostPerKm.push(cpk);

          // attach l100 to the last point with this date
          let idx = -1;
          for (let i = points.length - 1; i >= 0; i--) {
            if (points[i].date === f.date) {
              idx = i;
              break;
            }
          }
          if (idx >= 0) points[idx].l100 = isFinite(l100) ? l100 : null;
        }
        prev = f;
      }
    }

    // normalize timeline for charts (asc by date)
    points.sort((a, b) => new Date(a.date) - new Date(b.date));
    const costPerL = points
      .filter((p) => p.unitPrice != null)
      .map((p) => ({ date: p.date, value: p.unitPrice })); // still per L; convert in tooltip
    const l100Series = points
      .filter((p) => p.l100 != null)
      .map((p) => ({ date: p.date, value: p.l100 })); // still L/100km; convert in tooltip

    // KPI calculations (canonical)
    const msPerDay = 24 * 3600 * 1000;
    const days = Math.max(1, Math.round((range.to - range.from) / msPerDay));
    const avg = (arr) =>
      arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null;

    const kpis = {
      rollingAvgConsumption: avg(perFillL100), // L/100km
      rollingAvgCostPerL: avg(unitPrices), // currency/L
      totalSpend, // currency
      totalDistance, // km
      avgCostPerKm: avg(perFillCostPerKm), // currency/km
      avgDistancePerDay: totalDistance / days, // km/day
    };

    var result = {
      cards: { ...kpis, empty: false },
      series: { costPerL, l100: l100Series },
    };
    console.log(result);
    return result;
  }, [fills, vehicleId, period, customFrom, customTo]);

  const showCustomMsg =
    period === "custom" &&
    (!customFrom || !customTo || new Date(customFrom) > new Date(customTo));

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:py-10">
        <div className="mb-4 sm:mb-6">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
            Dashboard
          </h2>
          <p className="text-sm text-slate-600">
            Your fuel costs and efficiency at a glance.
          </p>
        </div>

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
              <option value={0}>All vehicles</option>
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
            <p className="mt-2 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
              Pick a valid custom range (From ≤ To) to see data.
            </p>
          )}
        </div>

        {/* Content */}
        <div aria-live="polite" className="space-y-6">
          {loading ? (
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-slate-600">Loading…</p>
              <div className="mt-4 h-2 w-full animate-pulse rounded bg-slate-100" />
            </div>
          ) : !cards || cards.empty ? (
            <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
              <p className="text-slate-600">
                {showCustomMsg
                  ? "Pick a valid custom range (From ≤ To) to see data."
                  : "No data in the selected range."}
              </p>
            </div>
          ) : (
            <>
              {/* KPI Cards */}
              <div className="grid gap-4 md:grid-cols-3">
                <Card
                  title="Rolling Avg Consumption"
                  value={
                    cards.rollingAvgConsumption != null
                      ? `${eff(cards.rollingAvgConsumption)} ${effLabel(
                          efficiencyUnit
                        )}`
                      : "—"
                  }
                  info="Fuel efficiency. L/100km: lower is better. (Imperial view shows MPG: higher is better.)"
                />
                <Card
                  title={`Avg Cost / ${volumeLabel(volumeUnit)}`}
                  value={
                    cards.rollingAvgCostPerL != null
                      ? `${pricePerVol(cards.rollingAvgCostPerL)}/${volumeLabel(
                          volumeUnit
                        )}`
                      : "—"
                  }
                  info="Average unit price over the selected period."
                />
                <Card
                  title="Total Spend"
                  value={totalMoney(cards.totalSpend)}
                  info="Sum of total amounts in the selected period."
                />

                <Card
                  title="Total Distance"
                  value={`${dist(cards.totalDistance)} ${distanceLabel(
                    distanceUnit
                  )}`}
                  info="Sum of distances between consecutive fill-ups (per vehicle)."
                />
                <Card
                  title={`Avg Cost / ${distanceLabel(distanceUnit)}`}
                  value={
                    cards.avgCostPerKm != null
                      ? `${costPerDistance(cards.avgCostPerKm)}/${distanceLabel(
                          distanceUnit
                        )}`
                      : "—"
                  }
                  info="Average per-fill cost per distance. Requires consecutive fill-ups with increasing odometer."
                />
                <Card
                  title="Avg Distance / Day"
                  value={`${dist(cards.avgDistancePerDay)} ${distanceLabel(
                    distanceUnit
                  )}`}
                  info="Total distance divided by days in the selected range."
                />
              </div>

              {/* Chart 1: Cost per Volume */}
              <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-900">
                  Cost per {volumeLabel(volumeUnit)} Over Time
                  <InfoTip
                    title={`Unit price = total ÷ ${volumeLabel(volumeUnit)}.`}
                  />
                </h3>
                {series.costPerL.length === 0 ? (
                  <p className="text-sm text-slate-600">
                    No points available in this range.
                  </p>
                ) : (
                  <div className="h-64 overflow-hidden rounded-lg border border-slate-200">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={series.costPerL}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip
                          formatter={(v) => pricePerVol(v)}
                          labelFormatter={(l) => `Date: ${l}`}
                        />
                        <Line type="monotone" dataKey="value" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
                <p className="mt-1 text-xs text-slate-500">
                  Unit price = total ÷ {volumeLabel(volumeUnit)}.
                </p>
              </section>

              {/* Chart 2: Consumption */}
              <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-900">
                  Consumption ({effLabel(efficiencyUnit)}) Over Time
                  <InfoTip title="Computed only when a previous fill exists with higher odometer." />
                </h3>
                {series.l100.length === 0 ? (
                  <p className="text-sm text-slate-600">
                    Need at least two valid fill-ups (same vehicle, increasing
                    odometer) in the period.
                  </p>
                ) : (
                  <div className="h-64 overflow-hidden rounded-lg border border-slate-200">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={series.l100}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip
                          formatter={(v) =>
                            efficiencyUnit === "mpg"
                              ? `${num(lPer100kmToMpg(v), 1)} MPG`
                              : `${num(v, 1)} L/100km`
                          }
                          labelFormatter={(l) => `Date: ${l}`}
                        />
                        <Line type="monotone" dataKey="value" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
                <p className="mt-1 text-xs text-slate-500">
                  {effLabel(efficiencyUnit)} computed only when a previous fill
                  exists with higher odometer.
                </p>
              </section>
            </>
          )}
        </div>

        {/* Sticky FAB */}
        <AddFillUpFAB />
      </div>
    </div>
  );
}

function Card({ title, value, info }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between gap-2">
        <div className="text-sm font-medium text-slate-700">{title}</div>
        {info ? <InfoTip title={info} /> : null}
      </div>
      <div className="mt-1 text-xl font-semibold text-slate-900">{value}</div>
    </div>
  );
}
