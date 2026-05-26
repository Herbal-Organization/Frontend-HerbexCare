import React, { useState } from "react";
import {
  FaChevronDown,
  FaChevronUp,
  FaStar,
  FaLeaf,
  FaStethoscope,
} from "react-icons/fa";

const formatCurrency = (value) => `${Number(value || 0).toFixed(2)} EGP`;

const RecipeOrderItem = ({ item }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50">
      <div
        className="grid cursor-pointer grid-cols-[1fr_auto] items-center gap-3 p-4"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex-1">
          <p className="font-bold text-slate-900">{item.recipeName}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="flex items-center text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
              <FaStar className="mr-1" />
              {item.averageRating || 0} ({item.totalRatings || 0} reviews)
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <p className="text-sm font-black text-emerald-700">
            {formatCurrency(item.subTotal)}
          </p>
          <button
            type="button"
            className="text-slate-500 hover:text-emerald-600"
          >
            {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="space-y-4 border-t border-slate-200 p-4">
          <InfoRow label="Description" value={item.description} />
          <InfoRow label="Instructions" value={item.instructions} />

          {item.herbs && item.herbs.length > 0 && (
            <div>
              <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase text-slate-400">
                <FaLeaf /> Herbs Included
              </p>
              <div className="flex flex-wrap gap-2">
                {item.herbs.map((h, i) => (
                  <span
                    key={i}
                    className="rounded-md bg-white border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-600"
                  >
                    {h.herbName} ({h.quantity}g)
                  </span>
                ))}
              </div>
            </div>
          )}

          {item.targetedDiseases && item.targetedDiseases.length > 0 && (
            <div>
              <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase text-slate-400">
                <FaStethoscope /> Targeted Diseases
              </p>
              <div className="flex flex-wrap gap-2">
                {item.targetedDiseases.map((d, i) => (
                  <span
                    key={i}
                    className="rounded-md bg-rose-50 border border-rose-100 px-2 py-1 text-xs font-semibold text-rose-600"
                  >
                    {d.diseaseName}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="mt-4 flex justify-end gap-4 text-sm">
            <p className="font-bold text-slate-700">
              Qty: {item.quantityPerOne}
            </p>
            <p className="font-bold text-slate-700">
              {formatCurrency(item.unitPricePerOne)}/each
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

const InfoRow = ({ label, value }) => {
  if (!value) return null;
  return (
    <div>
      <p className="text-xs font-bold uppercase text-slate-400">{label}</p>
      <p className="text-sm text-slate-700 whitespace-pre-wrap">{value}</p>
    </div>
  );
};

export default RecipeOrderItem;
