import {
  FaArrowLeft,
  FaCheckCircle,
  FaExclamationTriangle,
  FaLeaf,
  FaStamp,
  FaUserMd,
} from "react-icons/fa";
import { Link, useParams } from "react-router-dom";
import PatientNavbar from "../component/browse/PatientNavbar";
import Footer from "../component/Footer";
import useHerbDetails from "../hooks/useHerbDetails";

function HerbInfoCard({ title, icon, children, tone = "slate" }) {
  const toneClasses = {
    slate: "border-slate-200 bg-white",
    emerald: "border-emerald-200 bg-emerald-50",
    amber: "border-amber-200 bg-amber-50",
  };

  return (
    <article className={`rounded-3xl border p-6 shadow-sm ${toneClasses[tone]}`}>
      <div className="flex items-center gap-3">
        <div className="rounded-2xl bg-white/80 p-3 text-primary">{icon}</div>
        <h2 className="text-xl font-bold text-slate-900">{title}</h2>
      </div>
      <div className="mt-5">{children}</div>
    </article>
  );
}

function HerbDetailsPage() {
  const { herbId } = useParams();
  const { herb, isLoading, error, reload } = useHerbDetails(herbId);

  return (
    <div className="min-h-screen bg-slate-50">
      <PatientNavbar />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <Link
          to="/patient/home/herbs"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition-colors hover:text-primary"
        >
          <FaArrowLeft className="text-xs" />
          Back to herbs
        </Link>

        {isLoading ? (
          <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-primary" />
            <p className="mt-4 text-sm font-medium text-slate-500">
              Loading herb details...
            </p>
          </div>
        ) : null}

        {!isLoading && error ? (
          <div className="mt-8 rounded-3xl border border-red-100 bg-red-50 p-12 text-center shadow-sm">
            <h2 className="text-xl font-bold text-red-800">Unable to load herb details</h2>
            <p className="mt-2 text-sm text-red-600">{error}</p>
            <button
              type="button"
              onClick={reload}
              className="mt-5 rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white"
            >
              Retry
            </button>
          </div>
        ) : null}

        {!isLoading && !error && herb ? (
          <div className="mt-8 space-y-8">
            <section className="overflow-hidden rounded-[32px] border border-emerald-200 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.22),_transparent_32%),linear-gradient(135deg,_#f7fff9_0%,_#eefbf5_45%,_#ffffff_100%)] shadow-sm">
              <div className="grid gap-0 lg:grid-cols-[0.95fr_1.05fr]">
                <div className="relative min-h-[280px] bg-slate-100">
                  <img
                    src={herb.imageURL}
                    alt={herb.herbName}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 via-transparent to-transparent" />
                </div>

                <div className="p-8">
                  <div className="flex flex-wrap gap-3">
                    <span className="rounded-full bg-slate-900 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-white">
                      Herb
                    </span>
                    <span
                      className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] ${
                        herb.isApproved === true
                          ? "bg-emerald-500 text-white"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {herb.isApproved === true ? "Approved" : "Approval pending"}
                    </span>
                  </div>

                  <h1 className="mt-5 text-4xl font-bold tracking-tight text-slate-900">
                    {herb.herbName}
                  </h1>
                  <p className="mt-2 text-lg italic text-slate-500">
                    {herb.scientificName}
                  </p>
                  <p className="mt-5 max-w-3xl text-base leading-7 text-slate-600">
                    {herb.description}
                  </p>

                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl border border-white/80 bg-white/90 p-4 shadow-sm">
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                        Herb ID
                      </p>
                      <p className="mt-2 text-sm font-semibold text-slate-900">
                        {herb.herbId}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-white/80 bg-white/90 p-4 shadow-sm">
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                        Added By Herbalist
                      </p>
                      <p className="mt-2 text-sm font-semibold text-slate-900">
                        {herb.herbalistName ||
                          (herb.herbalistId
                            ? `Herbalist #${herb.herbalistId}`
                            : herb.addedByHerbalistId ?? "Not returned")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="space-y-8">
                <HerbInfoCard title="Benefits" icon={<FaCheckCircle />} tone="emerald">
                  <p className="text-sm leading-7 text-slate-700">{herb.benefits}</p>
                  {herb.benefitList.length ? (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {herb.benefitList.map((benefit) => (
                        <span
                          key={benefit}
                          className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-emerald-700"
                        >
                          {benefit}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </HerbInfoCard>

                <HerbInfoCard title="Dosage Guidance" icon={<FaLeaf />}>
                  <p className="text-sm leading-7 text-slate-700">{herb.dosage}</p>
                </HerbInfoCard>
              </div>

              <div className="space-y-8">
                <HerbInfoCard
                  title="Warnings"
                  icon={<FaExclamationTriangle />}
                  tone="amber"
                >
                  <p className="text-sm leading-7 text-slate-700">{herb.warnings}</p>
                </HerbInfoCard>

                <HerbInfoCard title="Record Details" icon={<FaStamp />}>
                  <div className="grid gap-4">
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                        Approval Status
                      </p>
                      <p className="mt-2 text-sm font-semibold text-slate-900">
                        {herb.isApproved == null
                          ? "Not returned"
                          : herb.isApproved
                            ? "Approved"
                            : "Pending approval"}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <div className="flex items-center gap-2 text-slate-500">
                        <FaUserMd className="text-sm" />
                        <p className="text-xs font-bold uppercase tracking-[0.18em]">
                          Added By Herbalist
                        </p>
                      </div>
                      <p className="mt-2 text-sm font-semibold text-slate-900">
                        {herb.herbalistName ||
                          (herb.herbalistId
                            ? `Herbalist #${herb.herbalistId}`
                            : herb.addedByHerbalistId ?? "Not returned")}
                      </p>
                    </div>
                  </div>
                </HerbInfoCard>
              </div>
            </section>
          </div>
        ) : null}
      </main>
      <Footer />
    </div>
  );
}

export default HerbDetailsPage;
