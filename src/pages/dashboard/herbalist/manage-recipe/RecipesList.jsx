import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { FaLeaf, FaPlus } from "react-icons/fa";

export default function RecipesList({
  filteredRecipes,
  showCreateForm,
  setShowCreateForm,
  populateFormForEdit,
  handleToggleAvailability,
  isDeleting,
}) {
  return (
    <div className="space-y-6">
      <AnimatePresence mode="popLayout">
        {!filteredRecipes.length ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-[2.5rem] border-2 border-dashed border-slate-200 bg-white p-20 text-center flex flex-col items-center justify-center"
          >
            <div className="h-24 w-24 rounded-3xl bg-slate-50 flex items-center justify-center mb-6 rotate-3">
              <FaLeaf className="h-10 w-10 text-slate-200" />
            </div>
            <h3 className="text-2xl font-black text-slate-900">
              {showCreateForm
                ? "No matching recipes found"
                : "Your recipe book is empty"}
            </h3>
            <p className="text-slate-500 font-medium max-w-sm mt-3 mb-8">
              {showCreateForm
                ? "Try adjusting your search terms to find what you're looking for."
                : "Start growing your professional catalog by creating your first custom herbal recipe."}
            </p>
            {!showCreateForm && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="inline-flex items-center gap-3 rounded-2xl bg-slate-900 px-8 py-4 text-sm font-black text-white shadow-xl shadow-slate-900/10 hover:-translate-y-1 transition-all"
              >
                <FaPlus /> Define New Recipe
              </button>
            )}
          </motion.div>
        ) : (
          <motion.div
            layout
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {filteredRecipes.map((recipe) => (
              <motion.div
                key={recipe.recipeId}
                layout
                className="group rounded-[2rem] border border-slate-200 bg-white shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 hover:border-primary/30 transition-all duration-500 overflow-hidden flex flex-col"
              >
                <div className="p-8 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-6">
                    <div className="h-12 w-12 bg-emerald-50 text-emerald-600 rounded-[1rem] flex items-center justify-center text-lg shadow-inner group-hover:bg-emerald-600 group-hover:text-white transition-all duration-500">
                      <FaLeaf />
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none mb-1">
                        Price Point
                      </p>
                      <p className="text-xl font-black text-slate-900">
                        <span className="text-xs text-slate-400 mr-0.5 font-bold">
                          EGP
                        </span>
                        {recipe.price || 0}
                      </p>
                    </div>
                  </div>

                  <h3 className="font-black text-xl text-slate-900 line-clamp-2 mb-3 leading-tight group-hover:text-primary transition-colors">
                    {recipe.description}
                  </h3>
                  <p className="text-sm font-medium text-slate-500 line-clamp-3 mb-8 flex-1 leading-relaxed">
                    {recipe.instructions}
                  </p>

                  <div className="space-y-4">
                    <div className="h-px bg-slate-100" />
                    <div className="flex flex-wrap gap-1.5">
                      {recipe.herbs?.slice(0, 4).map((herb, idx) => (
                        <span
                          key={idx}
                          className="inline-flex px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-100 text-[10px] font-black text-slate-500 uppercase tracking-tighter"
                        >
                          {herb.herbName}
                        </span>
                      ))}
                      {recipe.herbs?.length > 4 && (
                        <span className="inline-flex px-2 py-1.5 text-[10px] font-black text-primary bg-primary/5 rounded-lg">
                          +{recipe.herbs.length - 4}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50/50 backdrop-blur-sm border-t border-slate-100 p-6 flex gap-3 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                  <button
                    type="button"
                    onClick={() => populateFormForEdit(recipe)}
                    className="flex-1 inline-flex justify-center items-center gap-2 rounded-xl bg-white border border-slate-200 px-4 py-3 text-xs font-black text-slate-700 shadow-sm hover:border-primary hover:text-primary transition-all active:scale-95"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleAvailability(recipe)}
                    disabled={isDeleting}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-black text-sm transition-colors disabled:opacity-50 ${recipe.isActive === false ? "border border-emerald-100 bg-emerald-50 text-emerald-700 hover:bg-emerald-100" : "border border-rose-100 bg-rose-50 text-rose-700 hover:bg-rose-100"}`}
                    title={
                      recipe.isActive === false
                        ? "Activate Recipe"
                        : "Deactivate Recipe"
                    }
                  >
                    {recipe.isActive === false ? (
                      <>
                        <span className="text-xs">Activate</span>
                      </>
                    ) : (
                      <>
                        <span className="text-xs">Deactivate</span>
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
