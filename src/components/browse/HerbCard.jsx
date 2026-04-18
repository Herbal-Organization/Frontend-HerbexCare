import { FaLeaf } from "react-icons/fa";
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

function HerbCard({ herb }) {
  const navigate = useNavigate();

  return (
    <Motion.button
      variants={itemVariants}
      whileHover={{ y: -8 }}
      type="button"
      onClick={() => navigate(`/patient/home/herbs/${herb.herbId}`)}
      className="group flex flex-col overflow-hidden rounded-4xl border border-slate-100 bg-white text-left shadow-sm hover:shadow-xl transition-shadow duration-300 h-full w-full"
    >
      {herb.imageURL ? (
        <div className="h-48 w-full overflow-hidden bg-slate-100 relative">
          <div className="absolute inset-0 bg-linear-to-t from-slate-900/40 via-transparent to-transparent z-10" />
          <Motion.img
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            src={herb.imageURL}
            alt={herb.herbName}
            className="h-full w-full object-cover"
          />
          <div className="absolute top-4 right-4 z-20">
            <span
              className={`shadow-sm backdrop-blur-md rounded-full px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-widest border ${
                herb.isApproved === true
                  ? "bg-emerald-500/90 text-white border-emerald-400"
                  : "bg-amber-500/90 text-white border-amber-400"
              }`}
            >
              {herb.isApproved === true ? "Approved" : "Pending"}
            </span>
          </div>
        </div>
      ) : (
        <div className="h-48 w-full bg-emerald-50 flex items-center justify-center border-b border-emerald-100 relative overflow-hidden">
          <FaLeaf className="text-6xl text-emerald-200/50 absolute -right-4 -bottom-4" />
          <div className="absolute top-4 right-4 z-20">
            <span
              className={`shadow-sm rounded-full px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-widest ${
                herb.isApproved === true
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-amber-100 text-amber-700"
              }`}
            >
              {herb.isApproved === true ? "Approved" : "Pending"}
            </span>
          </div>
        </div>
      )}

      <div className="p-6 flex-1 flex flex-col w-full">
        <div className="flex items-start gap-4">
          <div className="shrink-0 rounded-2xl bg-emerald-50 p-3.5 text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white transition-colors duration-300">
            <FaLeaf className="text-xl" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-xl font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors truncate">
              {herb.herbName}
            </h3>
            <p className="mt-1 text-sm italic font-medium text-slate-500 truncate">
              {herb.scientificName}
            </p>
          </div>
        </div>

        <div className="mt-6 mb-4">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
            Description
          </p>
          <p className="text-sm leading-relaxed text-slate-600 line-clamp-2 font-medium">
            {herb.description || "No description provided."}
          </p>
        </div>
      </div>
    </Motion.button>
  );
}

export default HerbCard;
