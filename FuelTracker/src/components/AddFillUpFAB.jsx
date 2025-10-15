import { Link } from "react-router-dom";
import { Plus } from "lucide-react"; // optional icon for better UI

export default function AddFillUpFAB() {
  return (
    <Link
      to="/app/fillups/new"
      aria-label="Add Fill-Up"
      className="fixed bottom-6 right-6 md:bottom-8 md:right-8 flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 text-sm md:text-base font-medium text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      <Plus size={18} className="hidden sm:block" />
      Add Fill-Up
    </Link>
  );
}
