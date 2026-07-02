import { formatCurrency } from "./cartUtils";

function TotalsBlock({ herbsTotal, recipesTotal, aiRecipesTotal }) {
  const allItemsTotal = herbsTotal + recipesTotal + aiRecipesTotal;

  return (
    <div className="rounded-3xl bg-white dark:bg-slate-800 p-4 shadow-sm ring-1 ring-slate-100 dark:ring-slate-700">
      <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          Subtotal (Recipes)
        </span>
        <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
          {formatCurrency(recipesTotal)}
        </span>
      </div>
      <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          Subtotal (Herbs)
        </span>
        <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
          {formatCurrency(herbsTotal)}
        </span>
      </div>
      <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          Subtotal (AI Recipes)
        </span>
        <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
          {formatCurrency(aiRecipesTotal)}
        </span>
      </div>
      <div className="mb-3 flex flex-col gap-1 border-t border-slate-100 dark:border-slate-700 pt-3 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
          Subtotal (All Items)
        </span>
        <span className="text-xl font-extrabold text-emerald-700 dark:text-emerald-300">
          {formatCurrency(allItemsTotal)}
        </span>
      </div>
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Shipping</span>
        <span className="text-lg font-bold text-slate-600 dark:text-slate-400">TBD</span>
      </div>
    </div>
  );
}

export default TotalsBlock;
