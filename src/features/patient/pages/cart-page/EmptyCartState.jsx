import { Link } from "react-router-dom";
import { FaShoppingCart } from "react-icons/fa";

function EmptyCartState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-4xl border-2 border-dashed border-slate-200 dark:border-slate-700 bg-linear-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 px-4 py-16 text-center shadow-sm sm:rounded-[3rem] sm:py-24">
      <div className="mb-6 rounded-full bg-white dark:bg-slate-800 p-5 shadow-sm ring-1 ring-slate-100 dark:ring-slate-700">
        <FaShoppingCart className="text-4xl text-slate-300 dark:text-slate-600 sm:text-5xl" />
      </div>
      <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-300 sm:text-3xl">
        Your Medical Cart is Empty
      </h2>
      <p className="mb-8 mt-3 max-w-md text-sm leading-7 text-slate-500 dark:text-slate-400 sm:text-base">
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
