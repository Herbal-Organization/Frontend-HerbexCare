import { FaHeart, FaStar } from "react-icons/fa";
import { MdVerified } from "react-icons/md";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { type: "spring", stiffness: 300, damping: 24 } 
  },
};

function RecipeCard({
  id,
  recipeId,
  title,
  description,
  herbs,
  targetedDiseases,
  createdByAI,
  createdDate,
  averageRating,
  price,
}) {
  const navigate = useNavigate();
  const navigationId = id || recipeId;

  return (
    <motion.button
      variants={itemVariants}
      whileHover={{ y: -8 }}
      type="button"
      onClick={() => navigate(`/patient/home/recipes/${navigationId}`)}
      className="group flex flex-col overflow-hidden rounded-[2.5rem] border border-slate-100 bg-white text-left shadow-sm hover:shadow-xl transition-shadow duration-300 h-full w-full"
    >
      <div className="relative flex min-h-[160px] flex-col justify-between overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.2),_transparent_40%),linear-gradient(135deg,_#f1fdf6_0%,_#ffffff_60%,_#f8fafc_100%)] p-6">
        <div className="flex items-start justify-between gap-3 relative z-10">
          <div className="flex flex-wrap gap-2">
            <div className="rounded-full bg-slate-900/90 backdrop-blur-md px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-widest text-white shadow-sm border border-slate-700">
              {createdDate || "Recent"}
            </div>
          </div>

          <span
            type="button"
            className="rounded-full bg-white/80 backdrop-blur p-2.5 text-slate-400 shadow-sm transition-colors hover:text-red-500 hover:bg-white"
          >
            <FaHeart className="text-sm" />
          </span>
        </div>

        <div className="mt-8 relative z-10">
           {createdByAI ? (
            <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.2em] text-emerald-700">
              <MdVerified className="text-sm" />
              <span>AI Curation</span>
            </div>
           ) : null}
          <h3 className="text-2xl font-extrabold text-slate-900 transition-colors group-hover:text-emerald-700 leading-tight">
            {title}
          </h3>
        </div>
      </div>

      <div className="flex-1 flex flex-col p-6 w-full">
        <p className="line-clamp-2 text-sm leading-relaxed font-medium text-slate-600 mb-5">
          {description}
        </p>

        <div className="flex flex-wrap gap-2 mb-5">
          {herbs?.length ? (
            herbs.slice(0, 3).map((herb) => (
              <span
                key={`${herb.herbId}-${herb.herbName}`}
                className="rounded-full bg-emerald-50 border border-emerald-100 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-emerald-700 shadow-sm"
              >
                {herb.herbName}
              </span>
            ))
          ) : (
             <span className="rounded-full bg-slate-50 border border-slate-100 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-500 shadow-sm">
                Custom Blend
             </span>
          )}
          {herbs?.length > 3 && (
            <span className="rounded-full bg-slate-50 border border-slate-100 px-2 py-1 text-[11px] font-bold text-slate-500">
              +{herbs.length - 3}
            </span>
          )}
        </div>

        <div className="mt-auto pt-5 border-t border-slate-100 flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
             <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-1">
               Targets
             </p>
             <p className="text-xs font-bold text-slate-800 truncate">
                {targetedDiseases?.length
                  ? targetedDiseases.map((d) => d.diseaseName).join(", ")
                  : "General Wellness"}
             </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 border border-emerald-100 shadow-sm">
               <span className="text-xs font-extrabold text-emerald-700">
                 {price ? `$${Number(price).toFixed(2)}` : "Free"}
               </span>
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5">
               <FaStar className="text-amber-500 text-xs" />
               <span className="text-xs font-extrabold text-amber-700">
                 {averageRating != null ? Number(averageRating).toFixed(1) : "New"}
               </span>
            </div>
          </div>
        </div>
      </div>
    </motion.button>
  );
}

export default RecipeCard;
