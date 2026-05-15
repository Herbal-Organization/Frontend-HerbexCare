import { FaHeart, FaStar } from "react-icons/fa";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";

const HERO_THEMES = [
  {
    bg: "#1a2e1a",
    orb: "rgba(100,160,60,0.22)",
    accentText: "#a8d878",
    accentBg: "rgba(130,200,80,0.12)",
    accentBorder: "rgba(130,200,80,0.25)",
  },
];

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
};

function RecipeCard({
  id,
  recipeId,
  title, // This is JSON 'description' from normalizeRecipe
  herbs,
  targetedDiseases,
  createdDate,
  averageRating,
  price,
}) {
  const navigate = useNavigate();
  const theme = HERO_THEMES[0];

  return (
    <motion.button
      variants={itemVariants}
      whileHover={{ y: -6 }}
      type="button"
      onClick={() => navigate(`/patient/home/recipes/${id || recipeId}`)}
      className="group flex flex-col overflow-hidden rounded-[20px] border border-slate-200 bg-white text-start h-full w-full transition-all duration-300 hover:shadow-xl hover:border-emerald-200"
    >
      {/* Hero Header */}
      <div className="relative p-5 bg-slate-50 border-b border-slate-100">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-white px-2 py-0.5 rounded border border-slate-200">
            {createdDate || "Recent"}
          </span>
          <span className="flex items-center gap-1 rounded-full border border-amber-100 bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700 shadow-sm">
            <FaStar className="text-amber-400 text-[10px]" />
            {averageRating != null ? Number(averageRating).toFixed(1) : "New"}
          </span>
        </div>

        <h3 className="text-lg font-bold text-slate-900 leading-snug group-hover:text-emerald-700 transition-colors">
          {title}
        </h3>
      </div>

      {/* Card Body */}
      <div className="flex flex-1 flex-col p-5">
        {/* Targets Section with badges */}
        <div className="mb-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 mb-2">
            Target Diseases:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {targetedDiseases?.length ? (
              targetedDiseases.map((disease) => (
                <span
                  key={disease.diseaseId}
                  className="rounded-full border border-sky-100 bg-sky-50 px-2 py-0.5 text-[10px] font-bold text-sky-700 whitespace-nowrap"
                >
                  {disease.diseaseName}
                </span>
              ))
            ) : (
              <span className="text-[10px] text-slate-400 italic">
                General Wellness
              </span>
            )}
          </div>
        </div>

        {/* Price Section */}
        <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
              Total Price
            </span>
            <span className="text-xl font-black text-emerald-600">
              ${Number(price || 0).toFixed(0)}
            </span>
          </div>
          
          <div className="h-8 w-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
            <FaHeart className="text-sm" />
          </div>
        </div>
      </div>
    </motion.button>
  );
}

export default RecipeCard;
