import { useState, useEffect } from "react";
import api from "../lib/api";
import { round } from "../utils/format";

export default function FillUpForm() {
  const [vehicles, setVehicles] = useState([]);
  const [form, setForm] = useState({
    vehicle_id: "",
    date: new Date().toISOString().slice(0, 10),
    odometer_km: "",
    station_name: "",
    fuel_brand: "",
    fuel_grade: "",
    liters: "",
    total_amount: "",
    currency_code: "INR",
    notes: "",
  });

  useEffect(() => {
    api.get("/vehicles").then((r) => setVehicles(r.data));
  }, []);

  const unit_price =
    form.liters && form.total_amount
      ? round(Number(form.total_amount) / Number(form.liters), 2)
      : null;

  async function submit(e) {
    e.preventDefault();
    // minimal client validation
    if (
      !form.vehicle_id ||
      !form.date ||
      !form.odometer_km ||
      !form.liters ||
      !form.total_amount
    )
      return;
    await api.post("/fillups", {
      vehicle_id: form.vehicle_id,
      date: form.date,
      odometer_km: Number(form.odometer_km),
      station_name: form.station_name,
      fuel_brand: form.fuel_brand,
      fuel_grade: form.fuel_grade,
      liters: Number(form.liters),
      total_amount: Number(form.total_amount),
      currency_code: form.currency_code,
      notes: form.notes,
    });
    alert("Saved!");
    // reset (keep vehicle selected)
    setForm((f) => ({
      ...f,
      date: new Date().toISOString().slice(0, 10),
      odometer_km: "",
      station_name: "",
      fuel_brand: "",
      fuel_grade: "",
      liters: "",
      total_amount: "",
      notes: "",
    }));
  }

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h2 className="text-2xl font-semibold mb-4">Add Fill-Up</h2>
      <form onSubmit={submit} className="grid gap-3">
        <select
          className="border rounded p-2"
          value={form.vehicle_id}
          onChange={(e) => setForm({ ...form, vehicle_id: e.target.value })}
        >
          <option value="">Select vehicle</option>
          {vehicles.map((v) => (
            <option key={v.id} value={v.id}>
              {v.name}
            </option>
          ))}
        </select>
        <input
          className="border rounded p-2"
          type="date"
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
        />
        <input
          className="border rounded p-2"
          placeholder="Odometer (km)"
          value={form.odometer_km}
          onChange={(e) => setForm({ ...form, odometer_km: e.target.value })}
        />
        <div className="grid md:grid-cols-2 gap-2">
          <input
            className="border rounded p-2"
            placeholder="Station name"
            value={form.station_name}
            onChange={(e) => setForm({ ...form, station_name: e.target.value })}
          />
          <input
            className="border rounded p-2"
            placeholder="Fuel brand"
            value={form.fuel_brand}
            onChange={(e) => setForm({ ...form, fuel_brand: e.target.value })}
          />
        </div>
        <div className="grid md:grid-cols-2 gap-2">
          <input
            className="border rounded p-2"
            placeholder="Fuel grade"
            value={form.fuel_grade}
            onChange={(e) => setForm({ ...form, fuel_grade: e.target.value })}
          />
          <input
            className="border rounded p-2"
            placeholder="Notes"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
        </div>
        <div className="grid md:grid-cols-2 gap-2">
          <input
            className="border rounded p-2"
            placeholder="Liters"
            value={form.liters}
            onChange={(e) => setForm({ ...form, liters: e.target.value })}
          />
          <input
            className="border rounded p-2"
            placeholder="Total amount"
            value={form.total_amount}
            onChange={(e) => setForm({ ...form, total_amount: e.target.value })}
          />
        </div>
        {unit_price !== null && (
          <p className="text-sm text-gray-600">
            Unit price: <b>{unit_price}</b> per L
          </p>
        )}
        <button className="bg-black text-white rounded py-2">Save</button>
      </form>
    </div>
  );
}
