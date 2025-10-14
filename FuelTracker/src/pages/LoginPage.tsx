import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export default function LoginPage() {
  const { signIn, loading, error } = useAuthStore();
  const [email, setEmail] = useState("test@example.com");
  const [password, setPassword] = useState("demo123");
  const nav = useNavigate();

  async function onSubmit(e) {
    e.preventDefault();
    try {
      await signIn({ email, password });
      nav("/app/dashboard");
    } catch {}
  }

  return (
    <div className="mx-auto max-w-md p-6">
      <h2 className="text-2xl font-bold mb-4">Sign in</h2>
      <form onSubmit={onSubmit} className="space-y-3">
        <input
          className="w-full border rounded p-2"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="w-full border rounded p-2"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button
          disabled={loading}
          className="w-full bg-black text-white rounded py-2"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
      <p className="text-sm mt-3">
        No account?{" "}
        <Link to="/auth/signup" className="underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
