import { useLocation, Link } from "react-router-dom";

export default function ErrorPage() {
  const location = useLocation();
  const info = location?.state?.errorInfo;

  return (
    <div className="mx-auto max-w-xl p-6">
      <h1 className="text-2xl font-semibold mb-2">Something went wrong</h1>
      <p className="text-gray-600 mb-4">
        An unexpected error occurred. Try refreshing the page, or go back to the
        Dashboard.
      </p>

      <div className="flex gap-2 mb-6">
        <button
          className="border rounded px-3 py-2"
          onClick={() => window.location.reload()}
        >
          Refresh
        </button>
        <Link to="/app/dashboard" className="border rounded px-3 py-2">
          Go to Dashboard
        </Link>
      </div>

      {info && (
        <details className="bg-gray-50 border rounded p-3 text-xs whitespace-pre-wrap">
          <summary className="cursor-pointer mb-2">Technical details</summary>
          <div>
            <strong>Message:</strong> {info.message}
          </div>
          <div className="mt-2">
            <strong>Component stack:</strong> {info.stack}
          </div>
        </details>
      )}
    </div>
  );
}
