import { useNavigate } from "react-router-dom";
import { motion as Motion } from "motion/react";

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

function HerbCard({ herb }) {
  const navigate = useNavigate();

  return (
    <Motion.button
      variants={itemVariants}
      whileHover={{ y: -4 }}
      type="button"
      onClick={() => navigate(`/patient/home/herbs/${herb.herbId}`)}
      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white text-left h-full w-full transition-all duration-250 hover:-translate-y-1 hover:shadow-xl cursor-pointer"
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
        <span
          className={`absolute top-3 right-3 text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
            herb.isApproved
              ? "bg-[#EAF3DE] text-[#27500A] border-[#97C459]"
              : "bg-[#FAEEDA] text-[#633806] border-[#EF9F27]"
          }`}
        >
          {herb.isApproved ? "Approved" : "Pending"}
        </span>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        {/* Name */}
        <div>
          <h3
            className="text-[17px] font-medium text-slate-900 leading-snug"
            style={{ fontFamily: "'Lora', serif" }}
          >
            {herb.herbName}
          </h3>
          <p
            className="mt-0.5 text-[11px] italic text-slate-400"
            style={{ fontFamily: "'Lora', serif" }}
          >
            {herb.scientificName}
          </p>
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
          <p className="text-sm text-slate-600 line-clamp-2 mt-2">
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
            onClick={(e) => e.stopPropagation()}
            className="w-8 h-8 rounded-lg border border-slate-100 bg-slate-50 flex items-center justify-center hover:bg-slate-100 transition-colors"
            aria-label="Save herb"
          >
            <HeartIcon />
          </button>
        </div>
      </div>
    </Motion.button>
  );
}

function HeartIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path
        d="M7 12L2 7.5C1 6.5 1 4.5 2.5 3.5C4 2.5 5.5 3 7 5C8.5 3 10 2.5 11.5 3.5C13 4.5 13 6.5 12 7.5L7 12Z"
        stroke="currentColor"
        strokeWidth="1.2"
      />
    </svg>
  );
}

export default HerbCard;
