import {
  FaArrowLeft,
  FaCheckCircle,
  FaExclamationTriangle,
  FaLeaf,
  FaStamp,
  FaUserMd,
} from "react-icons/fa";
import { Link, useParams } from "react-router-dom";
import { motion } from "motion/react";
import PatientNavbar from "../../components/browse/PatientNavbar";
import Footer from "../../components/landing/Footer";
import useHerbDetails from "../../hooks/useHerbDetails";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { type: "spring", stiffness: 300, damping: 24 } 
  },
};

function HerbInfoCard({ title, icon, children, tone = "slate" }) {
  const toneClasses = {
    slate: "border-slate-200 bg-white hover:border-slate-300",
    emerald: "border-emerald-200 bg-emerald-50/50 hover:border-emerald-300",
    amber: "border-amber-200 bg-amber-50/50 hover:border-amber-300",
  };

  const iconTones = {
    slate: "text-slate-500 bg-slate-100 group-hover:bg-slate-200",
    emerald: "text-emerald-600 bg-emerald-100 group-hover:bg-emerald-200 group-hover:text-emerald-700",
    amber: "text-amber-600 bg-amber-100 group-hover:bg-amber-200 group-hover:text-amber-700",
  };

  return (
    <motion.article 
      variants={itemVariants}
      whileHover={{ y: -6, transition: { duration: 0.2 } }}
      className={`group rounded-[2rem] border p-8 shadow-sm hover:shadow-lg transition-all duration-300 ${toneClasses[tone]}`}
    >
      <div className="flex items-center gap-4">
        <div className={`rounded-2xl p-4 transition-colors ${iconTones[tone]}`}>
          {icon}
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900">{title}</h2>
      </div>
      <div className="mt-6">{children}</div>
    </motion.article>
  );
}

