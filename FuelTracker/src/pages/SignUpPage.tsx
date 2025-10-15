import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export default function SignUpPage() {
  const { signUp, loading, error } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const nav = useNavigate();

  async function onSubmit(e) {
    e.preventDefault();
    try {
      await signUp({ email, password, displayName });
      nav("/app/dashboard");
    } catch {}
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="mx-auto max-w-md px-4 py-10 sm:py-16">
        {/* Brand / Logo */}
        <div className="mb-8 flex items-center justify-center gap-3">
          <span
            aria-hidden="true"
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600/10 ring-1 ring-blue-600/20"
            title="Fuel Tracker"
          >
            {/* inline fuel pump SVG */}
            <svg
              className="h-6 w-6 text-blue-700"
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
          </span>
          <div className="text-center">
            <h1 className="text-xl font-semibold text-slate-900">
              Fuel Tracker
            </h1>
            <p className="text-xs text-slate-500">Create your free account</p>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-lg shadow-slate-200/50">
          <div className="px-6 py-6 sm:px-8 sm:py-8">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 mb-2">
              Create account
            </h2>
            <p className="text-sm text-slate-600 mb-6">
              Start tracking your vehicle fuel expenses today.
            </p>

            <form onSubmit={onSubmit} className="space-y-4" noValidate>
              {/* Display Name */}
              <div className="space-y-1.5">
                <label
                  htmlFor="displayName"
                  className="block text-sm font-medium text-slate-800"
                >
                  Display name
                </label>
                <input
                  id="displayName"
                  name="displayName"
                  placeholder="John Doe"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-slate-900 placeholder:text-slate-400 shadow-sm outline-none transition focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                />
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-slate-800"
                >
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-slate-900 placeholder:text-slate-400 shadow-sm outline-none transition focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-slate-800"
                >
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-slate-900 placeholder:text-slate-400 shadow-sm outline-none transition focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {/* Error message */}
              <div
                id="signup-error"
                className="min-h-5"
                aria-live="polite"
                role={error ? "alert" : "status"}
              >
                {error && (
                  <p className="mt-1 text-sm font-medium text-red-600">
                    {error}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                disabled={loading}
                className="w-full rounded-xl bg-blue-600 px-4 py-2.5 text-white font-medium shadow-md shadow-blue-600/20 transition focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed hover:bg-blue-700"
              >
                {loading ? "Creating..." : "Create account"}
              </button>
            </form>

            {/* Divider */}
            <div className="my-6 flex items-center gap-3 text-slate-400">
              <span className="h-px flex-1 bg-slate-200" />
              <span className="text-xs">or</span>
              <span className="h-px flex-1 bg-slate-200" />
            </div>

            {/* Login link */}
            <p className="text-sm text-slate-700">
              Already have an account?{" "}
              <Link
                to="/auth/login"
                className="font-medium text-blue-700 underline-offset-2 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 rounded"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-slate-500">
          Accessible • Responsive • Tailwind powered
        </p>
      </div>
    </div>
  );
}
