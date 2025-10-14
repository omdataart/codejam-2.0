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
    <div className="mx-auto max-w-md p-6">
      <h2 className="text-2xl font-bold mb-4">Create account</h2>
      <form onSubmit={onSubmit} className="space-y-3">
        <input
          className="w-full border rounded p-2"
          placeholder="Display name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
        />
        <input
          className="w-full border rounded p-2"
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="w-full border rounded p-2"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button
          disabled={loading}
          className="w-full bg-black text-white rounded py-2"
        >
          {loading ? "Creating..." : "Create account"}
        </button>
      </form>
      <p className="text-sm mt-3">
        Already have an account?{" "}
        <Link to="/auth/login" className="underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
