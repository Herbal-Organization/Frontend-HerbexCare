import HerbCartItem from "./HerbCartItem";
import RecipeCartItem from "./RecipeCartItem";

function CartItemsCard({
  herbs,
  recipes,
  onRemoveHerb,
  onUpdateHerb,
  onRemoveRecipe,
  onUpdateRecipe,
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 lg:rounded-[2.5rem] lg:p-8">
      <h2 className="mb-6 flex items-center gap-2 text-lg font-extrabold text-slate-900">
        Cart Items
      </h2>

      {herbs.length > 0 && (
        <div className="mb-8">
          <h3 className="mb-4 border-b border-slate-100 pb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
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
          <h3 className="mb-4 border-b border-slate-100 pb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
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
    </div>
  );
}

export default CartItemsCard;
