// Tiny in-browser mock. Persists data in localStorage under "ft::*"
const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms));
const ok = (data) => ({ data });
const read = (k, def) =>
  JSON.parse(localStorage.getItem(k) ?? JSON.stringify(def));
const write = (k, v) => localStorage.setItem(k, JSON.stringify(v));

// Normalize all API paths to lowercase
function normalizeUrl(url) {
  const u = new URL(url, "http://mock.local");
  let p = u.pathname.toLowerCase();
  p = p
    .replace(/^\/auth(\/|$)/, "/auth$1")
    .replace(/^\/vehicles(\/|$)/, "/vehicles$1")
    .replace(/^\/fuelentries(\/|$)/, "/fillups$1")
    .replace(/^\/fillups(\/|$)/, "/fillups$1")
    .replace(/^\/stats(\/|$)/, "/stats$1")
    .replace(/^\/profile(\/|$)/, "/profile$1");
  return { path: p, search: u.searchParams };
}

// -------------------------- Boot mock data --------------------------
function ensureBoot() {
  if (!localStorage.getItem("ft::boot")) {
    const user = {
      id: "u1",
      email: "test@example.com",
      displayName: "Dev User",
      preferredCurrency: "INR",
      preferredDistanceUnit: "km",
      preferredVolumeUnit: "L",
      efficiencyUnit: "l_per_100km",
      priceDecimals: 2,
    };
    write("ft::users", [user]);
    write("ft::session", { userId: user.id }); // logged in by default

    write("ft::vehicles", [
      {
        id: "1",
        label: "Suzuki Swift",
        make: "Suzuki",
        model: "Swift",
        year: 2019,
        fuelType: "Petrol",
      },
      {
        id: "2",
        label: "Maruti Alto",
        make: "Maruti",
        model: "Alto",
        year: 2016,
        fuelType: "Petrol",
      },
    ]);

    write("ft::fillups", [
      {
        id: "f1",
        vehicleId: "2",
        date: "2025-10-14T00:00:00",
        odometerKm: 144,
        station: "Shell",
        brand: "Shell",
        grade: "95 Octane",
        liters: 40,
        totalAmount: 4000,
        notes: null,
        createdAt: "2025-10-14T05:40:10.8702496",
      },
    ]);

    write("ft::counters", { users: 2, vehicles: 3, fillups: 2 });
    localStorage.setItem("ft::boot", "1");
  }
}
ensureBoot();

function nextId(key) {
  const c = read("ft::counters", { users: 1, vehicles: 1, fillups: 1 });
  const id = String(c[key]);
  c[key] = Number(id) + 1;
  write("ft::counters", c);
  return id;
}

// -------------------------- Helpers --------------------------
function sanitizeFillup(f) {
  const liters = Number(f.liters);
  const totalAmount = Number(f.totalAmount);
  return {
    ...f,
    vehicleId: String(f.vehicleId),
    liters: Number.isFinite(liters) ? liters : 0,
    totalAmount: Number.isFinite(totalAmount) ? totalAmount : 0,
    odometerKm: Number.isFinite(Number(f.odometerKm))
      ? Number(f.odometerKm)
      : 0,
  };
}

// -------------------------- GET --------------------------
export async function get(url) {
  await delay();
  const session = read("ft::session", { userId: null });
  const { path, search } = normalizeUrl(url);

  // Auth: /auth/me
  if (path === "/auth/me") {
    const u = read("ft::users", []).find((x) => x.id === session.userId);
    if (!u)
      throw {
        response: { data: { message: "Not authenticated" }, status: 401 },
      };
    return ok({ data: u }); // shape: response.data.data
  }

  // Vehicles
  if (path === "/vehicles") {
    const list = read("ft::vehicles", []);
    return ok({ data: list });
  }

  // Fuel entries
  if (path === "/fillups") {
    let list = read("ft::fillups", []).slice();
    const qVehicleId = search.get("vehicleId");
    if (qVehicleId)
      list = list.filter((f) => String(f.vehicleId) === String(qVehicleId));
    list.sort((a, b) => new Date(b.date) - new Date(a.date));
    const page = Math.max(1, Number(search.get("page") || 1));
    const pageSize = Math.max(1, Number(search.get("pageSize") || 25));
    const start = (page - 1) * pageSize;
    const items = list.slice(start, start + pageSize).map(sanitizeFillup);
    return ok({ data: { items, totalCount: list.length, page, pageSize } });
  }

  throw {
    response: { data: { message: `GET ${url} not found` }, status: 404 },
  };
}

