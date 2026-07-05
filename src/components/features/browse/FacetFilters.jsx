import { useEffect, useRef, useState } from "react";
import { FaChevronDown, FaFilter, FaTimes } from "react-icons/fa";

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
  const panelRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!panelRef.current?.contains(event.target)) {
        setShowSingleDropdown(false);
        setShowMultiDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const singleLabel =
    singleFilter?.options.find((option) => option.value === singleFilter?.value)
      ?.label ?? "All";

  return (
    <div ref={panelRef} className="relative z-20 mb-8">
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-700 bg-white/90 dark:bg-slate-800/90 p-4 shadow-sm backdrop-blur-sm sm:rounded-3xl sm:p-5">
        <div className="mb-4 flex items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-700 pb-3">
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
              <FaFilter className="text-sm" />
            </span>
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100">Filters</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Refine your browse results
              </p>
            </div>
          </div>
          {hasActiveFilters ? (
            <button
              type="button"
              onClick={onClearFilters}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 transition-colors hover:border-rose-200 dark:hover:border-rose-800 hover:bg-rose-50 dark:hover:bg-rose-900/30 hover:text-rose-700 dark:hover:text-rose-400"
            >
              <FaTimes className="text-[10px]" />
              Clear all
            </button>
          ) : null}
        </div>

        <div className="flex flex-col gap-4 lg:flex-row lg:flex-wrap lg:items-center">
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {singleFilter ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setShowSingleDropdown(!showSingleDropdown);
                    setShowMultiDropdown(false);
                  }}
                  className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all ${
                    showSingleDropdown || singleFilter.value !== "all"
                      ? "border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 shadow-sm"
                      : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-emerald-200 dark:hover:border-emerald-700 hover:bg-white dark:hover:bg-slate-800"
                  }`}
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    {singleFilter.label}
                  </span>
                  <span>{singleLabel}</span>
                  <FaChevronDown
                    className={`text-[10px] transition-transform ${
                      showSingleDropdown ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {showSingleDropdown ? (
                  <div className="absolute start-0 top-full z-30 mt-2 min-w-52 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-1 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50">
                    {singleFilter.options.map((option) => (
                      <button
                        type="button"
                        key={option.value}
                        onClick={() => {
                          singleFilter.onChange(option.value);
                          setShowSingleDropdown(false);
                        }}
                        className={`w-full px-4 py-2.5 text-start text-sm font-medium transition-colors ${
                          singleFilter.value === option.value
                            ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300"
                            : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                ) : null}
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
                  className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all ${
                    showMultiDropdown || selectedItems.length > 0
                      ? "border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 shadow-sm"
                      : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-emerald-200 dark:hover:border-emerald-700 hover:bg-white dark:hover:bg-slate-800"
                  }`}
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    {multiFilter.label}
                  </span>
                  <span>
                    {selectedItems.length > 0
                      ? `${selectedItems.length} selected`
                      : "Any"}
                  </span>
                  <FaChevronDown
                    className={`text-[10px] transition-transform ${
                      showMultiDropdown ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {showMultiDropdown ? (
                  <div className="absolute start-0 top-full z-30 mt-2 max-h-72 min-w-[min(100vw-2rem,20rem)] overflow-y-auto rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-1 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 sm:min-w-80">
                    {multiFilter.options.length === 0 ? (
                      <div className="px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                        No options available
                      </div>
                    ) : (
                      multiFilter.options.map((option) => (
                        <label
                          key={option}
                          className="flex cursor-pointer items-center gap-3 border-b border-slate-50 dark:border-slate-700/50 px-4 py-3 transition-colors last:border-b-0 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/20"
                        >
                          <input
                            type="checkbox"
                            checked={selectedItems.includes(option)}
                            onChange={() => onToggleItem(option)}
                            className="h-4 w-4 rounded border-slate-300 dark:border-slate-600 text-emerald-600 focus:ring-emerald-500"
                          />
                          <span className="flex-1 text-sm font-medium text-slate-700 dark:text-slate-300">
                            {option}
                          </span>
                        </label>
                      ))
                    )}
                  </div>
                ) : null}
              </div>
            ) : null}

            {extraControls ? (
              <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:gap-3">
                {extraControls}
              </div>
            ) : null}
          </div>
        </div>

        {selectedItems.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 dark:border-slate-700 pt-4">
            {selectedItems.map((item) => (
              <span
                key={item}
                className="inline-flex items-center gap-2 rounded-full border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300"
              >
                {item}
                <button
                  type="button"
                  onClick={() => onToggleItem(item)}
                  className="rounded-full p-0.5 transition-colors hover:bg-emerald-200/60"
                  aria-label={`Remove ${item}`}
                >
                  <FaTimes className="text-[10px]" />
                </button>
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default FacetFilters;
