export default function Terms() {
  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="text-3xl font-semibold mb-4">Terms of Service</h1>
      <p className="text-gray-600 mb-6 text-sm">
        Effective date: {new Date().toISOString().slice(0, 10)}
      </p>

      <section className="prose">
        <h2>1. Acceptance of Terms</h2>
        <p>
          By accessing or using FuelTracker (“Service”), you agree to be bound
          by these Terms. If you do not agree, do not use the Service.
        </p>

        <h2>2. Use of the Service</h2>
        <ul>
          <li>You must be at least 13 years old.</li>
          <li>
            You are responsible for the accuracy of data you enter (e.g.,
            odometer, liters, totals).
          </li>
          <li>Do not attempt to access other users’ data.</li>
        </ul>

        <h2>3. Accounts</h2>
        <p>
          Keep your credentials secure. You are responsible for activity on your
          account. We may suspend accounts for violations, abuse, or security
          concerns.
        </p>

        <h2>4. Data & Privacy</h2>
        <p>
          We store the minimum PII necessary (email). See our{" "}
          <a href="/legal/privacy">Privacy Policy</a>
          for details on how we handle your information and your rights.
        </p>

        <h2>5. Availability & Changes</h2>
        <p>
          We may modify or discontinue features at any time. We strive for high
          availability but do not guarantee uninterrupted access.
        </p>

        <h2>6. Disclaimers</h2>
        <p>
          The Service is provided “as is” without warranties of any kind. You
          use the Service at your own risk.
        </p>

        <h2>7. Limitation of Liability</h2>
        <p>
          To the maximum extent permitted by law, FuelTracker is not liable for
          indirect or consequential damages, or loss of data arising from your
          use of the Service.
        </p>

        <h2>8. Termination</h2>
        <p>
          You may stop using the Service at any time. We may suspend or
          terminate access for violations or misuse.
        </p>

        <h2>9. Contact</h2>
        <p>
          For questions about these Terms, contact support at{" "}
          <a href="mailto:support@example.com">support@example.com</a>.
        </p>
      </section>
    </div>
  );
}
