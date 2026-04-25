import { FaShoppingCart } from "react-icons/fa";

function CartPageHeader({ cartCount }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
      <h1 className="flex items-center gap-3 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
        <div className="rounded-xl bg-emerald-100 p-2.5 text-emerald-600 shadow-inner sm:p-3">
          <FaShoppingCart className="text-xl sm:text-2xl" />
        </div>
        Checkout Registry
      </h1>

      {cartCount > 0 && (
        <span className="w-fit rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-bold uppercase tracking-wider text-emerald-700 shadow-sm">
          {cartCount} Element{cartCount === 1 ? "" : "s"} Staged
        </span>
      )}
    </div>
  );
}

export default CartPageHeader;
