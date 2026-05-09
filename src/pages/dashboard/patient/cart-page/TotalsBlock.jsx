import { formatCurrency } from "./cartUtils";

function TotalsBlock({ herbsTotal, recipesTotal }) {
  const allItemsTotal = herbsTotal + recipesTotal;

  return (
    <div className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
      <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-sm font-semibold text-slate-700">
          Subtotal (Recipes)
        </span>
        <span className="text-lg font-bold text-emerald-600">
          {formatCurrency(recipesTotal)}
        </span>
      </div>
      <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-sm font-semibold text-slate-700">
          Subtotal (Herbs)
        </span>
        <span className="text-lg font-bold text-emerald-600">
          {formatCurrency(herbsTotal)}
        </span>
      </div>
      <div className="mb-3 flex flex-col gap-1 border-t border-slate-100 pt-3 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-sm font-semibold text-slate-800">
          Subtotal (All Items)
        </span>
        <span className="text-xl font-extrabold text-emerald-700">
          {formatCurrency(allItemsTotal)}
        </span>
      </div>
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-sm font-semibold text-slate-700">Shipping</span>
        <span className="text-lg font-bold text-slate-600">TBD</span>
      </div>
    </div>
  );
}

export default TotalsBlock;
