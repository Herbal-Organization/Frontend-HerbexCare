import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

function RecipesPagination({
  currentPage,
  totalPages,
  itemCount,
  onPageChange,
}) {
  if (!itemCount) {
    return null;
  }

  const pageNumbers = Array.from(
    { length: totalPages },
    (_, index) => index + 1,
  );

  return (
    <div className="mt-10 flex justify-center px-4 pb-12">
      <div className="flex flex-col items-center gap-4 rounded-3xl border border-slate-200/80 dark:border-slate-700 bg-white/90 dark:bg-slate-800/90 px-5 py-5 shadow-sm backdrop-blur-sm sm:px-8">
        <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500">
          Page {currentPage} of {totalPages}
        </p>
        <nav className="flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => onPageChange(currentPage - 1)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 transition-all hover:border-teal-300 dark:hover:border-teal-700 hover:bg-teal-50 dark:hover:bg-teal-900/30 hover:text-teal-700 dark:hover:text-teal-300 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Previous page"
          >
            <FiChevronLeft />
          </button>

          {pageNumbers.map((pageNumber) => (
            <button
              key={pageNumber}
              type="button"
              onClick={() => onPageChange(pageNumber)}
              className={`flex h-10 min-w-10 items-center justify-center rounded-xl border px-3 text-sm font-bold transition-all ${
                pageNumber === currentPage
                  ? "border-teal-600 bg-teal-600 text-white shadow-md shadow-teal-600/25"
                  : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:border-teal-300 dark:hover:border-teal-700 hover:bg-teal-50 dark:hover:bg-teal-900/30 hover:text-teal-700 dark:hover:text-teal-300"
              }`}
            >
              {pageNumber}
            </button>
          ))}

          <button
            type="button"
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 transition-all hover:border-teal-300 dark:hover:border-teal-700 hover:bg-teal-50 dark:hover:bg-teal-900/30 hover:text-teal-700 dark:hover:text-teal-300 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Next page"
          >
            <FiChevronRight />
          </button>
        </nav>
      </div>
    </div>
  );
}

export default RecipesPagination;
