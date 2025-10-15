import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-white px-4">
      <div className="mx-auto w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm text-center">
        {/* 404 Icon */}
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 ring-1 ring-blue-200">
          <svg
            className="h-8 w-8 text-blue-600"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M3 12h3m6 0h3m6 0h-3M3 12a9 9 0 1 0 18 0 9 9 0 1 0-18 0z" />
          </svg>
        </div>

        <h1 className="text-2xl font-semibold text-slate-900">
          Page Not Found
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          The page you’re looking for doesn’t exist or may have been moved.
        </p>

        <div className="mt-6 flex flex-col sm:flex-row justify-center gap-3">
          <Link
            to="/"
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
          >
            Go Home
          </Link>
          <Link
            to="/app/dashboard"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-md shadow-blue-600/20 transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
