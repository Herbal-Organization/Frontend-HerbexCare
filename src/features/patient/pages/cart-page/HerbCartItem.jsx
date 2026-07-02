import { FaMinus, FaPlus, FaTrash } from "react-icons/fa";
import { formatCurrency, getHerbTotal } from "./cartUtils";

function HerbCartItem({ herb, onDecrease, onIncrease, onRemove }) {
  return (
    <div className="rounded-2xl border border-emerald-100 dark:border-emerald-800 bg-linear-to-br from-emerald-50 to-white dark:from-emerald-950/30 dark:to-slate-800 p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <p className="truncate font-bold text-emerald-900 dark:text-emerald-100">
            {herb._previewName}
          </p>
          <p className="mt-1 text-xs text-emerald-700 dark:text-emerald-300">
            By: <span className="font-semibold">{herb._providerName}</span>
          </p>
          <p className="mt-1 text-xs text-emerald-700 dark:text-emerald-300">
            Quantity: {herb.quantityPerGram}g
          </p>

          {Boolean(herb.pricePerKilo) && (
            <div className="mt-2 text-sm font-semibold text-emerald-700 dark:text-emerald-300">
              <span>{herb.pricePerKilo} EGP/kg</span>
              {" × "}
              <span>{herb.quantityPerGram}g</span>
              {" = "}
              <span className="font-bold text-emerald-800 dark:text-emerald-200">
                {formatCurrency(getHerbTotal(herb))}
              </span>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onRemove}
          className="ms-auto rounded-full p-2 text-emerald-600 dark:text-emerald-400 shadow-sm transition-all hover:bg-white dark:hover:bg-slate-700 hover:text-rose-600 dark:hover:text-rose-400 sm:ms-0"
          title="Remove from cart"
        >
          <FaTrash />
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap">
        <button
          type="button"
          onClick={onDecrease}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-emerald-200 dark:border-emerald-700 bg-emerald-100 dark:bg-emerald-900/40 font-bold text-emerald-700 dark:text-emerald-300 transition-all hover:bg-emerald-200 dark:hover:bg-emerald-800/50"
        >
          <FaMinus className="text-xs" />
        </button>
        <div className="min-w-20 rounded-full border border-emerald-200 dark:border-emerald-700 bg-white dark:bg-slate-800 px-4 py-2 text-center shadow-sm">
          <p className="text-sm font-bold text-emerald-900 dark:text-emerald-100">
            {herb.quantityPerGram}g
          </p>
        </div>
        <button
          type="button"
          onClick={onIncrease}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-emerald-200 dark:border-emerald-700 bg-emerald-100 dark:bg-emerald-900/40 font-bold text-emerald-700 dark:text-emerald-300 transition-all hover:bg-emerald-200 dark:hover:bg-emerald-800/50"
        >
          <FaPlus className="text-xs" />
        </button>
      </div>
    </div>
  );
}

export default HerbCartItem;
