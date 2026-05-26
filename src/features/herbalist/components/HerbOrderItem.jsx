import React, { useState } from "react";
import { API_BASE_URL } from "@api/config";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

const formatCurrency = (value) => `${Number(value || 0).toFixed(2)} EGP`;

const HerbOrderItem = ({ item }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const imageSrc = item.imageURL?.startsWith("http")
    ? item.imageURL
    : `${API_BASE_URL}/${item.imageURL}`;

  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50">
      <div
        className="grid cursor-pointer grid-cols-[auto_1fr_auto] items-center gap-3 p-4"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <img
          src={imageSrc}
          alt={item.herbName}
          className="h-12 w-12 rounded-lg object-cover"
        />
        <div className="flex-1">
          <p className="font-bold text-slate-900">{item.herbName}</p>
          <p className="text-sm font-semibold text-slate-500">
            {item.scientificName}
          </p>
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
          <InfoRow label="Benefits" value={item.benefits} />
          <InfoRow label="Dosage" value={item.dosage} />
          <InfoRow label="Warnings" value={item.warnings} />
          <div className="mt-4 flex justify-end gap-4 text-sm">
            <p className="font-bold text-slate-700">{item.quantityPerGram}g</p>
            <p className="font-bold text-slate-700">
              {formatCurrency(item.unitPricePerKilo)}/kg
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

const InfoRow = ({ label, value }) => (
  <div>
    <p className="text-xs font-bold uppercase text-slate-400">{label}</p>
    <p className="text-sm text-slate-700">{value}</p>
  </div>
);

export default HerbOrderItem;
