import { FiSearch } from "react-icons/fi";

function BrowseFilters({
  title,
  description,
  searchTerm,
  onSearchChange,
  resultCount,
  resultLabel = "items",
  placeholder = "Search...",
}) {
  return (
    <section className="mb-10">
      <div className="flex flex-col gap-6">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 ">
            {title}
          </h2>
          <p className="mt-1 text-slate-600">
            {description}
          </p>
          <p className="mt-3 text-sm font-medium text-slate-500">
            {resultCount} {resultLabel}
          </p>
        </div>

        <div className="relative w-full">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-lg text-slate-400" />
          <input
            value={searchTerm}
            onChange={(event) => onSearchChange(event.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-12 pr-4 outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-primary"
            placeholder={placeholder}
            type="text"
          />
        </div>
      </div>
    </section>
  );
}

export default BrowseFilters;
