import { useState } from "react";
import { FaHeart, FaRegHeart, FaStar } from "react-icons/fa";
import { motion as Motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import useDiseases from "@hooks/useDiseases";
import DiseaseDetailsModal from "./DiseaseDetailsModal";

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
    e.stopPropagation(); // Prevent navigating to recipe details
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
      className="group flex flex-col overflow-hidden rounded-[20px] border border-slate-200 bg-white text-start h-full w-full transition-all duration-300 hover:shadow-xl hover:border-emerald-200 cursor-pointer"
    >
      {/* Hero Header */}
      <div className="relative p-5 bg-slate-50 border-b border-slate-100">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-white px-2 py-0.5 rounded border border-slate-200">
            {createdDate || "Recent"}
          </span>
          <div className="flex items-center gap-1.5">
            <span className="flex items-center gap-1 rounded-full border border-amber-100 bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700 shadow-sm">
              <FaStar className="text-amber-400 text-[10px]" />
              {averageRating != null ? Number(averageRating).toFixed(1) : "New"}
            </span>
          </div>
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
                <button
                  key={disease.diseaseId}
                  type="button"
                  onClick={(e) => handleDiseaseClick(e, disease.diseaseId)}
                  className="rounded-full border border-sky-100 bg-sky-50 px-2 py-0.5 text-[10px] font-bold text-sky-700 whitespace-nowrap hover:bg-sky-100 hover:border-sky-200 transition-all active:scale-95 z-20 relative"
                  title="Click for details"
                >
                  {disease.diseaseName}
                </button>
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

          <button
            type="button"
            onClick={handleFavoriteClick}
            disabled={isFavoriteUpdating}
            className={`h-8 w-8 rounded-full border flex items-center justify-center transition-all duration-300 ${
              isFavorite
                ? "border-rose-200 bg-rose-50 text-rose-600"
                : "border-emerald-100 bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white"
            } ${isFavoriteUpdating ? "opacity-60 cursor-not-allowed" : ""}`}
            aria-label={isFavorite ? "Unfavorite recipe" : "Favorite recipe"}
            title={isFavorite ? "Unfavorite" : "Favorite"}
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
