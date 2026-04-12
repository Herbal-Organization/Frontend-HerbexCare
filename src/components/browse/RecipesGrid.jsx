import { motion } from "motion/react";
import RecipeCard from "./RecipeCard";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

function RecipesGrid({ recipes, isLoading, error, onRetry }) {
  if (isLoading) {
    return (
      <div className="rounded-[2.5rem] border border-slate-200 bg-white p-16 text-center shadow-sm max-w-2xl mx-auto mt-12">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-emerald-500" />
        <p className="mt-6 text-sm font-bold text-slate-500 uppercase tracking-widest">
          Loading recipes database...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[2.5rem] border border-red-100 bg-red-50 p-16 text-center shadow-sm max-w-2xl mx-auto mt-12">
        <h3 className="text-xl font-extrabold text-red-800">Unable to load recipes</h3>
        <p className="mt-3 text-sm font-medium text-red-600">{error}</p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-8 rounded-full bg-red-600 px-8 py-3 text-sm font-bold text-white hover:bg-red-700 hover:shadow-lg transition-all"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!recipes.length) {
    return (
      <div className="rounded-[2.5rem] border border-slate-200 bg-white p-16 text-center shadow-sm max-w-2xl mx-auto mt-12">
        <div className="text-6xl mb-6">🍵</div>
        <h3 className="text-2xl font-bold text-slate-900">No recipes found</h3>
        <p className="mt-3 text-slate-500 font-medium">
          Try a different search term or check back later for new herbal recipes.
        </p>
      </div>
    );
  }

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 px-4 pb-12"
    >
      {recipes.map((recipe) => (
        <RecipeCard key={recipe.id || recipe.recipeId} {...recipe} />
      ))}
    </motion.div>
  );
}

export default RecipesGrid;
