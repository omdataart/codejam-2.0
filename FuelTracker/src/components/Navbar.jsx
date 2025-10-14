import { Link, NavLink } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export default function Navbar() {
  const { user, signOut } = useAuthStore();

  return (
    <header className="border-b bg-white">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <Link to="/" className="font-bold text-xl">
          FuelTracker
        </Link>

        <nav className="flex flex-wrap gap-4 text-sm items-center">
          {user ? (
            <>
              <NavLink to="/app/dashboard">Dashboard</NavLink>
              <NavLink to="/app/history">History</NavLink>
              <NavLink to="/app/fillups/new">Add Fill-Up</NavLink>
              <NavLink to="/app/vehicles">Vehicles</NavLink>
              <NavLink to="/app/stats/brand-grade">Brand Stats</NavLink>
              <NavLink to="/app/settings">Settings</NavLink>
              <button
                onClick={signOut}
                className="border rounded px-3 py-1 text-sm"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/auth/login">Login</NavLink>
              <NavLink to="/auth/signup">Sign Up</NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
