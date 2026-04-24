import { motion } from "motion/react";
import RecipeCard from "./RecipeCard";
import Skeleton from "react-loading-skeleton";

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
      <div className="grid grid-cols-1 gap-8 px-4 pb-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={`recipe-skeleton-${index}`}
            className="overflow-hidden rounded-[20px] border border-black/8 bg-[#faf9f6]"
          >
            <div className="p-6" style={{ background: "#1a2e1a" }}>
              <Skeleton
                height={18}
                width="42%"
                baseColor="#243b24"
                highlightColor="#355735"
              />
              <div className="mt-6">
                <Skeleton
                  height={28}
                  width="85%"
                  baseColor="#243b24"
                  highlightColor="#355735"
                />
                <Skeleton
                  height={28}
                  width="70%"
                  className="mt-2"
                  baseColor="#243b24"
                  highlightColor="#355735"
                />
              </div>
            </div>
            <div className="p-5">
              <Skeleton count={2} className="mb-3" />
              <div className="flex flex-wrap gap-1.5 mb-4">
                <Skeleton width={74} height={24} borderRadius={9999} />
                <Skeleton width={88} height={24} borderRadius={9999} />
                <Skeleton width={54} height={24} borderRadius={9999} />
              </div>
              <Skeleton height={1} />
              <div className="mt-4 flex items-end justify-between gap-3">
                <div className="w-1/2">
                  <Skeleton width="55%" height={10} />
                  <Skeleton width="90%" height={18} className="mt-2" />
                </div>
                <div className="flex gap-2">
                  <Skeleton width={56} height={28} borderRadius={9999} />
                  <Skeleton width={56} height={28} borderRadius={9999} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[2.5rem] border border-red-100 bg-red-50 p-16 text-center shadow-sm max-w-2xl mx-auto mt-12">
        <h3 className="text-xl font-extrabold text-red-800">
          Unable to load recipes
        </h3>
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
          Try a different search term or check back later for new herbal
          recipes.
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
