import { useState } from "react";
import { FaHeart, FaRegHeart, FaStar } from "react-icons/fa";
import { motion as Motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import useDiseases from "@hooks/useDiseases";
import DiseaseDetailsModal from "./DiseaseDetailsModal";

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 320, damping: 26 },
  },
};

function RecipeCard({
  id,
  recipeId,
  title,
  targetedDiseases,
  createdDate,
  averageRating,
  price,
  isFavorite = false,
  onToggleFavorite,
  isFavoriteUpdating = false,
}) {
  const navigate = useNavigate();
  const { diseases } = useDiseases();
  const [selectedDisease, setSelectedDisease] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDiseaseClick = (e, diseaseId) => {
    e.stopPropagation();
    if (!Array.isArray(diseases)) {
      toast.error("Disease data is not available yet.");
      return;
    }
    const fullDisease = diseases.find((d) => d.diseaseId == diseaseId);
    if (fullDisease) {
      setSelectedDisease(fullDisease);
      setIsModalOpen(true);
    } else {
      toast.error("Disease details not found.");
    }
  };

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    if (!onToggleFavorite || isFavoriteUpdating) return;
    onToggleFavorite(id || recipeId);
  };

  return (
    <Motion.div
      variants={itemVariants}
      whileHover={{ y: -6 }}
      onClick={() => navigate(`/patient/home/recipes/${id || recipeId}`)}
      className="group flex h-full w-full cursor-pointer flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm transition-all duration-300 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-500/10"
    >
      <div className="border-b border-emerald-100/80 bg-linear-to-br from-emerald-600 to-teal-700 p-5 text-white">
        <div className="mb-3 flex items-center justify-between gap-2">
          <span className="rounded-full border border-white/20 bg-white/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-emerald-50 backdrop-blur-sm">
            {createdDate || "Recipe"}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-amber-200/30 bg-amber-400/20 px-2.5 py-1 text-[11px] font-bold text-amber-50">
            <FaStar className="text-[10px] text-amber-200" />
            {averageRating != null ? Number(averageRating).toFixed(1) : "New"}
          </span>
        </div>
        <h3 className="text-lg font-bold leading-snug text-white line-clamp-2">
          {title}
        </h3>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-4">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-emerald-700">
            Targets
          </p>
          <div className="flex flex-wrap gap-1.5">
            {targetedDiseases?.length ? (
              targetedDiseases.map((disease) => (
                <button
                  key={disease.diseaseId}
                  type="button"
                  onClick={(e) => handleDiseaseClick(e, disease.diseaseId)}
                  className="relative z-10 whitespace-nowrap rounded-full border border-sky-100 bg-sky-50 px-2.5 py-0.5 text-[10px] font-bold text-sky-800 transition-all hover:border-sky-200 hover:bg-sky-100 active:scale-95"
                  title="View condition details"
                >
                  {disease.diseaseName}
                </button>
              ))
            ) : (
              <span className="text-[10px] italic text-slate-400">
                General wellness
              </span>
            )}
          </div>
        </div>

        <div className="mt-auto flex items-end justify-between gap-3 border-t border-slate-100 pt-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Price
            </span>
            <p className="text-xl font-black tabular-nums text-emerald-600">
              {Number(price || 0).toLocaleString()}{" "}
              <span className="text-sm font-bold text-slate-500">EGP</span>
            </p>
          </div>

          <button
            type="button"
            onClick={handleFavoriteClick}
            disabled={isFavoriteUpdating}
            className={`flex h-10 w-10 items-center justify-center rounded-xl border transition-all ${
              isFavorite
                ? "border-rose-200 bg-rose-50 text-rose-600"
                : "border-emerald-100 bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white"
            } ${isFavoriteUpdating ? "cursor-not-allowed opacity-60" : ""}`}
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            {isFavorite ? (
              <FaHeart className="text-sm" />
            ) : (
              <FaRegHeart className="text-sm" />
            )}
          </button>
        </div>
      </div>

      <DiseaseDetailsModal
        disease={selectedDisease}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </Motion.div>
  );
}

export default RecipeCard;
