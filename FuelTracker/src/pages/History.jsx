import { useEffect, useMemo, useState } from "react";
import api from "../lib/api";
import { money, num, round } from "../utils/format";
import InfoTip from "../components/InfoTip";
import AddFillUpFAB from "../components/AddFillUpFAB";
import { useSettings } from "../store/settingsStore";
import {
  distanceLabel,
  volumeLabel,
  effLabel,
  KM_PER_MILE,
  L_PER_GAL,
  kmToMi,
  lToGal,
  lPer100kmToMpg,
} from "../utils/conversions";

// Display helper: 15-10-2025 style
function formatDMY(dateLike) {
  const d = new Date(dateLike);
  if (Number.isNaN(+d)) return "—";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}

export default function History() {
  const [allFillups, setAllFillups] = useState(null); // API returns { items, totalCount, page, pageSize }
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // filters
  const [vehicleId, setVehicleId] = useState("all");
  const [brand, setBrand] = useState("");
  const [grade, setGrade] = useState("");
  const [station, setStation] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  // edit state
  const [editingId, setEditingId] = useState(null);
  const [edit, setEdit] = useState(null);

  // pagination (client-side “load more”)
  const [page, setPage] = useState(1);
  const pageSize = 25;

  const { currency, distanceUnit, volumeUnit, efficiencyUnit, priceDecimals } =
    useSettings();

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [f, v] = await Promise.all([
          api.get("/FuelEntries"),
          api.get("/vehicles"),
        ]);

        // Accept either {data:{items:[]}} or plain {items:[]}
        const fuelPayload = f?.data?.data ?? f?.data ?? null;
        const vehiclePayload = v?.data?.data ?? v?.data ?? [];

        setAllFillups(fuelPayload);
        setVehicles(Array.isArray(vehiclePayload) ? vehiclePayload : []);
        setError("");
      } catch (e) {
        setError(e?.response?.data?.message || e.message || "Failed to load");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    const items = allFillups?.items ?? [];
    if (!Array.isArray(items) || items.length === 0) return [];

    const fromDate = from ? new Date(from) : null;
    const toDate = to ? new Date(to) : null;

    const result = items.filter((f) => {
      if (
        vehicleId !== "all" &&
        String(f.vehicleId) !== String(vehicleId) // normalize type
      )
        return false;

      if (
        brand &&
        !String(f.brand ?? "")
          .toLowerCase()
          .includes(brand.toLowerCase())
      )
        return false;
      if (
        grade &&
        !String(f.grade ?? "")
          .toLowerCase()
          .includes(grade.toLowerCase())
      )
        return false;
      if (
        station &&
        !String(f.station ?? "")
          .toLowerCase()
          .includes(station.toLowerCase())
      )
        return false;

      const d = new Date(f.date);
      if (Number.isNaN(+d)) return false;
      if (fromDate && d < fromDate) return false;
      if (toDate && d > toDate) return false;

      return true;
    });

    return result;
  }, [allFillups, vehicleId, brand, grade, station, from, to]);

  const computed = useMemo(() => {
    if (!filtered.length || !vehicles.length) return [];

    // vehicle name lookup
    const nameById = new Map(vehicles.map((v) => [String(v.id), v.label]));
    const scoped = filtered.map((f) => ({
      ...f,
      vehicleName: nameById.get(String(f.vehicleId)) || "—",
    }));

    // group by vehicle, compute derived fields based on previous fill
    const grouped = {};
    for (const f of scoped) {
      grouped[f.vehicleId] ??= [];
      grouped[f.vehicleId].push({ ...f });
    }

    for (const vid of Object.keys(grouped)) {
      grouped[vid].sort((a, b) => new Date(a.date) - new Date(b.date));
      let prev = null;
      for (const f of grouped[vid]) {
        // Protect against division by zero
        const liters = Number(f.liters);
        const totalAmount = Number(f.totalAmount);
        f.unitPrice =
          liters > 0
            ? round(totalAmount / liters, Math.max(2, priceDecimals))
            : null;

        if (
          prev &&
          Number.isFinite(prev.odometerKm) &&
          Number.isFinite(f.odometerKm) &&
          f.odometerKm > prev.odometerKm
        ) {
          const dist = f.odometerKm - prev.odometerKm; // km
          f.distanceSinceLastKm = dist;
          f.costPerKm = dist > 0 ? round(totalAmount / dist, 2) : null;
          f.consumptionLPer100Km =
            dist > 0 ? round((liters / dist) * 100, 1) : null;
        } else {
          f.distanceSinceLastKm = null;
          f.costPerKm = null;
          f.consumptionLPer100Km = null;
        }
        prev = f;
      }
    }

    // newest first
    return Object.values(grouped)
      .flat()
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [filtered, vehicles, priceDecimals]);

  // reset pagination when filters change
  useEffect(() => {
    setPage(1);
  }, [vehicleId, brand, grade, station, from, to]);

  // visible slice
  const visible = useMemo(() => {
    if (!computed.length) return [];
    return computed.slice(0, page * pageSize);
  }, [computed, page]);

  const summary = useMemo(() => {
    if (!computed.length) return null;

    const totalSpend = computed.reduce(
      (a, f) => a + Number(f.totalAmount || 0),
      0
    );

    const distances = computed
      .filter((f) => f.distanceSinceLastKm != null)
      .map((f) => f.distanceSinceLastKm);
    const totalDistanceKm = distances.reduce((a, b) => a + b, 0);
    const totalDistanceDisp =
      distanceUnit === "mi"
        ? Math.round(kmToMi(totalDistanceKm))
        : Math.round(totalDistanceKm);

    const l100Rows = computed.filter((f) => f.consumptionLPer100Km != null);
    const cpkRows = computed.filter((f) => f.costPerKm != null);

    const avgL100 = l100Rows.length
      ? l100Rows.reduce((a, f) => a + f.consumptionLPer100Km, 0) /
        l100Rows.length
      : null;
    const avgEffDisp =
      avgL100 != null
        ? efficiencyUnit === "mpg"
          ? lPer100kmToMpg(avgL100)
          : avgL100
        : null;

    const avgCostKm = cpkRows.length
      ? cpkRows.reduce((a, f) => a + f.costPerKm, 0) / cpkRows.length
      : null;
    const avgCostDistDisp =
      avgCostKm != null
        ? distanceUnit === "mi"
          ? avgCostKm * KM_PER_MILE
          : avgCostKm
        : null;

    return { totalSpend, totalDistanceDisp, avgEffDisp, avgCostDistDisp };
  }, [computed, distanceUnit, efficiencyUnit, currency]);

  function startEdit(row) {
    setEditingId(row.id);
    setEdit({
      // keep ISO for input date
      date: row.date?.slice(0, 10) ?? "",
      odometerKm: row.odometerKm ?? "",
      station_name: row.station_name || row.station || "",
      fuel_brand: row.fuel_brand || row.brand || "",
      fuel_grade: row.fuel_grade || row.grade || "",
      liters: row.liters ?? "",
      total_amount: row.total_amount ?? row.totalAmount ?? "",
      currency_code: row.currency_code || currency,
      notes: row.notes || "",
    });
  }

  async function saveEdit(id) {
    const today = new Date().toISOString().slice(0, 10);
    if (!edit.date || edit.date > today)
      return alert("Date cannot be in the future.");
    if (!(Number(edit.liters) > 0)) return alert("Volume must be > 0.");
    if (!(Number(edit.total_amount) > 0)) return alert("Total must be > 0.");
    if (String(edit.notes).length > 500)
      return alert("Notes must be ≤ 500 chars.");

    await api.put(`/FuelEntries/${id}`, {
      ...edit,
      odometerKm: Number(edit.odometerKm),
      liters: Number(edit.liters),
      total_amount: Number(edit.total_amount),
    });

    setEditingId(null);
    setEdit(null);

    const refetch = await api.get("/FuelEntries");
    setAllFillups(refetch?.data?.data ?? refetch?.data ?? null);
  }

  async function remove(id) {
    if (!confirm("Delete this fill-up?")) return;
    await api.delete(`/FuelEntries/${id}`);
    const refetch = await api.get("/FuelEntries");
    setAllFillups(refetch?.data?.data ?? refetch?.data ?? null);
  }

  function clearFilters() {
    setVehicleId("all");
    setBrand("");
    setGrade("");
    setStation("");
    setFrom("");
    setTo("");
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] bg-gradient-to-b from-slate-50 to-white">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:py-10">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-slate-700">Loading…</p>
            <div className="mt-4 h-2 w-full animate-pulse rounded bg-slate-100" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:py-10">
        <div className="mb-4 sm:mb-6">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
            History
          </h2>
          <p className="text-sm text-slate-600">
            Review and manage your recorded fuel entries.
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

        {/* Filters */}
        <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-end gap-3">
            <select
              className="w-full sm:w-auto flex-1 min-w-[160px] rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-1"
              value={vehicleId}
              onChange={(e) => setVehicleId(e.target.value)}
              aria-label="Filter by vehicle"
            >
              <option value="all">All vehicles</option>
              {vehicles.map((v) => (
                <option key={v.id} value={String(v.id)}>
                  {v.label}
                </option>
              ))}
            </select>

            <input
              className="w-full sm:w-auto flex-1 min-w-[130px] rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-1"
              placeholder="Brand"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              aria-label="Filter by brand"
            />
            <input
              className="w-full sm:w-auto flex-1 min-w-[130px] rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-1"
              placeholder="Grade"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              aria-label="Filter by grade"
            />
            <input
              className="w-full sm:w-auto flex-1 min-w-[130px] rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-1"
              placeholder="Station"
              value={station}
              onChange={(e) => setStation(e.target.value)}
              aria-label="Filter by station"
            />

            <input
              className="w-full sm:w-auto flex-1 min-w-[160px] rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-1"
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              aria-label="From date"
            />
            <input
              className="w-full sm:w-auto flex-1 min-w-[160px] rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-1"
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              aria-label="To date"
            />

            <button
              onClick={clearFilters}
              className="ml-auto sm:ml-0 whitespace-nowrap rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-1"
              title="Clear filters"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="sticky top-0 z-10 bg-slate-50 text-slate-700">
              <tr className="border-b border-slate-200">
                <th className="text-left px-3 py-2">Date</th>
                <th className="text-left px-3 py-2">Vehicle</th>
                <th className="text-left px-3 py-2">
                  Odometer{" "}
                  <InfoTip
                    title={`Vehicle odometer reading at fill-up (${distanceLabel(
                      distanceUnit
                    )}).`}
                  />
                </th>
                <th className="text-left px-3 py-2">
                  Volume ({volumeLabel(volumeUnit)}){" "}
                  <InfoTip title="Fuel volume. Full fill-ups only in MVP." />
                </th>
                <th className="text-left px-3 py-2">
                  Total <InfoTip title="Total amount paid for the fill-up." />
                </th>
                <th className="text-left px-3 py-2">
                  Unit Price{" "}
                  <InfoTip
                    title={`Unit price = total ÷ ${volumeLabel(volumeUnit)}.`}
                  />
                </th>
                <th className="text-left px-3 py-2">
                  Distance{" "}
                  <InfoTip
                    title={`Since previous fill-up (same vehicle). (${distanceLabel(
                      distanceUnit
                    )})`}
                  />
                </th>
                <th className="text-left px-3 py-2">
                  {effLabel(efficiencyUnit)}{" "}
                  <InfoTip title="Fuel consumption; lower is better for L/100km, higher for MPG." />
                </th>
                <th className="text-left px-3 py-2">
                  Cost / {distanceLabel(distanceUnit)}
                </th>
                <th className="text-left px-3 py-2 w-40">Actions</th>
              </tr>
            </thead>
            <tbody className="text-slate-800">
              {visible.map((f) => {
                const volDisp =
                  volumeUnit === "gal" ? lToGal(f.liters) : f.liters;
                const totalDisp = money(f.totalAmount, currency);
                const unitPriceDisp =
                  f.unitPrice != null
                    ? new Intl.NumberFormat(undefined, {
                        style: "currency",
                        currency,
                        maximumFractionDigits: priceDecimals,
                      }).format(
                        volumeUnit === "gal"
                          ? f.unitPrice * L_PER_GAL
                          : f.unitPrice
                      )
                    : null;

                const distDisp =
                  f.distanceSinceLastKm != null
                    ? distanceUnit === "mi"
                      ? kmToMi(f.distanceSinceLastKm)
                      : f.distanceSinceLastKm
                    : null;

                const effDisp =
                  f.consumptionLPer100Km != null
                    ? efficiencyUnit === "mpg"
                      ? lPer100kmToMpg(f.consumptionLPer100Km)
                      : f.consumptionLPer100Km
                    : null;

                const costPerDistDisp =
                  f.costPerKm != null
                    ? new Intl.NumberFormat(undefined, {
                        style: "currency",
                        currency,
                        maximumFractionDigits: 2,
                      }).format(
                        distanceUnit === "mi"
                          ? f.costPerKm * KM_PER_MILE
                          : f.costPerKm
                      )
                    : null;

                return (
                  <tr
                    key={f.id}
                    className="border-t border-slate-200 align-top hover:bg-slate-50/60"
                  >
                    {editingId !== f.id ? (
                      <>
                        <td className="px-3 py-2">{formatDMY(f.date)}</td>
                        <td className="px-3 py-2">{f.vehicleName}</td>
                        <td className="px-3 py-2">{f.odometerKm}</td>
                        <td className="px-3 py-2">{num(volDisp, 2)}</td>
                        <td className="px-3 py-2">{totalDisp}</td>
                        <td className="px-3 py-2">{unitPriceDisp ?? "—"}</td>
                        <td className="px-3 py-2">
                          {distDisp != null ? num(distDisp, 0) : "—"}
                        </td>
                        <td className="px-3 py-2">
                          {effDisp != null ? `${num(effDisp, 1)}` : "—"}
                        </td>
                        <td className="px-3 py-2">{costPerDistDisp ?? "—"}</td>
                        <td className="px-3 py-2">
                          <div className="flex gap-2">
                            <button
                              className="rounded-md px-2 py-1 text-blue-700 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
                              onClick={() => startEdit(f)}
                              title="Edit entry"
                            >
                              Edit
                            </button>
                            <button
                              className="rounded-md px-2 py-1 text-red-700 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2"
                              onClick={() => remove(f.id)}
                              title="Delete entry"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <td className="px-3 py-2" colSpan={10}>
                        <div className="grid gap-2 md:grid-cols-5">
                          <input
                            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
                            type="date"
                            value={edit.date}
                            onChange={(e) =>
                              setEdit({ ...edit, date: e.target.value })
                            }
                          />
                          <input
                            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
                            placeholder="Odometer"
                            value={edit.odometerKm}
                            onChange={(e) =>
                              setEdit({ ...edit, odometerKm: e.target.value })
                            }
                          />
                          <input
                            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
                            placeholder={`Volume (${volumeLabel(volumeUnit)})`}
                            value={edit.liters}
                            onChange={(e) =>
                              setEdit({ ...edit, liters: e.target.value })
                            }
                          />
                          <input
                            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
                            placeholder="Total"
                            value={edit.total_amount}
                            onChange={(e) =>
                              setEdit({
                                ...edit,
                                total_amount: e.target.value,
                              })
                            }
                          />
                          <input
                            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
                            placeholder="Brand"
                            value={edit.fuel_brand}
                            onChange={(e) =>
                              setEdit({ ...edit, fuel_brand: e.target.value })
                            }
                          />
                          <input
                            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
                            placeholder="Grade"
                            value={edit.fuel_grade}
                            onChange={(e) =>
                              setEdit({ ...edit, fuel_grade: e.target.value })
                            }
                          />
                          <input
                            className="md:col-span-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
                            placeholder="Station"
                            value={edit.station_name}
                            onChange={(e) =>
                              setEdit({
                                ...edit,
                                station_name: e.target.value,
                              })
                            }
                          />
                          <input
                            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
                            placeholder="Notes"
                            value={edit.notes}
                            onChange={(e) =>
                              setEdit({ ...edit, notes: e.target.value })
                            }
                          />
                        </div>
                        <div className="mt-2 flex gap-2">
                          <button
                            className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white shadow-md transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
                            onClick={() => saveEdit(f.id)}
                          >
                            Save
                          </button>
                          <button
                            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
                            onClick={() => {
                              setEditingId(null);
                              setEdit(null);
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}

              {/* Summary (for full filtered set) */}
              {computed.length > 0 && summary && (
                <tr className="border-t border-slate-200 bg-slate-50 font-semibold text-slate-900">
                  <td colSpan={4} className="px-3 py-2 text-right">
                    Summary
                  </td>
                  <td className="px-3 py-2">
                    {money(summary.totalSpend, currency)}
                  </td>
                  <td className="px-3 py-2">—</td>
                  <td className="px-3 py-2">
                    {num(summary.totalDistanceDisp, 0)}{" "}
                    {distanceLabel(distanceUnit)}
                  </td>
                  <td className="px-3 py-2">
                    {summary.avgEffDisp != null
                      ? `${num(summary.avgEffDisp, 1)}`
                      : "—"}
                  </td>
                  <td className="px-3 py-2">
                    {summary.avgCostDistDisp != null
                      ? new Intl.NumberFormat(undefined, {
                          style: "currency",
                          currency,
                          maximumFractionDigits: 2,
                        }).format(summary.avgCostDistDisp)
                      : "—"}
                  </td>
                  <td className="px-3 py-2">—</td>
                </tr>
              )}

              {visible.length === 0 && (
                <tr>
                  <td
                    className="px-3 py-6 text-center text-slate-500"
                    colSpan={10}
                  >
                    No entries match the filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Load more */}
        {computed.length > visible.length && (
          <div className="my-4 flex justify-center">
            <button
              onClick={() => setPage((p) => p + 1)}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
            >
              Load more
            </button>
          </div>
        )}

        {/* Sticky FAB */}
        <AddFillUpFAB />
      </div>
    </div>
  );
}
