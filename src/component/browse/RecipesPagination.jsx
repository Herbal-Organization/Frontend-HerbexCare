import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

function RecipesPagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) {
    return null;
  }

  const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <div className="mt-12 flex justify-center">
      <nav className="flex items-center gap-2">
        <button
          type="button"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-all hover:border-primary hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <FiChevronLeft />
        </button>
        {pageNumbers.map((pageNumber) => (
          <button
            key={pageNumber}
            type="button"
            onClick={() => onPageChange(pageNumber)}
            className={`flex h-10 w-10 items-center justify-center rounded-lg border font-bold transition-all ${
              pageNumber === currentPage
                ? "border-primary bg-primary text-white"
                : "border-slate-200 text-slate-600 hover:border-primary hover:bg-primary/10"
            }`}
          >
            {pageNumber}
          </button>
        ))}
        <button
          type="button"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-all hover:border-primary hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <FiChevronRight />
        </button>
      </nav>
    </div>
  );
}

export default RecipesPagination;
