import SummaryRows from "./SummaryRows";
import TotalsBlock from "./TotalsBlock";

function OrderSummaryCard({ herbs, recipes, herbsTotal, recipesTotal }) {
  return (
    <div className="overflow-hidden rounded-4xl border border-slate-200 bg-white/95 p-4 shadow-sm backdrop-blur sm:p-6 lg:rounded-[2.5rem] lg:p-8">
      <div className="mb-6 border-b border-slate-100 pb-4">
        <h2 className="text-lg font-extrabold text-slate-900 sm:text-xl">
          Order Summary
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          A quick breakdown of items and totals.
        </p>
      </div>
      <div className="space-y-4">
        <SummaryRows herbs={herbs} recipes={recipes} />
        <TotalsBlock herbsTotal={herbsTotal} recipesTotal={recipesTotal} />
      </div>
    </div>
  );
}

export default OrderSummaryCard;
