import { formatCurrency } from "./cartUtils";

function TotalsBlock({ herbsTotal, recipesTotal }) {
  const allItemsTotal = herbsTotal + recipesTotal;

  return (
    <div className="pt-2">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-700">
          Subtotal (Recipes)
        </span>
        <span className="text-lg font-bold text-emerald-600">
          {formatCurrency(recipesTotal)}
        </span>
      </div>
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-700">
          Subtotal (Herbs)
        </span>
        <span className="text-lg font-bold text-emerald-600">
          {formatCurrency(herbsTotal)}
        </span>
      </div>
      <div className="mb-3 flex items-center justify-between border-t border-slate-100 pt-2">
        <span className="text-sm font-semibold text-slate-800">
          Subtotal (All Items)
        </span>
        <span className="text-xl font-extrabold text-emerald-700">
          {formatCurrency(allItemsTotal)}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-700">Shipping</span>
        <span className="text-lg font-bold text-slate-600">TBD</span>
      </div>
    </div>
  );
}

export default TotalsBlock;
