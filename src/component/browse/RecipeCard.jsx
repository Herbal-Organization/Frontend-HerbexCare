import React from "react";
import { FaHeart, FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";
import { MdVerified } from "react-icons/md";

function renderStars(rating, total = 5) {
  const full = Math.floor(rating);
  const hasHalf = rating - full >= 0.5;
  const empty = total - full - (hasHalf ? 1 : 0);

  return (
    <>
      {Array.from({ length: full }).map((_, index) => (
        <FaStar
          key={`full-${index}`}
          className="text-yellow-400 text-sm"
        />
      ))}
      {hasHalf && <FaStarHalfAlt className="text-yellow-400 text-sm" />}
      {Array.from({ length: empty }).map((_, index) => (
        <FaRegStar
          key={`empty-${index}`}
          className="text-slate-300 text-sm"
        />
      ))}
    </>
  );
}

function RecipeCard({
  image,
  title,
  description,
  rating,
  reviews,
  time,
  level,
  featured,
}) {
  return (
    <div className="group bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition-all">
      <div className="relative aspect-video overflow-hidden">
        <img
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          src={image}
          alt={title}
        />
        {featured && (
          <div className="absolute top-3 left-3 bg-primary text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full flex items-center gap-1">
            <MdVerified className="text-xs" />
            <span>Success</span>
          </div>
        )}
        <button className="absolute top-3 right-3 p-1.5 bg-white/90 backdrop-blur rounded-full text-slate-600hover:text-red-500 transition-colors">
          <FaHeart className="text-xl" />
        </button>
      </div>
      <div className="p-5">
        <div className="flex items-center gap-1 mb-2">
          {renderStars(rating)}
          <span className="text-xs text-slate-500 ml-1">
            ({reviews})
          </span>
        </div>
        <h3 className="text-lg font-bold text-slate-900group-hover:text-primary transition-colors">
          {title}
        </h3>
        <p className="text-sm text-slate-600 mt-2 line-clamp-2">
          {description}
        </p>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded">
            {time}
          </span>
          <span className="text-xs font-medium text-slate-500">
            {level}
          </span>
        </div>
      </div>
    </div>
  );
}

export default RecipeCard;

