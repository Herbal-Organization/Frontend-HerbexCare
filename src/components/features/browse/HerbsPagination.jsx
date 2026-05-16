import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

function HerbsPagination({ currentPage, totalPages, itemCount, onPageChange }) {
  if (!itemCount) {
    return null;
  }

  const pageNumbers = Array.from(
    { length: totalPages },
    (_, index) => index + 1,
  );

  return (
    <div className="mt-12 flex justify-center px-4 pb-12">
      <div className="flex flex-col items-center gap-4 rounded-3xl border border-slate-200 bg-white px-4 py-5 shadow-sm sm:px-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">
          Page {currentPage} of {totalPages}
        </p>
        <nav className="flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => onPageChange(currentPage - 1)}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition-all hover:border-primary hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <FiChevronLeft />
          </button>

          {pageNumbers.map((pageNumber) => (
            <button
              key={pageNumber}
              type="button"
              onClick={() => onPageChange(pageNumber)}
              className={`flex h-11 min-w-11 items-center justify-center rounded-full border px-3 text-sm font-bold transition-all ${
                pageNumber === currentPage
                  ? "border-primary bg-primary text-white shadow-md"
                  : "border-slate-200 bg-white text-slate-600 hover:border-primary hover:bg-primary/10"
              }`}
            >
              {pageNumber}
            </button>
          ))}

          <button
            type="button"
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition-all hover:border-primary hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <FiChevronRight />
          </button>
        </nav>
      </div>
    </div>
  );
}

export default HerbsPagination;
