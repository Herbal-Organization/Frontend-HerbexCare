import SummaryRows from "./SummaryRows";
import TotalsBlock from "./TotalsBlock";

function OrderSummaryCard({ herbs, recipes, herbsTotal, recipesTotal }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 lg:rounded-[2.5rem] lg:p-8">
      <h2 className="mb-6 text-lg font-extrabold text-slate-900">
        Order Summary
      </h2>
      <div className="mb-6 space-y-4">
        <SummaryRows herbs={herbs} recipes={recipes} />
        <TotalsBlock herbsTotal={herbsTotal} recipesTotal={recipesTotal} />
      </div>
    </div>
  );
}

export default OrderSummaryCard;
