import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export default function LoginPage() {
  const { signIn, loading, error } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const nav = useNavigate();

  async function onSubmit(e) {
    e.preventDefault();
    try {
      await signIn({ email, password });
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
            {/* tiny fuel pump svg */}
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
            <p className="text-xs text-slate-500">
              Track fuel. Know your costs.
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-lg shadow-slate-200/50">
          <div className="px-6 py-6 sm:px-8 sm:py-8">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 mb-2">
              Sign in
            </h2>
            <p className="text-sm text-slate-600 mb-6">
              Welcome back! Please enter your details to continue.
            </p>

            {/* Form */}
            <form onSubmit={onSubmit} className="space-y-4" noValidate>
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
                  inputMode="email"
                  autoComplete="email"
                  required
                  placeholder="you@example.com"
                  className={[
                    "w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5",
                    "text-slate-900 placeholder:text-slate-400",
                    "shadow-sm outline-none transition",
                    "focus:ring-2 focus:ring-blue-600 focus:ring-offset-2",
                    error ? "aria-[invalid=true]:ring-2" : "",
                  ].join(" ")}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? "auth-error" : undefined}
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
                  autoComplete="current-password"
                  required
                  placeholder="••••••••"
                  className={[
                    "w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5",
                    "text-slate-900 placeholder:text-slate-400",
                    "shadow-sm outline-none transition",
                    "focus:ring-2 focus:ring-blue-600 focus:ring-offset-2",
                    error ? "aria-[invalid=true]:ring-2" : "",
                  ].join(" ")}
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? "auth-error" : undefined}
                />
              </div>

              {/* Error / async message area */}
              <div
                id="auth-error"
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

              {/* Submit */}
              <button
                disabled={loading}
                className={[
                  "w-full rounded-xl bg-blue-600 px-4 py-2.5 text-white font-medium",
                  "shadow-md shadow-blue-600/20",
                  "transition focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2",
                  "disabled:opacity-60 disabled:cursor-not-allowed",
                  !loading ? "hover:bg-blue-700" : "",
                ].join(" ")}
                title="Sign in"
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </form>

            {/* Divider */}
            <div className="my-6 flex items-center gap-3 text-slate-400">
              <span className="h-px flex-1 bg-slate-200" />
              <span className="text-xs">or</span>
              <span className="h-px flex-1 bg-slate-200" />
            </div>

            {/* Sign up link */}
            <p className="text-sm text-slate-700">
              No account?{" "}
              <Link
                to="/auth/signup"
                className="font-medium text-blue-700 underline-offset-2 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 rounded"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>

        {/* Footer hint */}
        <p className="mt-6 text-center text-xs text-slate-500">
          Protected by best practices • Accessible • Responsive
        </p>
      </div>
    </div>
  );
}
