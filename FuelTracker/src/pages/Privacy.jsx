// src/pages/Privacy.jsx
import { useMemo } from "react";
import { Link } from "react-router-dom";

const APP_NAME = "FuelTracker";
const CONTACT_EMAIL = "privacy@fueltracker.app";
const LAST_UPDATED = "October 15, 2025";

function AnchorLink({ href, children }) {
  return (
    <a
      href={href}
      className="text-slate-700 hover:text-blue-700 hover:underline"
    >
      {children}
    </a>
  );
}

function Badge({ children }) {
  return (
    <span className="inline-flex items-center rounded-full border border-slate-300 bg-white px-2.5 py-0.5 text-xs font-medium text-slate-700">
      {children}
    </span>
  );
}

function Card({ title, subtitle, children, id }) {
  return (
    <section id={id} className="scroll-mt-24">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {title && (
          <div className="mb-2">
            <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
            {subtitle && (
              <p className="text-sm text-slate-600 mt-0.5">{subtitle}</p>
            )}
          </div>
        )}
        <div className="prose prose-slate max-w-none">{children}</div>
      </div>
    </section>
  );
}

function SectionHeading({ k, label }) {
  return (
    <li>
      <AnchorLink href={`#${k}`}>{label}</AnchorLink>
    </li>
  );
}