// -------------------------- POST --------------------------
export async function post(url, body) {
  await delay();
  const { path } = normalizeUrl(url);

  if (path === "/auth/login") {
    const { email } = body || {};
    const users = read("ft::users", []);
    const user = users.find((u) => u.email === email);
    if (!user)
      throw {
        response: { data: { message: "Invalid credentials" }, status: 401 },
      };
    write("ft::session", { userId: user.id });
    return ok({ data: user });
  }

  if (path === "/auth/logout") {
    write("ft::session", { userId: null });
    return ok({ data: {} });
  }

  if (path === "/vehicles") {
    const list = read("ft::vehicles", []);
    const v = {
      id: nextId("vehicles"),
      label: body?.label ?? "",
      make: body?.make ?? "",
      model: body?.model ?? "",
      year: body?.year != null ? Number(body.year) : null,
      fuelType: body?.fuelType ?? null,
      createdAt: new Date().toISOString(),
    };
    list.push(v);
    write("ft::vehicles", list);
    return ok({ data: v });
  }

  if (path === "/fillups") {
    const list = read("ft::fillups", []);
    const liters = Number(body?.liters ?? 0);
    const totalAmount = Number(
      body?.totalAmount ?? body?.total_amount ?? body?.total ?? 0
    );
    const f = sanitizeFillup({
      id: nextId("fillups"),
      vehicleId: String(body?.vehicleId ?? "1"),
      date: body?.date || new Date().toISOString(),
      odometerKm: Number(body?.odometerKm ?? 0),
      station: body?.station ?? "",
      brand: body?.brand ?? "",
      grade: body?.grade ?? "",
      liters,
      totalAmount,
      notes: body?.notes ?? null,
      createdAt: new Date().toISOString(),
    });
    list.push(f);
    write("ft::fillups", list);
    return ok({ data: f });
  }

  throw {
    response: { data: { message: `POST ${url} not found` }, status: 404 },
  };
}

// -------------------------- PUT --------------------------
export async function put(url, body) {
  await delay();
  const { path } = normalizeUrl(url);

  // Settings: /Profile/
  if (path === "/profile/" || path === "/profile") {
    const session = read("ft::session", { userId: null });
    if (!session.userId)
      throw {
        response: { data: { message: "Not authenticated" }, status: 401 },
      };
    const users = read("ft::users", []);
    const i = users.findIndex((u) => u.id === session.userId);
    if (i < 0)
      throw { response: { data: { message: "User not found" }, status: 404 } };

    const updated = {
      ...users[i],
      displayName: body.displayName ?? users[i].displayName,
      preferredCurrency: body.preferredCurrency ?? users[i].preferredCurrency,
      preferredDistanceUnit:
        body.preferredDistanceUnit ?? users[i].preferredDistanceUnit,
      preferredVolumeUnit:
        body.preferredVolumeUnit ?? users[i].preferredVolumeUnit,
      efficiencyUnit: body.efficiencyUnit ?? users[i].efficiencyUnit,
      priceDecimals:
        body.priceDecimals != null
          ? Number(body.priceDecimals)
          : users[i].priceDecimals,
    };

    users[i] = updated;
    write("ft::users", users);
    return ok({ data: updated });
  }

  // Vehicles update
  if (path.startsWith("/vehicles/")) {
    const id = path.split("/").pop();
    const list = read("ft::vehicles", []);
    const i = list.findIndex((v) => String(v.id) === String(id));
    if (i < 0)
      throw {
        response: { data: { message: "Vehicle not found" }, status: 404 },
      };
    list[i] = { ...list[i], ...body };
    write("ft::vehicles", list);
    return ok({ data: list[i] });
  }

  // Fillup update
  if (path.startsWith("/fillups/")) {
    const id = path.split("/").pop();
    const list = read("ft::fillups", []);
    const i = list.findIndex((f) => String(f.id) === String(id));
    if (i < 0)
      throw {
        response: { data: { message: "Fill-up not found" }, status: 404 },
      };
    const merged = sanitizeFillup({ ...list[i], ...body });
    list[i] = merged;
    write("ft::fillups", list);
    return ok({ data: merged });
  }

  throw {
    response: { data: { message: `PUT ${url} not found` }, status: 404 },
  };
}

// -------------------------- DELETE --------------------------
export async function delete_(url) {
  await delay();
  const { path } = normalizeUrl(url);

  if (path.startsWith("/vehicles/")) {
    const id = path.split("/").pop();
    const list = read("ft::vehicles", []);
    write(
      "ft::vehicles",
      list.filter((v) => String(v.id) !== String(id))
    );
    return ok({ data: {} });
  }

  if (path.startsWith("/fillups/")) {
    const id = path.split("/").pop();
    const list = read("ft::fillups", []);
    write(
      "ft::fillups",
      list.filter((f) => String(f.id) !== String(id))
    );
    return ok({ data: {} });
  }

  throw {
    response: { data: { message: `DELETE ${url} not found` }, status: 404 },
  };
}

const api = { get, post, put, delete: delete_ };
export default api;
