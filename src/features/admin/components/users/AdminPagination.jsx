import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

const buildPageItems = (currentPage, totalPages) => {
  const items = [];

  if (totalPages <= 7) {
    for (let index = 1; index <= totalPages; index += 1) {
      items.push(index);
    }
    return items;
  }

  if (currentPage <= 4) {
    for (let index = 1; index <= 5; index += 1) {
      items.push(index);
    }
    items.push("ellipsis");
    items.push(totalPages);
    return items;
  }

  if (currentPage >= totalPages - 3) {
    items.push(1);
    items.push("ellipsis");
    for (let index = totalPages - 4; index <= totalPages; index += 1) {
      items.push(index);
    }
    return items;
  }

  items.push(1);
  items.push("ellipsis");
  items.push(currentPage - 1);
  items.push(currentPage);
  items.push(currentPage + 1);
  items.push("ellipsis");
  items.push(totalPages);
  return items;
};

function AdminPagination({
  totalItems,
  itemsPerPage,
  currentPage,
  onPageChange,
}) {
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  if (totalItems === 0) {
    return null;
  }

  const pageItems = buildPageItems(currentPage, totalPages);

  return (
    <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
      <p className="text-sm text-slate-500">
        Showing {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)} to{" "}
        {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems}{" "}
        entries
      </p>

      <div className="flex items-center gap-2 rounded-2xl bg-white p-2 shadow-sm ring-1 ring-slate-200">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition-colors hover:border-emerald-300 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Previous page"
        >
          <FiChevronLeft />
        </button>

        {pageItems.map((item, index) => {
          if (item === "ellipsis") {
            return (
              <span key={`ellipsis-${index}`} className="px-2 text-slate-400">
                ...
              </span>
            );
          }

          const isActive = item === currentPage;

          return (
            <button
              key={item}
              type="button"
              onClick={() => onPageChange(item)}
              className={`inline-flex h-9 min-w-9 items-center justify-center rounded-xl px-3 text-sm font-bold transition-colors ${
                isActive
                  ? "bg-emerald-700 text-white"
                  : "border border-slate-200 bg-white text-slate-700 hover:border-emerald-300 hover:text-emerald-700"
              }`}
              aria-current={isActive ? "page" : undefined}
            >
              {item}
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition-colors hover:border-emerald-300 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Next page"
        >
          <FiChevronRight />
        </button>
      </div>
    </div>
  );
}

export default AdminPagination;
