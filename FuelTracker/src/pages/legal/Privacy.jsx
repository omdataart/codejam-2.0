export default function Privacy() {
  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="text-3xl font-semibold mb-4">Privacy Policy</h1>
      <p className="text-gray-600 mb-6 text-sm">
        Effective date: {new Date().toISOString().slice(0, 10)}
      </p>

      <section className="prose">
        <h2>1. Information We Collect</h2>
        <ul>
          <li>
            <strong>Account:</strong> Email and password (stored as a strong
            one-way hash).
          </li>
          <li>
            <strong>App Data:</strong> Vehicles and fuel entries (e.g., date,
            liters, totals, odometer).
          </li>
          <li>
            <strong>Technical:</strong> Basic logs for security and debugging
            (no stack traces shown to users).
          </li>
        </ul>

        <h2>2. How We Use Information</h2>
        <ul>
          <li>Provide core features (history, statistics, dashboards).</li>
          <li>Secure the Service and troubleshoot issues.</li>
          <li>Comply with legal obligations.</li>
        </ul>

        <h2>3. Data Sharing</h2>
        <p>
          We do not sell personal data. We may share minimal data with
          infrastructure providers (e.g., hosting) strictly to operate the
          Service, under appropriate safeguards.
        </p>

        <h2>4. Security</h2>
        <p>
          Passwords are hashed. Sessions use HTTP-only Secure cookies. We
          enforce strict tenant isolation.
        </p>

        <h2>5. Your Rights</h2>
        <ul>
          <li>Access or export your data (CSV).</li>
          <li>Request deletion of your account and associated data.</li>
        </ul>

        <h2>6. Retention</h2>
        <p>
          We retain data while your account is active or as needed to provide
          the Service. Upon deletion requests, we hard-delete user data.
        </p>

        <h2>7. Contact</h2>
        <p>
          For privacy questions or requests, email{" "}
          <a href="mailto:privacy@example.com">privacy@example.com</a>.
        </p>
      </section>
    </div>
  );
}
