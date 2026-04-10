import { FiSearch } from "react-icons/fi";

function BrowseFilters({
  title, // Omitted from render per user request
  description, // Omitted
  searchTerm,
  onSearchChange,
  resultCount, // Omitted
  resultLabel, // Omitted
  placeholder = "Search...",
}) {
  return (
    <section className="mb-12 max-w-3xl mx-auto px-4 mt-8">
      <div className="relative group w-full">
        <FiSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-xl text-emerald-600/50 group-focus-within:text-emerald-600 transition-colors drop-shadow-sm z-10" />
        <input
          value={searchTerm}
          onChange={(event) => onSearchChange(event.target.value)}
          className="w-full rounded-full border border-emerald-100 bg-white py-4 pl-16 pr-6 outline-none transition-all duration-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 hover:shadow-lg shadow-md text-lg text-slate-800 placeholder:text-slate-400 font-medium"
          placeholder={placeholder}
          type="text"
        />
        {/* Glow effect matching primary color */}
        <div className="pointer-events-none absolute inset-0 -z-10 rounded-full bg-emerald-400/20 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
      </div>
    </section>
  );
}

export default BrowseFilters;
