import HerbCartItem from "./HerbCartItem";
import RecipeCartItem from "./RecipeCartItem";

function CartItemsCard({
  herbs,
  recipes,
  aiRecipes,
  onRemoveHerb,
  onUpdateHerb,
  onRemoveRecipe,
  onUpdateRecipe,
  onRemoveAiRecipe,
  onUpdateAiRecipe,
}) {
  return (
    <div className="overflow-hidden rounded-4xl border border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-800/95 p-4 shadow-sm backdrop-blur sm:p-6 lg:rounded-[2.5rem] lg:p-8">
      <div className="mb-6 flex items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-700 pb-4">
        <h2 className="text-lg font-extrabold text-slate-900 dark:text-slate-100 sm:text-xl">
          Cart Items
        </h2>
        <span className="rounded-full bg-slate-100 dark:bg-slate-900 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Review before checkout
        </span>
      </div>

      {herbs.length > 0 && (
        <div className="mb-8">
          <h3 className="mb-4 border-b border-slate-100 dark:border-slate-700 pb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
            Custom Herb Sourcing
          </h3>
          <div className="space-y-4">
            {herbs.map((herb, index) => (
              <HerbCartItem
                key={`herb-${herb.herbId}-${herb.herbalistId ?? index}`}
                herb={herb}
                onDecrease={() =>
                  onUpdateHerb(
                    herb.herbId,
                    herb.herbalistId,
                    Math.max(1, herb.quantityPerGram - 1),
                  )
                }
                onIncrease={() =>
                  onUpdateHerb(
                    herb.herbId,
                    herb.herbalistId,
                    herb.quantityPerGram + 1,
                  )
                }
                onRemove={() => onRemoveHerb(herb.herbId, herb.herbalistId)}
              />
            ))}
          </div>
        </div>
      )}

      {recipes.length > 0 && (
        <div className="mb-2">
          <h3 className="mb-4 border-b border-slate-100 dark:border-slate-700 pb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
            Compound Prescriptions
          </h3>
          <div className="space-y-4">
            {recipes.map((recipe, index) => (
              <RecipeCartItem
                key={`rec-${recipe.recipeId ?? index}`}
                recipe={recipe}
                onDecrease={() =>
                  onUpdateRecipe(
                    recipe.recipeId,
                    Math.max(0, recipe.quantity - 1),
                  )
                }
                onIncrease={() =>
                  onUpdateRecipe(recipe.recipeId, recipe.quantity + 1)
                }
                onRemove={() => onRemoveRecipe(recipe.recipeId)}
              />
            ))}
          </div>
        </div>
      )}

      {aiRecipes.length > 0 && (
        <div className="mb-2">
          <h3 className="mb-4 border-b border-slate-100 dark:border-slate-700 pb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
            AI Prescriptions
          </h3>
          <div className="space-y-4">
            {aiRecipes.map((item, index) => (
              <RecipeCartItem
                key={`ai-rec-${item.aiRecipeId}-${item.herbalistId ?? index}`}
                recipe={item}
                onDecrease={() =>
                  onUpdateAiRecipe(
                    item.aiRecipeId,
                    item.herbalistId,
                    Math.max(0, item.quantity - 1),
                  )
                }
                onIncrease={() =>
                  onUpdateAiRecipe(
                    item.aiRecipeId,
                    item.herbalistId,
                    item.quantity + 1,
                  )
                }
                onRemove={() =>
                  onRemoveAiRecipe(item.aiRecipeId, item.herbalistId)
                }
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default CartItemsCard;
