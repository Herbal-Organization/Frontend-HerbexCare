import {
  FaBell,
  FaSearch,
} from "react-icons/fa";
import { FaPerson } from "react-icons/fa6";
import { useLocation } from "react-router-dom";

const PAGE_META = {
  "/patient/dashboard": {
    title: "Wellness Overview",
    description: "Track your profile completeness and health summary in one place.",
  },
  "/patient/dashboard/profile": {
    title: "Profile Settings",
    description: "Update your address and medical history to keep your care plan accurate.",
  },
};

function PatientTopBar() {
  const location = useLocation();
  const pageMeta = PAGE_META[location.pathname] ?? PAGE_META["/patient/dashboard"];

  return (
    <header className="sticky top-0 z-20 border-b border-white/70 bg-white/85 backdrop-blur-xl">
      <div className="flex flex-col gap-5 px-8 py-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-700">
              <FaPerson className="text-[10px]" />
              Patient Space
            </div>
            <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900">
              {pageMeta.title}
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-slate-500">
              {pageMeta.description}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              className="relative rounded-2xl border border-slate-200 bg-white p-3 text-slate-500 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-700"
            >
              <FaBell />
              <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full border-2 border-white bg-rose-500" />
            </button>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div className="relative">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search herbs, recipes, and wellness topics..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-sm font-bold text-primary">
              {(user?.fullName || user?.name || "P").charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900">
                {user?.fullName || user?.name || "Patient"}
              </p>
              <p className="truncate text-xs text-slate-500">
                {user?.email || "Your wellness profile"}
              </p>
            </div>
          </div> */}
        </div>
      </div>
    </header>
  );
}

export default PatientTopBar;
