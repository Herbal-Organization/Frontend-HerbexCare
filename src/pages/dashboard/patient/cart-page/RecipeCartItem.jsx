import { FaTrash } from "react-icons/fa";
import { formatCurrency, getRecipeTotal } from "./cartUtils";

function RecipeCartItem({ recipe, onDecrease, onIncrease, onRemove }) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 flex-1">
        <p className="truncate font-bold text-emerald-900">
          {recipe._previewName}
        </p>
        <p className="mt-1 text-xs text-emerald-700">
          {formatCurrency(Number(recipe.unitPrice ?? recipe.price ?? 0))} each
        </p>
        <p className="mt-1 text-xs font-semibold text-emerald-800">
          Total: {formatCurrency(getRecipeTotal(recipe))}
        </p>
      </div>

      <div className="flex items-center justify-between gap-4 sm:justify-end">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onDecrease}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 font-bold text-emerald-700 hover:bg-emerald-100"
          >
            -
          </button>
          <div className="w-8 text-center">
            <p className="font-extrabold text-emerald-900">{recipe.quantity}</p>
          </div>
          <button
            type="button"
            onClick={onIncrease}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 font-bold text-emerald-700 hover:bg-emerald-100"
          >
            +
          </button>
        </div>

        <button
          type="button"
          onClick={onRemove}
          className="rounded-full p-2 text-emerald-700/50 shadow-sm transition-all hover:bg-white hover:text-emerald-700"
          title="Remove completely"
        >
          <FaTrash />
        </button>
      </div>
    </div>
  );
}

export default RecipeCartItem;
