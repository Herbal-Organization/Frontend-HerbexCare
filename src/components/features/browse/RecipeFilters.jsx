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
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2">
            <span className="text-xs font-semibold text-slate-500">
              Min EGP
            </span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={minPrice}
              onChange={(event) => onMinPriceChange(event.target.value)}
              placeholder="0"
              className="w-24 rounded-md border border-slate-200 px-2 py-1 text-sm outline-none focus:border-emerald-500"
            />
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2">
            <span className="text-xs font-semibold text-slate-500">
              Max EGP
            </span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={maxPrice}
              onChange={(event) => onMaxPriceChange(event.target.value)}
              placeholder="Any"
              className="w-24 rounded-md border border-slate-200 px-2 py-1 text-sm outline-none focus:border-emerald-500"
            />
          </div>
        </>
      }
      hasActiveFilters={hasActiveFilters}
      onClearFilters={onClearFilters}
    />
  );
}

export default RecipeFilters;
