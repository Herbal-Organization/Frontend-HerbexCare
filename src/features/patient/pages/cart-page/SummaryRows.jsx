import { formatCurrency, getHerbTotal, getRecipeTotal } from "./cartUtils";

function SummaryRows({ herbs, recipes, aiRecipes }) {
  return (
    <div className="space-y-4 rounded-3xl bg-slate-50/70 dark:bg-slate-900/50 p-4">
      {herbs.length > 0 && (
        <div className="border-b border-slate-100 dark:border-slate-700 pb-4">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
            Herbs ({herbs.length})
          </p>
          <div className="space-y-2 text-sm">
            {herbs.map((herb, index) => (
              <div
                key={`summary-${herb.herbId ?? index}`}
                className="flex flex-col gap-1 text-slate-700 dark:text-slate-300 sm:flex-row sm:items-center sm:justify-between sm:gap-3"
              >
                <span className="min-w-0 max-w-full truncate font-medium sm:max-w-[70%]">
                  {herb._previewName} ({herb.quantityPerGram}g)
                </span>
                <span className="whitespace-nowrap font-bold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(getHerbTotal(herb))}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {recipes.length > 0 && (
        <div className="border-b border-slate-100 dark:border-slate-700 pb-4">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
            Recipes ({recipes.length})
          </p>
          <div className="space-y-2 text-sm">
            {recipes.map((recipe, index) => (
              <div
                key={`recipe-summary-${recipe.recipeId ?? index}`}
                className="flex flex-col gap-1 text-slate-700 dark:text-slate-300 sm:flex-row sm:items-center sm:justify-between sm:gap-3"
              >
                <span className="min-w-0 max-w-full truncate font-medium sm:max-w-[70%]">
                  {recipe._previewName} (x{recipe.quantity})
                </span>
                <span className="whitespace-nowrap font-bold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(getRecipeTotal(recipe))}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {aiRecipes.length > 0 && (
        <div className="border-b border-slate-100 dark:border-slate-700 pb-4">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
            AI Recipes ({aiRecipes.length})
          </p>
          <div className="space-y-2 text-sm">
            {aiRecipes.map((item, index) => (
              <div
                key={`ai-summary-${item.aiRecipeId}-${item.herbalistId ?? index}`}
                className="flex flex-col gap-1 text-slate-700 dark:text-slate-300 sm:flex-row sm:items-center sm:justify-between sm:gap-3"
              >
                <span className="min-w-0 max-w-full truncate font-medium sm:max-w-[70%]">
                  {item._previewName} (x{item.quantity})
                </span>
                <span className="whitespace-nowrap font-bold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(getRecipeTotal(item))}
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
