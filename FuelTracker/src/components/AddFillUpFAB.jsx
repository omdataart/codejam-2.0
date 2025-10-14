import { Link } from "react-router-dom";

export default function AddFillUpFAB() {
  return (
    <Link
      to="/app/fillups/new"
      className="fixed bottom-5 right-5 md:bottom-8 md:right-8 rounded-full shadow-lg bg-black text-white px-5 py-3 text-sm md:text-base"
      aria-label="Add Fill-Up"
    >
      + Add Fill-Up
    </Link>
  );
}
