import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion as Motion } from "motion/react";
import { getHerbWithHerbalist } from "@api/herbs";
import { FaHeart, FaRegHeart } from "react-icons/fa";

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
};

// These would come from your herb data model
// herb.commonUses: string[]       e.g. ["Inflammation", "Joint pain"]
// herb.dosage: string             e.g. "500–2,000 mg/day with food"
// herb.forms: string[]            e.g. ["Capsule", "Powder", "Tea"]
// herb.caution: string            e.g. "May interact with blood thinners"

function HerbCard({
  herb,
  isFavorite = false,
  onToggleFavorite,
  isFavoriteUpdating = false,
}) {
  const navigate = useNavigate();
  const [herbalistName, setHerbalistName] = useState(null);

  useEffect(() => {
    if (herb?.herbId) {
      getHerbWithHerbalist(herb.herbId)
        .then((data) => {
          if (data && data.herbalistName) {
            setHerbalistName(data.herbalistName);
          }
        })
        .catch((err) => console.error("Failed to fetch herbalist info", err));
    }
  }, [herb?.herbId]);

  const handleToggleFavorite = (e) => {
    e.stopPropagation();
    if (!onToggleFavorite || isFavoriteUpdating) return;
    onToggleFavorite(herb.herbId);
  };

  return (
    <Motion.button
      variants={itemVariants}
      whileHover={{ y: -4 }}
      type="button"
      onClick={() => navigate(`/patient/home/herbs/${herb.herbId}`)}
      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white text-start h-full w-full transition-all duration-250 hover:-translate-y-1 hover:shadow-xl cursor-pointer"
    >
      {/* Image / Placeholder */}
      <div className="relative">
        {herb.imageURL ? (
          <img
            src={herb.imageURL}
            alt={herb.herbName}
            className="w-full h-40 object-cover block"
          />
        ) : (
          <div className="w-full h-40 bg-[#EAF3DE] flex items-center justify-center">
            <svg
              width="48"
              height="64"
              viewBox="0 0 48 64"
              fill="none"
              className="opacity-25"
            >
              <path
                d="M24 2C36 14 40 36 24 62C8 36 12 14 24 2Z"
                fill="#639922"
              />
              <line
                x1="24"
                y1="2"
                x2="24"
                y2="62"
                stroke="#639922"
                strokeWidth="1.5"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        {/* Name */}
        <div>
          <h3
            className="text-lg font-semibold text-slate-900 leading-snug"
            style={{ fontFamily: "'Lora', serif" }}
          >
            {herb.herbName}
          </h3>
          <p
            className="mt-1 text-xs italic text-slate-500"
            style={{ fontFamily: "'Lora', serif" }}
          >
            <span className="font-semibold not-italic text-slate-700">
              Scientific Name:
            </span>{" "}
            {herb.scientificName}
          </p>
          {herbalistName && (
            <p className="mt-1.5 text-xs font-medium text-slate-500">
              <span className="text-slate-400">By:</span> {herbalistName}
            </p>
          )}
        </div>

        {/* Use tags */}
        {herb.commonUses?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {herb.commonUses.slice(0, 3).map((use) => (
              <span
                key={use}
                className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-[#EAF3DE] text-[#3B6D11] border border-[#C0DD97]"
              >
                {use}
              </span>
            ))}
          </div>
        )}

        {/* Short description if available */}
        {herb.description && (
          <p className="text-sm text-slate-600 leading-relaxed line-clamp-3 mt-2">
            <span className="font-semibold text-slate-700">Description:</span>{" "}
            {herb.description}
          </p>
        )}

        {/* Footer */}
        <div className="mt-auto pt-3 flex items-center justify-between">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/patient/home/herbs/${herb.herbId}`);
            }}
            className="text-xs font-medium text-[#3B6D11] bg-[#EAF3DE] border border-[#C0DD97] rounded-lg px-3.5 py-1.5 hover:bg-[#C0DD97] transition-colors cursor-pointer"
          >
            Full details →
          </button>
          <button
            type="button"
            onClick={handleToggleFavorite}
            disabled={isFavoriteUpdating}
            className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-colors ${
              isFavorite
                ? "border-rose-200 bg-rose-50 text-rose-600"
                : "border-slate-100 bg-slate-50 text-slate-500 hover:bg-slate-100"
            } ${isFavoriteUpdating ? "opacity-60 cursor-not-allowed" : ""}`}
            aria-label={isFavorite ? "Unfavorite herb" : "Favorite herb"}
          >
            {isFavorite ? (
              <FaHeart className="text-sm" />
            ) : (
              <FaRegHeart className="text-sm" />
            )}
          </button>
        </div>
      </div>
    </Motion.button>
  );
}

export default HerbCard;
