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

export default function History() {
  const [allFillups, setAllFillups] = useState([]);
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

  // pagination
  const [page, setPage] = useState(1);
  const pageSize = 25;

  const { currency, distanceUnit, volumeUnit, efficiencyUnit, priceDecimals } =
    useSettings();

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        // forkjoin
        const [f, v] = await Promise.all([
          api.get("/FuelEntries"),
          api.get("/vehicles"),
        ]);
        setAllFillups(f.data.data || []);
        setVehicles(v.data.data || []);
      } catch (e) {
        setError(e?.response?.data?.message || e.message || "Failed to load");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    if(!allFillups || allFillups.length === 0) return [];
    const fromDate = from ? new Date(from) : null;
    const toDate = to ? new Date(to) : null;

    var result=  allFillups.items.filter((f) => {
      if (vehicleId !== "all" && f.vehicleId !== vehicleId) return false;
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
      if (fromDate && d < fromDate) return false;
      if (toDate && d > toDate) return false;
      return true;
    });

    console.log(result);
    return result;
  }, [allFillups, vehicleId, brand, grade, station, from, to]);

  const computed = useMemo(() => {
    if (!filtered || filtered.length === 0 || !vehicles) return [];
    // add vehicle name lookup
    const nameById = new Map(vehicles.map((v) => [v.id, v.label]));
    const scoped = filtered.map((f) => ({
      ...f,
      vehicleName: nameById.get(f.vehicleId) || "—",
    }));

    const grouped = {};
    for (const f of scoped) {
      grouped[f.vehicleId] ??= [];
      grouped[f.vehicleId].push(f);
    }

    for (const vid of Object.keys(grouped)) {
      grouped[vid].sort((a, b) => new Date(a.date) - new Date(b.date));
      let prev = null;
      for (const f of grouped[vid]) {
        // canonical unitPrice per L
        f.unitPrice = round(Number(f.totalAmount) / Number(f.liters), 2);
        if (prev && f.odometerKm > prev.odometerKm) {
          const dist = f.odometerKm - prev.odometerKm; // km
          f.distanceSinceLastKm = dist;
          f.costPerKm = round(Number(f.totalAmount) / dist, 2);
          f.consumptionLPer100Km = round((Number(f.liters) / dist) * 100, 1);
        } else {
          f.distanceSinceLastKm = null;
          f.costPerKm = null;
          f.consumptionLPer100Km = null;
        }
        prev = f;
      }
    }

    // sort desc by date
    var result = Object.values(grouped)
      .flat()
      .sort((a, b) => new Date(b.date) - new Date(a.date));
      console.log(result);
    return result;
  }, [filtered, vehicles]);

  // reset pagination when filters change
  useEffect(() => {
    setPage(1);
  }, [vehicleId, brand, grade, station, from, to]);

  // page slice
  const visible = useMemo(()=>{
    if(!computed) return [];
    // console.log("computed",computed);
    // console.log("page",page);
    // console.log("pageSize",pageSize);
    var result=  computed.slice(0, page * pageSize);
    // console.log(result);
    return result;
  },[computed, page]
  );

  const summary = useMemo(() => {
    if (!computed.length) return null;

    const totalSpend = computed.reduce(
      (a, f) => a + Number(f.totalAmount || 0),
      0
    );

    const distances = computed
      .filter((f) => f.distanceSinceLastKm)
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
      date: row.date,
      odometerKm: row.odometerKm,
      station_name: row.station_name || "",
      fuel_brand: row.fuel_brand || "",
      fuel_grade: row.fuel_grade || "",
      liters: row.liters,
      total_amount: row.total_amount,
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
    const { data } = await api.get("/FuelEntries");
    setAllFillups(data);
  }

  async function remove(id) {
    if (!confirm("Delete this fill-up?")) return;
    await api.delete(`/FuelEntries/${id}`);
    const { data } = await api.get("/FuelEntries");
    setAllFillups(data);
  }

  function clearFilters() {
    setVehicleId("all");
    setBrand("");
    setGrade("");
    setStation("");
    setFrom("");
    setTo("");
  }

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="mx-auto max-w-6xl p-6">
      <h2 className="text-2xl font-semibold mb-4">History</h2>
      {error && <p className="text-red-600 mb-2">{error}</p>}

      {/* Filters */}
      <div className="mb-4 grid gap-2 md:grid-cols-6">
        <select
          className="border rounded p-2"
          value={vehicleId}
          onChange={(e) => setVehicleId(e.target.value)}
        >
          <option value="all">All vehicles</option>
          {vehicles.map((v) => (
            <option key={v.id} value={v.id}>
              {v.name}
            </option>
          ))}
        </select>
        <input
          className="border rounded p-2"
          placeholder="Brand"
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
        />
        <input
          className="border rounded p-2"
          placeholder="Grade"
          value={grade}
          onChange={(e) => setGrade(e.target.value)}
        />
        <input
          className="border rounded p-2"
          placeholder="Station"
          value={station}
          onChange={(e) => setStation(e.target.value)}
        />
        <input
          className="border rounded p-2"
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
        />
        <div className="flex gap-2">
          <input
            className="border rounded p-2 w-full"
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
          <button onClick={clearFilters} className="border rounded px-3">
            Clear
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border rounded">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-2">Date</th>
              <th className="text-left p-2">Vehicle</th>
              <th className="text-left p-2">
                Odometer{" "}
                <InfoTip
                  title={`Vehicle odometer reading at fill-up (${distanceLabel(
                    distanceUnit
                  )}).`}
                />
              </th>
              <th className="text-left p-2">
                Volume ({volumeLabel(volumeUnit)}){" "}
                <InfoTip title="Fuel volume. Full fill-ups only in MVP." />
              </th>
              <th className="text-left p-2">
                Total <InfoTip title="Total amount paid for the fill-up." />
              </th>
              <th className="text-left p-2">
                Unit Price{" "}
                <InfoTip
                  title={`Unit price = total ÷ ${volumeLabel(volumeUnit)}.`}
                />
              </th>
              <th className="text-left p-2">
                Distance{" "}
                <InfoTip
                  title={`Since previous fill-up (same vehicle). (${distanceLabel(
                    distanceUnit
                  )})`}
                />
              </th>
              <th className="text-left p-2">
                {effLabel(efficiencyUnit)}{" "}
                <InfoTip title="Fuel consumption; lower is better for L/100km, higher for MPG." />
              </th>
              <th className="text-left p-2">
                Cost / {distanceLabel(distanceUnit)}
              </th>
              <th className="text-left p-2 w-40">Actions</th>
            </tr>
          </thead>
          <tbody>
            
            {Array.isArray(visible) && visible.length>0 && visible.map((f) => {
              // display conversions
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
                <tr key={f.id} className="border-t align-top">
                  {editingId !== f.id ? (
                    <>
                      <td className="p-2">{f.date}</td>
                      <td className="p-2">{f.vehicleName}</td>
                      <td className="p-2">
                        {f.odometerKm}
                        {/* {distDisp != null
                          ? num(distDisp, 0)
                          : num(f.odometerKm, 0)} */}
                      </td>
                      <td className="p-2">{num(volDisp, 2)}</td>
                      <td className="p-2">{totalDisp}</td>
                      <td className="p-2">{unitPriceDisp ?? "—"}</td>
                      <td className="p-2">
                        {distDisp != null ? num(distDisp, 0) : "—"}
                      </td>
                      <td className="p-2">
                        {effDisp != null ? `${num(effDisp, 1)}` : "—"}
                      </td>
                      <td className="p-2">{costPerDistDisp ?? "—"}</td>
                      <td className="p-2">
                        <div className="flex gap-3">
                          <button
                            className="underline"
                            onClick={() => startEdit(f)}
                          >
                            Edit
                          </button>
                          <button
                            className="text-red-600"
                            onClick={() => remove(f.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <td className="p-2" colSpan={10}>
                      <div className="grid md:grid-cols-5 gap-2">
                        <input
                          className="border rounded p-2"
                          type="date"
                          value={edit.date}
                          onChange={(e) =>
                            setEdit({ ...edit, date: e.target.value })
                          }
                        />
                        <input
                          className="border rounded p-2"
                          placeholder="Odometer"
                          value={edit.odometerKm}
                          onChange={(e) =>
                            setEdit({ ...edit, odometerKm: e.target.value })
                          }
                        />
                        <input
                          className="border rounded p-2"
                          placeholder={`Volume (${volumeLabel(volumeUnit)})`}
                          value={edit.liters}
                          onChange={(e) =>
                            setEdit({ ...edit, liters: e.target.value })
                          }
                        />
                        <input
                          className="border rounded p-2"
                          placeholder="Total"
                          value={edit.total_amount}
                          onChange={(e) =>
                            setEdit({ ...edit, total_amount: e.target.value })
                          }
                        />
                        <input
                          className="border rounded p-2"
                          placeholder="Brand"
                          value={edit.fuel_brand}
                          onChange={(e) =>
                            setEdit({ ...edit, fuel_brand: e.target.value })
                          }
                        />
                        <input
                          className="border rounded p-2"
                          placeholder="Grade"
                          value={edit.fuel_grade}
                          onChange={(e) =>
                            setEdit({ ...edit, fuel_grade: e.target.value })
                          }
                        />
                        <input
                          className="border rounded p-2 md:col-span-2"
                          placeholder="Station"
                          value={edit.station_name}
                          onChange={(e) =>
                            setEdit({ ...edit, station_name: e.target.value })
                          }
                        />
                        <input
                          className="border rounded p-2"
                          placeholder="Notes"
                          value={edit.notes}
                          onChange={(e) =>
                            setEdit({ ...edit, notes: e.target.value })
                          }
                        />
                      </div>
                      <div className="mt-2 flex gap-2">
                        <button
                          className="bg-black text-white rounded px-3 py-1"
                          onClick={() => saveEdit(f.id)}
                        >
                          Save
                        </button>
                        <button
                          className="border rounded px-3 py-1"
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

            {/* Summary Row (for full filtered set, not just visible page) */}
            {computed.length > 0 && summary && (
              <tr className="border-t bg-gray-50 font-semibold">
                <td colSpan={4} className="p-2 text-right">
                  Summary
                </td>
                <td className="p-2">{money(summary.totalSpend, currency)}</td>
                <td className="p-2">—</td>
                <td className="p-2">
                  {num(summary.totalDistanceDisp, 0)}{" "}
                  {distanceLabel(distanceUnit)}
                </td>
                <td className="p-2">
                  {summary.avgEffDisp != null
                    ? `${num(summary.avgEffDisp, 1)}`
                    : "—"}
                </td>
                <td className="p-2">
                  {summary.avgCostDistDisp != null
                    ? new Intl.NumberFormat(undefined, {
                        style: "currency",
                        currency,
                        maximumFractionDigits: 2,
                      }).format(summary.avgCostDistDisp)
                    : "—"}
                </td>
                <td className="p-2">—</td>
              </tr>
            )}

            {Array.isArray(visible) && visible.length ===0 && (
              <tr>
                <td className="p-4 text-gray-500" colSpan={10}>
                  No entries match the filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination: Load more */}
      {computed.length > (Array.isArray(visible) ? visible.length : 0) && (
        <div className="flex justify-center my-3">
          <button
            onClick={() => setPage((p) => p + 1)}
            className="border rounded px-4 py-2"
          >
            Load more
          </button>
        </div>
      )}

      {/* Sticky FAB */}
      <AddFillUpFAB />
    </div>
  );
}
