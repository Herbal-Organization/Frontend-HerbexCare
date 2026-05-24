import { FiSearch } from "react-icons/fi";

function BrowseFilters({
  title,
  description,
  searchTerm,
  onSearchChange,
  resultCount,
  resultLabel = "results",
  placeholder = "Search...",
  accent = "emerald",
}) {
  const accentClasses =
    accent === "teal"
      ? {
          icon: "text-teal-600/60 group-focus-within:text-teal-600",
          ring: "focus:border-teal-500 focus:ring-teal-500/10",
          glow: "bg-teal-400/20",
          badge: "bg-teal-50 text-teal-800 border-teal-100",
        }
      : {
          icon: "text-emerald-600/60 group-focus-within:text-emerald-600",
          ring: "focus:border-emerald-500 focus:ring-emerald-500/10",
          glow: "bg-emerald-400/20",
          badge: "bg-emerald-50 text-emerald-800 border-emerald-100",
        };

  return (
    <section className="mb-6">
      {(title || description) && (
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            {title ? (
              <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                {title}
              </h1>
            ) : null}
            {description ? (
              <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-slate-500 sm:text-base">
                {description}
              </p>
            ) : null}
          </div>
          {typeof resultCount === "number" ? (
            <div
              className={`inline-flex shrink-0 items-center gap-2 self-start rounded-2xl border px-4 py-2.5 text-sm font-bold shadow-sm sm:self-auto ${accentClasses.badge}`}
            >
              <span className="text-lg tabular-nums">{resultCount}</span>
              <span className="text-xs font-semibold uppercase tracking-wide opacity-80">
                {resultLabel}
              </span>
            </div>
          ) : null}
        </div>
      )}

      <div className="relative group mx-auto max-w-3xl">
        <FiSearch
          className={`absolute start-5 top-1/2 z-10 -translate-y-1/2 text-xl transition-colors ${accentClasses.icon}`}
        />
        <input
          value={searchTerm}
          onChange={(event) => onSearchChange(event.target.value)}
          className={`w-full rounded-2xl border border-slate-200/80 bg-white py-3.5 ps-14 pe-5 text-base font-medium text-slate-800 shadow-sm outline-none transition-all duration-300 placeholder:text-slate-400 hover:border-slate-300 hover:shadow-md focus:ring-4 sm:rounded-full sm:py-4 sm:text-lg ${accentClasses.ring}`}
          placeholder={placeholder}
          type="search"
          aria-label={placeholder}
        />
        <div
          className={`pointer-events-none absolute inset-0 -z-10 rounded-2xl opacity-0 blur-xl transition-opacity duration-500 group-focus-within:opacity-100 sm:rounded-full ${accentClasses.glow}`}
        />
      </div>
    </section>
  );
}

export default BrowseFilters;
