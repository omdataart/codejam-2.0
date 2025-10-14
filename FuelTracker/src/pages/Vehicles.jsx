import { useEffect, useState } from "react";
import api from "../lib/api";

export default function Vehicles() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: "",
    make: "",
    model: "",
    year: "",
    fuel_type: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [edit, setEdit] = useState(null);
  const [error, setError] = useState("");

  async function load() {
    try {
      setLoading(true);
      const { data } = await api.get("/vehicles");
      setList(data);
      setError("");
    } catch (e) {
      setError(e?.response?.data?.message || e.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, []);

  async function add(e) {
    e.preventDefault();
    if (!form.name.trim()) return alert("Name is required");
    await api.post("/vehicles", {
      name: form.name.trim(),
      make: form.make || "",
      model: form.model || "",
      year: form.year ? Number(form.year) : null,
      fuel_type: form.fuel_type || "",
    });
    setForm({ name: "", make: "", model: "", year: "", fuel_type: "" });
    load();
  }

  function startEdit(v) {
    setEditingId(v.id);
    setEdit({
      name: v.name || "",
      make: v.make || "",
      model: v.model || "",
      year: v.year || "",
      fuel_type: v.fuel_type || "",
    });
  }

  async function saveEdit(id) {
    if (!edit.name.trim()) return alert("Name is required");
    await api.put(`/vehicles/${id}`, {
      name: edit.name.trim(),
      make: edit.make || "",
      model: edit.model || "",
      year: edit.year ? Number(edit.year) : null,
      fuel_type: edit.fuel_type || "",
    });
    setEditingId(null);
    setEdit(null);
    load();
  }

  async function remove(id) {
    if (!confirm("Delete this vehicle?")) return;
    await api.delete(`/vehicles/${id}`);
    load();
  }

  return (
    <div className="mx-auto max-w-4xl p-6">
      <h2 className="text-2xl font-semibold mb-4">Vehicles</h2>
      {error && <p className="text-red-600 mb-3">{error}</p>}

      {/* Add form */}
      <form onSubmit={add} className="grid md:grid-cols-5 gap-2 mb-6">
        <input
          className="border rounded p-2"
          placeholder="Name *"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          className="border rounded p-2"
          placeholder="Make"
          value={form.make}
          onChange={(e) => setForm({ ...form, make: e.target.value })}
        />
        <input
          className="border rounded p-2"
          placeholder="Model"
          value={form.model}
          onChange={(e) => setForm({ ...form, model: e.target.value })}
        />
        <input
          className="border rounded p-2"
          placeholder="Year"
          value={form.year}
          onChange={(e) => setForm({ ...form, year: e.target.value })}
        />
        <div className="flex gap-2">
          <input
            className="border rounded p-2 w-full"
            placeholder="Fuel type"
            value={form.fuel_type}
            onChange={(e) => setForm({ ...form, fuel_type: e.target.value })}
          />
          <button className="bg-black text-white rounded px-3">Add</button>
        </div>
      </form>

      {/* List */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <ul className="divide-y border rounded">
          {list.map((v) => (
            <li key={v.id} className="p-3">
              {editingId !== v.id ? (
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium">{v.name}</p>
                    <p className="text-sm text-gray-600">
                      {[v.make, v.model, v.year].filter(Boolean).join(" ")}
                    </p>
                    {v.fuel_type && (
                      <p className="text-xs text-gray-500">
                        Fuel: {v.fuel_type}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-3">
                    <button className="underline" onClick={() => startEdit(v)}>
                      Edit
                    </button>
                    <button
                      className="text-red-600"
                      onClick={() => remove(v.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid md:grid-cols-5 gap-2">
                  <input
                    className="border rounded p-2"
                    placeholder="Name *"
                    value={edit.name}
                    onChange={(e) => setEdit({ ...edit, name: e.target.value })}
                  />
                  <input
                    className="border rounded p-2"
                    placeholder="Make"
                    value={edit.make}
                    onChange={(e) => setEdit({ ...edit, make: e.target.value })}
                  />
                  <input
                    className="border rounded p-2"
                    placeholder="Model"
                    value={edit.model}
                    onChange={(e) =>
                      setEdit({ ...edit, model: e.target.value })
                    }
                  />
                  <input
                    className="border rounded p-2"
                    placeholder="Year"
                    value={edit.year}
                    onChange={(e) => setEdit({ ...edit, year: e.target.value })}
                  />
                  <div className="flex gap-2">
                    <input
                      className="border rounded p-2 w-full"
                      placeholder="Fuel type"
                      value={edit.fuel_type}
                      onChange={(e) =>
                        setEdit({ ...edit, fuel_type: e.target.value })
                      }
                    />
                    <button
                      className="bg-black text-white rounded px-3"
                      onClick={() => saveEdit(v.id)}
                    >
                      Save
                    </button>
                    <button
                      className="border rounded px-3"
                      onClick={() => {
                        setEditingId(null);
                        setEdit(null);
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
          {list.length === 0 && (
            <li className="p-3 text-gray-500">No vehicles yet.</li>
          )}
        </ul>
      )}
    </div>
  );
}
