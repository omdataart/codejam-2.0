import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t bg-white mt-10">
      <div className="mx-auto max-w-6xl px-4 py-6 flex flex-col md:flex-row items-center justify-between text-sm text-gray-600">
        {/* Left side */}
        <div className="text-center md:text-left mb-2 md:mb-0">
          © {new Date().getFullYear()}{" "}
          <span className="font-medium">FuelTracker</span>. All rights reserved.
        </div>

        {/* Right side */}
        <nav className="flex gap-4 text-center md:text-right">
          <Link
            to="/legal/terms"
            className="hover:text-black underline-offset-2 hover:underline transition"
          >
            Terms
          </Link>
          <Link
            to="/legal/privacy"
            className="hover:text-black underline-offset-2 hover:underline transition"
          >
            Privacy
          </Link>
        </nav>
      </div>
    </footer>
  );
}
