import { formatCurrency, getHerbTotal, getRecipeTotal } from "./cartUtils";

function SummaryRows({ herbs, recipes }) {
  return (
    <div className="space-y-4">
      {herbs.length > 0 && (
        <div className="border-b border-slate-100 pb-4">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">
            Herbs ({herbs.length})
          </p>
          <div className="space-y-2 text-sm">
            {herbs.map((herb, index) => (
              <div
                key={`summary-${herb.herbId ?? index}`}
                className="flex justify-between gap-2 text-slate-700"
              >
                <span className="max-w-[70%] truncate font-medium">
                  {herb._previewName} ({herb.quantityPerGram}g)
                </span>
                <span className="whitespace-nowrap font-bold text-emerald-600">
                  {formatCurrency(getHerbTotal(herb))}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {recipes.length > 0 && (
        <div className="border-b border-slate-100 pb-4">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">
            Recipes ({recipes.length})
          </p>
          <div className="space-y-2 text-sm">
            {recipes.map((recipe, index) => (
              <div
                key={`recipe-summary-${recipe.recipeId ?? index}`}
                className="flex justify-between gap-2 text-slate-700"
              >
                <span className="max-w-[70%] truncate font-medium">
                  {recipe._previewName} (x{recipe.quantity})
                </span>
                <span className="whitespace-nowrap font-bold text-emerald-600">
                  {formatCurrency(getRecipeTotal(recipe))}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default SummaryRows;