function HerbDetailsPage() {
  const { herbId } = useParams();
  const { herb, isLoading, error, reload } = useHerbDetails(herbId);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <PatientNavbar />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 flex-1 w-full">
        <Link
          to="/patient/home/herbs"
          className="inline-flex items-center gap-3 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-slate-600 shadow-sm transition-all hover:text-emerald-600 hover:shadow-md hover:-translate-y-0.5"
        >
          <FaArrowLeft className="text-xs" />
          Back to herbs
        </Link>

        {isLoading ? (
          <div className="mt-12 rounded-[2rem] border border-slate-200 bg-white p-16 text-center shadow-sm">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-emerald-500" />
            <p className="mt-6 text-sm font-bold text-slate-500 uppercase tracking-widest">
              Loading herb details...
            </p>
          </div>
        ) : null}

        {!isLoading && error ? (
          <div className="mt-12 rounded-[2rem] border border-red-100 bg-red-50 p-16 text-center shadow-sm">
            <h2 className="text-xl font-extrabold text-red-800">Unable to load herb details</h2>
            <p className="mt-3 text-sm font-medium text-red-600">{error}</p>
            <button
              type="button"
              onClick={reload}
              className="mt-8 rounded-full bg-red-600 px-8 py-3 text-sm font-bold text-white hover:bg-red-700 hover:shadow-lg transition-all"
            >
              Try Again
            </button>
          </div>
        ) : null}

        {!isLoading && !error && herb ? (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="mt-10 space-y-10"
          >
            <motion.section 
              variants={itemVariants}
              className="overflow-hidden rounded-[2.5rem] border border-emerald-100 bg-white shadow-md relative"
            >
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-emerald-50/80 via-white to-teal-50/30" />
              <div className="grid gap-0 lg:grid-cols-[0.95fr_1.05fr] relative z-10">
                <div className="relative min-h-[340px] bg-emerald-50 lg:h-full">
                  {herb.imageURL ? (
                    <img
                      src={herb.imageURL}
                      alt={herb.herbName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <FaLeaf className="text-9xl text-emerald-200/50" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-900/20 to-transparent" />
                </div>

                <div className="p-10 lg:p-14 flex flex-col justify-center bg-white/60 backdrop-blur-md">
                  <div className="flex flex-wrap gap-3">
                    <span className="rounded-full bg-slate-900 px-4 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.2em] text-white shadow-sm">
                      Herb Document
                    </span>
                    <span
                      className={`rounded-full px-4 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.2em] shadow-sm border ${
                        herb.isApproved === true
                          ? "bg-emerald-500 text-white border-emerald-400"
                          : "bg-amber-100 text-amber-800 border-amber-200"
                      }`}
                    >
                      {herb.isApproved === true ? "Approved by Medical Board" : "Approval pending"}
                    </span>
                  </div>

                  <h1 className="mt-6 text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
                    {herb.herbName}
                  </h1>
                  <p className="mt-3 text-xl italic font-medium text-slate-500">
                    {herb.scientificName}
                  </p>
                  
                  <div className="mt-8 mb-4">
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">
                      Description
                    </p>
                    <p className="text-base leading-relaxed font-medium text-slate-600">
                      {herb.description || "No description provided."}
                    </p>
                  </div>
                </div>
              </div>
            </motion.section>

            <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="space-y-8">
                <HerbInfoCard title="Primary Benefits" icon={<FaCheckCircle className="text-xl" />} tone="emerald">
                  <div className="rounded-2xl bg-white p-5 border border-emerald-100 shadow-sm">
                    <p className="text-sm leading-relaxed font-medium text-slate-700">
                      {herb.benefits || "No specific benefits noted."}
                    </p>
                  </div>
                  {herb.benefitList?.length ? (
                    <div className="mt-6">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600/70 mb-3">Key Highlights</p>
                      <div className="flex flex-wrap gap-2.5">
                        {herb.benefitList.map((benefit) => (
                          <span
                            key={benefit}
                            className="rounded-xl border border-emerald-100 bg-white px-4 py-2 text-xs font-bold text-emerald-700 shadow-sm"
                          >
                            {benefit}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </HerbInfoCard>

                <HerbInfoCard title="Dosage Guidance" icon={<FaLeaf className="text-xl" />}>
                  <div className="rounded-2xl bg-slate-50 p-6 border border-slate-100">
                    <p className="text-sm leading-relaxed font-medium text-slate-700">
                      {herb.dosage || "Consult your herbalist for proper dosage instructions before proceeding."}
                    </p>
                  </div>
                </HerbInfoCard>
              </div>

              <div className="space-y-8">
                <HerbInfoCard
                  title="Warnings & Cautions"
                  icon={<FaExclamationTriangle className="text-xl" />}
                  tone="amber"
                >
                  <div className="rounded-2xl bg-white p-6 border border-amber-100 shadow-sm">
                    <p className="text-sm leading-relaxed font-bold text-slate-800">
                      {herb.warnings || "No explicit warnings listed. Always exercise caution and consult a professional."}
                    </p>
                  </div>
                </HerbInfoCard>

                <HerbInfoCard title="Record Curation" icon={<FaStamp className="text-xl" />}>
                  <div className="grid gap-5">
                    <div className="group rounded-2xl border border-slate-100 bg-slate-50 p-5 hover:bg-white hover:shadow-sm transition-all">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 group-hover:text-primary transition-colors">
                        Approval Status
                      </p>
                      <p className="mt-2 text-sm font-bold text-slate-900">
                        {herb.isApproved == null
                          ? "Under Review"
                          : herb.isApproved
                            ? "Officially Approved"
                            : "Pending Approval"}
                      </p>
                    </div>
                    <div className="group rounded-2xl border border-slate-100 bg-slate-50 p-5 hover:bg-white hover:shadow-sm transition-all">
                      <div className="flex items-center gap-2 text-slate-400 group-hover:text-primary transition-colors mb-2">
                        <FaUserMd />
                        <p className="text-[10px] font-bold uppercase tracking-widest">
                          Curating Herbalist
                        </p>
                      </div>
                      <p className="text-sm font-bold text-slate-900">
                        {herb.herbalistName || "Herbal Care Professional"}
                      </p>
                    </div>
                  </div>
                </HerbInfoCard>
              </div>
            </section>
          </motion.div>
        ) : null}
      </main>
      <Footer />
    </div>
  );
}

export default HerbDetailsPage;