export default function Privacy() {
  const toc = useMemo(
    () => [
      { k: "overview", label: "Overview" },
      { k: "data-we-collect", label: "Data We Collect" },
      { k: "how-we-use-data", label: "How We Use Data" },
      { k: "legal-bases", label: "Legal Bases (GDPR)" },
      { k: "ccpa", label: "Your Rights (CCPA/CPRA)" },
      { k: "cookies", label: "Cookies & Similar Tech" },
      { k: "retention", label: "Data Retention" },
      { k: "security", label: "Security" },
      { k: "sharing", label: "Sharing & Transfers" },
      { k: "international", label: "International Transfers" },
      { k: "children", label: "Children’s Privacy" },
      { k: "choices-rights", label: "Your Choices & Requests" },
      { k: "changes", label: "Changes to This Policy" },
      { k: "contact", label: "Contact" },
      { k: "faq", label: "FAQ" },
    ],
    []
  );

  const cookieCategories = [
    {
      name: "Essential",
      purpose: "Sign-in, session management, load balancing, fraud prevention.",
      examples: ["session_id", "csrf_token"],
      retention: "Session or up to 12 months",
    },
    {
      name: "Preferences",
      purpose: "Remember currency/units, UI settings.",
      examples: ["currency", "units", "theme"],
      retention: "6–12 months",
    },
    {
      name: "Analytics",
      purpose: "Aggregate usage metrics, performance and error diagnostics.",
      examples: ["_analytics_id", "_perf"],
      retention: "6–24 months",
    },
    {
      name: "Marketing (if enabled)",
      purpose: "Measure campaign performance, optional.",
      examples: ["utm_*", "_ad_*"],
      retention: "3–12 months",
    },
  ];

  return (
    <main className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
      {/* Header */}
      <header className="mb-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Privacy Policy
            </h1>
            <p className="text-sm text-slate-600">
              Last updated: {LAST_UPDATED}
            </p>
          </div>

          <Link
            to="/dashboard"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Go to Dashboard
          </Link>
        </div>

        <div className="mt-3 text-slate-700">
          <p>
            {APP_NAME} (“we”, “our”, “us”) is committed to protecting your
            privacy. This policy explains what information we collect, how we
            use it, and the rights and choices available to you.
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge>GDPR-aware</Badge>
            <Badge>CCPA/CPRA-aware</Badge>
            <Badge>Security-first</Badge>
          </div>
        </div>
      </header>

      {/* Layout: TOC + content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* TOC */}
        <aside className="lg:col-span-3 print:hidden">
          <div className="lg:sticky lg:top-24 rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-slate-900 mb-2">
              On this page
            </h2>
            <ul className="space-y-1 text-sm text-slate-700">
              {toc.map((t) => (
                <SectionHeading key={t.k} k={t.k} label={t.label} />
              ))}
            </ul>
          </div>
        </aside>

        {/* Main Content */}
        <div className="lg:col-span-9 space-y-6">
          <Card
            id="overview"
            title="Overview"
            subtitle={`${APP_NAME} collects only what it needs to run a reliable, secure service.`}
          >
            <p>
              We collect account, usage, and content data you choose to provide
              (e.g., vehicles and fill-ups) to offer core features like tracking
              costs, mileage efficiency, and insights. We don’t sell your
              personal data.
            </p>
          </Card>

          <Card id="data-we-collect" title="Data We Collect">
            <ul>
              <li>
                <strong>Account data:</strong> name, email, display name,
                authentication identifiers.
              </li>
              <li>
                <strong>App content:</strong> vehicles (label, make, model,
                year, fuel type), fill-up entries (date, volume, price,
                odometer, notes).
              </li>
              <li>
                <strong>Usage & diagnostics:</strong> app interactions,
                device/browser type, approximate IP-based location, timestamps,
                crash logs.
              </li>
              <li>
                <strong>Cookies & similar:</strong> essential session cookies,
                preferences, optional analytics/marketing (if enabled).
              </li>
            </ul>
          </Card>

          <Card id="how-we-use-data" title="How We Use Data">
            <ul>
              <li>
                Provide and improve core features and personalization
                (currency/units).
              </li>
              <li>
                Authenticate users, maintain sessions, detect/prevent abuse.
              </li>
              <li>
                Diagnose issues, measure performance, and enhance reliability.
              </li>
              <li>
                Communicate important updates, security alerts, and support
                responses.
              </li>
              <li>Comply with legal obligations and enforce terms.</li>
            </ul>
          </Card>

          <Card id="legal-bases" title="Legal Bases (GDPR)">
            <ul>
              <li>
                <strong>Contract:</strong> to deliver the service you requested.
              </li>
              <li>
                <strong>Legitimate interests:</strong> secure, improve, and
                support our service in ways that respect your privacy.
              </li>
              <li>
                <strong>Consent:</strong> for non-essential cookies/analytics or
                where required by law.
              </li>
              <li>
                <strong>Legal obligations:</strong> comply with applicable laws.
              </li>
            </ul>
          </Card>

          <Card id="cookies" title="Cookies & Similar Technologies">
            <p>
              We use cookies and similar technologies to ensure secure logins,
              remember preferences, and analyze performance. You can manage or
              disable cookies through browser settings.
            </p>
            <div className="overflow-x-auto mt-4">
              <table className="w-full text-sm border-separate border-spacing-y-2">
                <thead>
                  <tr className="text-left text-slate-600">
                    <th className="px-3 py-2">Category</th>
                    <th className="px-3 py-2">Purpose</th>
                    <th className="px-3 py-2">Examples</th>
                    <th className="px-3 py-2">Retention</th>
                  </tr>
                </thead>
                <tbody>
                  {cookieCategories.map((c) => (
                    <tr key={c.name}>
                      <td className="px-3 py-2 font-medium text-slate-900">
                        {c.name}
                      </td>
                      <td className="px-3 py-2 text-slate-700">{c.purpose}</td>
                      <td className="px-3 py-2 text-slate-700">
                        <code>{c.examples.join(", ")}</code>
                      </td>
                      <td className="px-3 py-2 text-slate-700">
                        {c.retention}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card id="security" title="Security">
            <p>
              We employ reasonable administrative and technical safeguards—such
              as secure storage, encryption in transit, and access controls—to
              protect user data.
            </p>
          </Card>

          <Card id="contact" title="Contact">
            <p>
              Have questions or requests? Email{" "}
              <a
                className="text-blue-700 hover:underline"
                href={`mailto:${CONTACT_EMAIL}`}
              >
                {CONTACT_EMAIL}
              </a>
              .
            </p>
          </Card>
        </div>
      </div>
    </main>
  );
}
