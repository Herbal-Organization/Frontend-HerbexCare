import { FaTrash } from "react-icons/fa";
import { formatCurrency, getRecipeTotal } from "./cartUtils";

function RecipeCartItem({ recipe, onDecrease, onIncrease, onRemove }) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-emerald-100 dark:border-emerald-800 bg-white dark:bg-slate-800 p-4 shadow-sm ring-1 ring-emerald-50 dark:ring-emerald-900/30 transition-shadow hover:shadow-md sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 flex-1">
        <p className="truncate font-bold text-emerald-900 dark:text-emerald-100">
          {recipe._previewName}
        </p>
        {recipe._providerName ? (
          <p className="mt-1 text-xs text-emerald-700 dark:text-emerald-300">
            By: <span className="font-semibold">{recipe._providerName}</span>
          </p>
        ) : null}
        <p className="mt-1 text-xs text-emerald-700 dark:text-emerald-300">
          {formatCurrency(Number(recipe.unitPrice ?? recipe.price ?? 0))} each
        </p>
        <p className="mt-1 text-xs font-semibold text-emerald-800 dark:text-emerald-200">
          Total: {formatCurrency(getRecipeTotal(recipe))}
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 sm:justify-end">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onDecrease}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-emerald-200 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/30 font-bold text-emerald-700 dark:text-emerald-300 transition-all hover:bg-emerald-100 dark:hover:bg-emerald-800/40"
          >
            -
          </button>
          <div className="min-w-10 rounded-full bg-white dark:bg-slate-800 px-3 py-2 text-center shadow-sm ring-1 ring-emerald-100 dark:ring-emerald-800">
            <p className="font-extrabold text-emerald-900 dark:text-emerald-100">{recipe.quantity}</p>
          </div>
          <button
            type="button"
            onClick={onIncrease}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-emerald-200 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/30 font-bold text-emerald-700 dark:text-emerald-300 transition-all hover:bg-emerald-100 dark:hover:bg-emerald-800/40"
          >
            +
          </button>
        </div>

        <button
          type="button"
          onClick={onRemove}
          className="rounded-full p-2 text-emerald-700/50 dark:text-emerald-400/50 shadow-sm transition-all hover:bg-white dark:hover:bg-slate-700 hover:text-emerald-700 dark:hover:text-emerald-300"
          title="Remove completely"
        >
          <FaTrash />
        </button>
      </div>
    </div>
  );
}

export default RecipeCartItem;
