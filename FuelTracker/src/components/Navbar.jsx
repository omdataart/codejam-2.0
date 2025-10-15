import { Link, NavLink } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export default function Navbar() {
  const { user } = useAuthStore(); // removed signOut since Logout button removed

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-3 flex items-center justify-between">
        {/* Brand */}
        <Link
          to="/"
          className="flex items-center gap-2 font-bold text-lg text-slate-800 hover:text-blue-700 transition"
        >
          {/* inline fuel icon */}
          <svg
            className="h-5 w-5 text-blue-600"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M3 7a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v12H3V7Z" />
            <path d="M7 10h5" />
            <path d="M19 7v9a2 2 0 0 1-2 2h-1" />
            <path d="M16 7l2-2 2 2" />
          </svg>
          <span>FuelTracker</span>
        </Link>

        {/* Navigation */}
        <nav className="flex flex-wrap items-center gap-3 text-sm font-medium">
          {user ? (
            <>
              {[
                ["Dashboard", "/app/dashboard"],
                ["History", "/app/history"],
                ["Add Fill-Up", "/app/fillups/new"],
                ["Vehicles", "/app/vehicles"],
                ["Brand Stats", "/app/stats/brand-grade"],
                ["Settings", "/app/settings"],
                ["Privacy", "/privacy"], // ✅ Privacy page link
              ].map(([label, path]) => (
                <NavLink
                  key={path}
                  to={path}
                  className={({ isActive }) =>
                    [
                      "rounded-md px-3 py-1.5 transition-colors duration-200",
                      isActive
                        ? "bg-blue-50 text-blue-700 font-semibold"
                        : "text-slate-700 hover:text-blue-700 hover:bg-slate-100",
                    ].join(" ")
                  }
                >
                  {label}
                </NavLink>
              ))}
            </>
          ) : (
            <>
              <NavLink
                to="/auth/login"
                className={({ isActive }) =>
                  [
                    "rounded-md px-3 py-1.5 transition-colors duration-200",
                    isActive
                      ? "bg-blue-50 text-blue-700 font-semibold"
                      : "text-slate-700 hover:text-blue-700 hover:bg-slate-100",
                  ].join(" ")
                }
              >
                Login
              </NavLink>
              <NavLink
                to="/auth/signup"
                className={({ isActive }) =>
                  [
                    "rounded-md px-3 py-1.5 transition-colors duration-200",
                    isActive
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-blue-600/90 text-white hover:bg-blue-700",
                  ].join(" ")
                }
              >
                Sign Up
              </NavLink>
              <NavLink
                to="/privacy"
                className={({ isActive }) =>
                  [
                    "rounded-md px-3 py-1.5 transition-colors duration-200",
                    isActive
                      ? "bg-blue-50 text-blue-700 font-semibold"
                      : "text-slate-700 hover:text-blue-700 hover:bg-slate-100",
                  ].join(" ")
                }
              >
                Privacy
              </NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
