import FacetFilters from "./FacetFilters";

function RecipeFilters({
  availableDiseases,
  selectedDiseases,
  onDiseaseChange,
  statusFilter,
  onStatusChange,
  minPrice,
  maxPrice,
  onMinPriceChange,
  onMaxPriceChange,
  hasActiveFilters,
  onClearFilters,
}) {
  const statusOptions = [
    { value: "all", label: "All Recipes" },
    { value: "active", label: "Active Only" },
    { value: "inactive", label: "Inactive" },
  ];

  return (
    <FacetFilters
      singleFilter={{
        label: "Status",
        value: statusFilter,
        options: statusOptions,
        onChange: onStatusChange,
      }}
      multiFilter={{
        label: "Conditions",
        options: availableDiseases,
      }}
      selectedItems={selectedDiseases}
      onToggleItem={onDiseaseChange}
      extraControls={
        <>
          <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Min
            </span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={minPrice}
              onChange={(event) => onMinPriceChange(event.target.value)}
              placeholder="0"
              className="w-20 border-0 bg-transparent p-0 text-sm font-semibold text-slate-800 outline-none placeholder:text-slate-400 focus:ring-0 sm:w-24"
              aria-label="Minimum price in EGP"
            />
            <span className="text-xs font-bold text-emerald-600">EGP</span>
          </div>
          <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Max
            </span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={maxPrice}
              onChange={(event) => onMaxPriceChange(event.target.value)}
              placeholder="Any"
              className="w-20 border-0 bg-transparent p-0 text-sm font-semibold text-slate-800 outline-none placeholder:text-slate-400 focus:ring-0 sm:w-24"
              aria-label="Maximum price in EGP"
            />
            <span className="text-xs font-bold text-emerald-600">EGP</span>
          </div>
        </>
      }
      hasActiveFilters={hasActiveFilters}
      onClearFilters={onClearFilters}
    />
  );
}

export default RecipeFilters;
