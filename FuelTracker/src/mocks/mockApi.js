// Tiny in-browser mock. Data in localStorage under "ft::*"
const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms));
const ok = (data) => ({ data });
const read = (k, def) =>
  JSON.parse(localStorage.getItem(k) ?? JSON.stringify(def));
const write = (k, v) => localStorage.setItem(k, JSON.stringify(v));

function ensureBoot() {
  if (!localStorage.getItem("ft::boot")) {
    const user = {
      id: "u1",
      email: "test@example.com",
      displayName: "Dev User",
    };
    write("ft::users", [user]);
    write("ft::session", { userId: null });
    write("ft::vehicles", []);
    write("ft::fillups", []);
    localStorage.setItem("ft::boot", "1");
  }
}
ensureBoot();

export async function get(url) {
  await delay();
  const session = read("ft::session", { userId: null });
  if (url === "/auth/me") {
    const u = read("ft::users", []).find((x) => x.id === session.userId);
    if (!u)
      throw {
        response: { data: { message: "Not authenticated" }, status: 401 },
      };
    return ok(u);
  }
  if (url.startsWith("/vehicles")) {
    const list = read("ft::vehicles", []);
    return ok(list);
  }
  if (url.startsWith("/fillups")) {
    const list = read("ft::fillups", []);
    return ok(list.sort((a, b) => new Date(b.date) - new Date(a.date)));
  }
  throw {
    response: { data: { message: `GET ${url} not found` }, status: 404 },
  };
}

export async function post(url, body) {
  await delay();
  if (url === "/auth/login") {
    const { email, password } = body;
    const users = read("ft::users", []);
    const user = users.find((u) => u.email === email);
    if (!user || !password)
      throw {
        response: { data: { message: "Invalid credentials" }, status: 401 },
      };
    write("ft::session", { userId: user.id });
    return ok(user);
  }
  if (url === "/auth/signup") {
    const { email, displayName } = body;
    const users = read("ft::users", []);
    if (users.some((u) => u.email === email)) {
      throw {
        response: { data: { message: "Email already used" }, status: 409 },
      };
    }
    const user = {
      id: crypto.randomUUID(),
      email,
      displayName: displayName || "",
    };
    users.push(user);
    write("ft::users", users);
    write("ft::session", { userId: user.id });
    return ok(user);
  }
  if (url === "/auth/logout") {
    write("ft::session", { userId: null });
    return ok({});
  }
  if (url === "/vehicles") {
    const list = read("ft::vehicles", []);
    const v = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      ...body,
    };
    list.push(v);
    write("ft::vehicles", list);
    return ok(v);
  }
  if (url === "/fillups") {
    const list = read("ft::fillups", []);
    const f = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      ...body,
    };
    list.push(f);
    write("ft::fillups", list);
    return ok(f);
  }
  throw {
    response: { data: { message: `POST ${url} not found` }, status: 404 },
  };
}

export async function put(url, body) {
  await delay();
  if (url.startsWith("/vehicles/")) {
    const id = url.split("/").pop();
    const list = read("ft::vehicles", []);
    const i = list.findIndex((v) => v.id === id);
    if (i < 0)
      throw {
        response: { data: { message: "Vehicle not found" }, status: 404 },
      };
    list[i] = { ...list[i], ...body };
    write("ft::vehicles", list);
    return ok(list[i]);
  }
  if (url.startsWith("/fillups/")) {
    const id = url.split("/").pop();
    const list = read("ft::fillups", []);
    const i = list.findIndex((f) => f.id === id);
    if (i < 0)
      throw {
        response: { data: { message: "Fill-up not found" }, status: 404 },
      };
    list[i] = { ...list[i], ...body };
    write("ft::fillups", list);
    return ok(list[i]);
  }
  throw {
    response: { data: { message: `PUT ${url} not found` }, status: 404 },
  };
}

export async function delete_(url) {
  await delay();
  if (url.startsWith("/vehicles/")) {
    const id = url.split("/").pop();
    const list = read("ft::vehicles", []);
    write(
      "ft::vehicles",
      list.filter((v) => v.id !== id)
    );
    return ok({});
  }
  if (url.startsWith("/fillups/")) {
    const id = url.split("/").pop();
    const list = read("ft::fillups", []);
    write(
      "ft::fillups",
      list.filter((f) => f.id !== id)
    );
    return ok({});
  }
  throw {
    response: { data: { message: `DELETE ${url} not found` }, status: 404 },
  };
}

const api = { get, post, put, delete: delete_ };
export default api;
