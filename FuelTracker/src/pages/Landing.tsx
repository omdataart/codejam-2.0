import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div className="relative min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* subtle decorative grid */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 [mask-image:linear-gradient(to_bottom,black,transparent)]"
      >
        <svg
          className="h-full w-full opacity-[0.06]"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="grid"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path d="M40 0H0V40" fill="none" stroke="currentColor" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <main className="relative mx-auto max-w-4xl px-4 py-16 sm:py-24">
        {/* Badge / mini logo */}
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50/60 px-3 py-1 text-xs font-medium text-blue-700">
          <svg
            className="h-4 w-4"
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
          <span>Fuel Tracker MVP</span>
        </div>

        <h1 className="text-balance text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          Track fuel. <span className="text-blue-700">Know your costs.</span>
        </h1>

        <p className="mt-3 max-w-2xl text-pretty text-slate-600 sm:text-lg">
          Log fill-ups and instantly see consumption and spend. Clear insights,
          no clutter— just the numbers that matter.
        </p>

        <div className="mt-8">
          <Link
            to="/auth/signup"
            className={[
              "inline-flex items-center justify-center",
              "rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-blue-600/20",
              "transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2",
            ].join(" ")}
            aria-label="Create your account to start tracking fuel"
          >
            Get Started
          </Link>
        </div>

        {/* tiny reassurance line */}
        <p className="mt-3 text-xs text-slate-500">
          Free to try • Accessible • Responsive
        </p>
      </main>
    </div>
  );
}
