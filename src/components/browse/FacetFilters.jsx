import { useState } from "react";
import { FaChevronDown, FaTimes } from "react-icons/fa";

function FacetFilters({
  singleFilter,
  multiFilter,
  selectedItems = [],
  onToggleItem,
  extraControls,
  hasActiveFilters,
  onClearFilters,
}) {
  const [showSingleDropdown, setShowSingleDropdown] = useState(false);
  const [showMultiDropdown, setShowMultiDropdown] = useState(false);

  return (
    <div className="mb-8 max-w-6xl mx-auto">
      <div className="flex flex-wrap gap-4 items-center">
        {singleFilter ? (
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowSingleDropdown(!showSingleDropdown);
                setShowMultiDropdown(false);
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 bg-white hover:border-emerald-300 hover:shadow-md transition-all text-sm font-medium text-slate-700"
            >
              <span>
                {singleFilter.label}:{" "}
                {
                  singleFilter.options.find(
                    (option) => option.value === singleFilter.value,
                  )?.label
                }
              </span>
              <FaChevronDown
                className={`text-xs transition-transform ${
                  showSingleDropdown ? "rotate-180" : ""
                }`}
              />
            </button>

            {showSingleDropdown && (
              <div className="absolute top-full mt-1 left-0 z-20 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden min-w-48">
                {singleFilter.options.map((option) => (
                  <button
                    type="button"
                    key={option.value}
                    onClick={() => {
                      singleFilter.onChange(option.value);
                      setShowSingleDropdown(false);
                    }}
                    className={`w-full px-4 py-3 text-left text-sm font-medium transition-colors ${
                      singleFilter.value === option.value
                        ? "bg-emerald-50 text-emerald-700 border-l-4 border-emerald-500"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : null}

        {multiFilter ? (
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowMultiDropdown(!showMultiDropdown);
                setShowSingleDropdown(false);
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 bg-white hover:border-emerald-300 hover:shadow-md transition-all text-sm font-medium text-slate-700"
            >
              <span>
                {multiFilter.label}{" "}
                {selectedItems.length > 0 ? `(${selectedItems.length})` : ""}
              </span>
              <FaChevronDown
                className={`text-xs transition-transform ${
                  showMultiDropdown ? "rotate-180" : ""
                }`}
              />
            </button>

            {showMultiDropdown && (
              <div className="absolute top-full mt-1 left-0 z-20 bg-white border border-slate-200 rounded-lg shadow-lg overflow-y-auto max-h-72 min-w-72">
                {multiFilter.options.length === 0 ? (
                  <div className="px-4 py-6 text-center text-sm text-slate-500">
                    No options available
                  </div>
                ) : (
                  multiFilter.options.map((option) => (
                    <label
                      key={option}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 cursor-pointer transition-colors border-b border-slate-100 last:border-b-0"
                    >
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(option)}
                        onChange={() => onToggleItem(option)}
                        className="w-4 h-4 rounded border-slate-300 text-emerald-600 cursor-pointer"
                      />
                      <span className="text-sm text-slate-700 flex-1">
                        {option}
                      </span>
                    </label>
                  ))
                )}
              </div>
            )}
          </div>
        ) : null}

        {selectedItems.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {selectedItems.map((item) => (
              <span
                key={item}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium border border-emerald-200"
              >
                {item}
                <button
                  type="button"
                  onClick={() => onToggleItem(item)}
                  className="hover:text-emerald-900 transition-colors"
                >
                  <FaTimes className="text-xs" />
                </button>
              </span>
            ))}
          </div>
        ) : null}

        {extraControls ? (
          <div className="flex flex-wrap items-center gap-3">
            {extraControls}
          </div>
        ) : null}

        {hasActiveFilters ? (
          <button
            type="button"
            onClick={onClearFilters}
            className="ml-auto px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
          >
            Clear All Filters
          </button>
        ) : null}
      </div>
    </div>
  );
}

export default FacetFilters;
