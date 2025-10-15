import { useLocation, Link } from "react-router-dom";

export default function ErrorPage() {
  const location = useLocation();
  const info = location?.state?.errorInfo;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-white px-4">
      <div className="mx-auto w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 ring-1 ring-red-200">
            <svg
              className="h-7 w-7 text-red-600"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>

          <h1 className="text-2xl font-semibold text-slate-900">
            Something went wrong
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            An unexpected error occurred. Try refreshing the page or go back to
            your dashboard.
          </p>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row justify-center gap-3">
          <button
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
            onClick={() => window.location.reload()}
          >
            Refresh
          </button>
          <Link
            to="/app/dashboard"
            className="rounded-lg bg-blue-600 px-4 py-2 text-center text-sm font-medium text-white shadow-md shadow-blue-600/20 transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
          >
            Go to Dashboard
          </Link>
        </div>

        {info && (
          <details className="mt-6 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-800">
            <summary className="cursor-pointer font-semibold text-slate-700">
              Technical details
            </summary>
            <div className="mt-2 space-y-2 whitespace-pre-wrap">
              <div>
                <strong>Message:</strong> {info.message}
              </div>
              <div>
                <strong>Component stack:</strong> {info.stack}
              </div>
            </div>
          </details>
        )}
      </div>
    </div>
  );
}
