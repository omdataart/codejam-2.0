import { Link } from "react-router-dom";
export default function Landing() {
  return (
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="text-3xl font-bold mb-2">Track fuel. Know your costs.</h1>
      <p className="text-gray-600 mb-6">
        Log fill-ups and see consumption and spend.
      </p>
      <Link
        to="/auth/signup"
        className="inline-block bg-black text-white px-4 py-2 rounded"
      >
        Get Started
      </Link>
    </div>
  );
}
