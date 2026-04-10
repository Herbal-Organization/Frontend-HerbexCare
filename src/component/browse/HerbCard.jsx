import { FaLeaf } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

function HerbCard({ herb }) {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => navigate(`/patient/home/herbs/${herb.herbId}`)}
      className="overflow-hidden rounded-3xl border border-slate-200 bg-white text-left shadow-sm transition-shadow hover:shadow-md"
    >
      {herb.imageURL ? (
        <div className="h-44 w-full overflow-hidden bg-slate-100">
          <img
            src={herb.imageURL}
            alt={herb.herbName}
            className="h-full w-full object-cover"
          />
        </div>
      ) : null}

      <div className="p-6">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-primary/10 p-3 text-primary">
            <FaLeaf className="text-lg" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-bold text-slate-900">{herb.herbName}</h3>
              <span
                className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.18em] ${
                  herb.isApproved === true
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-amber-100 text-amber-700"
                }`}
              >
                {herb.isApproved === true ? "Approved" : "Not approved"}
              </span>
            </div>
            <p className="mt-2 text-sm italic text-slate-500">{herb.scientificName}</p>
            <p className="mt-2 text-sm font-medium text-slate-500">
              {herb.herbalistName
                ? `Added by ${herb.herbalistName}`
                : herb.herbalistId
                  ? `Added by herbalist #${herb.herbalistId}`
                  : "Added by herbalist"}
            </p>
            <p className="mt-4 text-sm leading-6 text-slate-600 line-clamp-4">
              {herb.description}
            </p>
          </div>
        </div>
      </div>
    </button>
  );
}

export default HerbCard;
