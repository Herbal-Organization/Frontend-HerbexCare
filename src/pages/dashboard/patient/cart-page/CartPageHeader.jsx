import { FaShoppingCart } from "react-icons/fa";

function CartPageHeader({ cartCount }) {
  return (
    <div className="overflow-hidden rounded-4xl border border-emerald-100 bg-linear-to-br from-emerald-50 via-white to-lime-50 p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="flex items-center gap-3 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
          <div className="rounded-2xl bg-white/90 p-3 text-emerald-600 shadow-sm ring-1 ring-emerald-100">
            <FaShoppingCart className="text-xl sm:text-2xl" />
          </div>
          Checkout Registry
        </h1>

        {cartCount > 0 && (
          <span className="w-fit rounded-full border border-emerald-200 bg-white px-4 py-2 text-xs font-bold uppercase tracking-wider text-emerald-700 shadow-sm">
            {cartCount} Element{cartCount === 1 ? "" : "s"} Staged
          </span>
        )}
      </div>
    </div>
  );
}

export default CartPageHeader;
