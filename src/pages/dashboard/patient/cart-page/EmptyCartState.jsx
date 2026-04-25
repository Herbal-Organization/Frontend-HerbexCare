import { Link } from "react-router-dom";
import { FaShoppingCart } from "react-icons/fa";

function EmptyCartState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50/50 px-4 py-16 text-center sm:rounded-[3rem] sm:py-24">
      <FaShoppingCart className="mb-6 text-5xl text-slate-300" />
      <h2 className="text-2xl font-bold text-slate-700">
        Your Medical Cart is Empty
      </h2>
      <p className="mb-8 mt-2 max-w-sm text-slate-500">
        Navigate back to the active catalogs to discover proprietary herbs and
        tailored recipes.
      </p>
      <Link
        to="/patient/home"
        className="rounded-full bg-slate-900 px-6 py-3 text-sm font-bold text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-slate-800"
      >
        Explore Options
      </Link>
    </div>
  );
}

export default EmptyCartState;
