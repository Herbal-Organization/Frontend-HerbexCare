import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { motion } from "motion/react";

const buildPageItems = (currentPage, totalPages) => {
  const items = [];

  if (totalPages <= 7) {
    // Show all pages if total is small
    for (let i = 1; i <= totalPages; i++) {
      items.push(i);
    }
  } else if (currentPage <= 4) {
    // Beginning: show 1,2,3,4,5,...,totalPages
    for (let i = 1; i <= 5; i++) {
      items.push(i);
    }
    items.push("ellipsis");
    items.push(totalPages);
  } else if (currentPage >= totalPages - 3) {
    // End: show 1,...,totalPages-4,...,totalPages
    items.push(1);
    items.push("ellipsis");
    for (let i = totalPages - 4; i <= totalPages; i++) {
      items.push(i);
    }
  } else {
    // Middle: show 1,...,currentPage-1,currentPage,currentPage+1,...,totalPages
    items.push(1);
    items.push("ellipsis");
    items.push(currentPage - 1);
    items.push(currentPage);
    items.push(currentPage + 1);
    items.push("ellipsis");
    items.push(totalPages);
  }

  return items;
};

export default function Pagination({
  totalItems,
  itemsPerPage,
  currentPage,
  onPageChange,
}) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  if (totalItems === 0) {
    return null;
  }

  const pageItems = buildPageItems(currentPage, totalPages);

  return (
    <div className="flex items-center justify-center gap-2">
      {/* Mobile View: Prev | Page X of Y | Next */}
      <div className="flex sm:hidden items-center gap-3">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-700 p-2 text-slate-600 dark:text-slate-300 hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-50 transition-all"
          aria-label="Previous page"
        >
          <FiChevronLeft className="text-lg" />
        </button>

        <span className="text-sm font-semibold text-slate-600 dark:text-slate-300 min-w-24 text-center">
          {currentPage} of {totalPages}
        </span>

        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-700 p-2 text-slate-600 dark:text-slate-300 hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-50 transition-all"
          aria-label="Next page"
        >
          <FiChevronRight className="text-lg" />
        </button>
      </div>

      {/* Desktop View: Full Pagination */}
      <div className="hidden sm:flex items-center gap-2">
        {/* Previous Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-700 p-2.5 text-slate-600 dark:text-slate-300 hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-50 transition-all"
          aria-label="Previous page"
        >
          <FiChevronLeft className="text-lg" />
        </motion.button>

        {/* Page Numbers */}
        {pageItems.map((item, index) => {
          if (item === "ellipsis") {
            return (
              <span
                key={`ellipsis-${index}`}
                className="px-2 text-slate-400 font-semibold"
              >
                ...
              </span>
            );
          }

          const isActive = item === currentPage;

          return (
            <motion.button
              key={item}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onPageChange(item)}
              className={`inline-flex items-center justify-center rounded-2xl px-3.5 py-2 font-bold text-sm transition-all ${
                isActive
                  ? "bg-primary text-white shadow-lg shadow-primary/20"
                  : "border border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-primary hover:text-primary"
              }`}
              aria-label={`Go to page ${item}`}
              aria-current={isActive ? "page" : undefined}
            >
              {item}
            </motion.button>
          );
        })}

        {/* Next Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-700 p-2.5 text-slate-600 dark:text-slate-300 hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-50 transition-all"
          aria-label="Next page"
        >
          <FiChevronRight className="text-lg" />
        </motion.button>
      </div>
    </div>
  );
}
