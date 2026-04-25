import {
  FaMapMarkerAlt,
  FaCreditCard,
  FaCheckCircle,
  FaSpinner,
} from "react-icons/fa";

function CheckoutPanel({
  shippingAddress,
  paymentMethod,
  isSubmitting,
  error,
  onAddressChange,
  onPaymentChange,
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 lg:rounded-[2.5rem] lg:p-8">
      <h2 className="mb-6 flex items-center gap-2 text-lg font-extrabold text-slate-900">
        Logistics & Verification
      </h2>

      {error && (
        <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-bold text-red-600">
          {error}
        </div>
      )}

      <div className="space-y-6">
        <div>
          <label className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500">
            <FaMapMarkerAlt />
            Shipping Address
          </label>
          <textarea
            value={shippingAddress}
            onChange={(event) => onAddressChange(event.target.value)}
            placeholder="24th Medical Quarter Ave, Suite B..."
            className="min-h-28 w-full rounded-2xl border-2 border-slate-200/50 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition-all placeholder:font-medium placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500">
            <FaCreditCard />
            Payment Method
          </label>
          <div className="relative">
            <select
              value={paymentMethod}
              onChange={(event) => onPaymentChange(event.target.value)}
              className="w-full appearance-none rounded-2xl border-2 border-slate-200/50 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
              disabled={isSubmitting}
            >
              <option value="" disabled>
                Select payment method
              </option>
              <option value="Cash">Cash</option>
              <option value="Wallet">Wallet</option>
              <option value="CreditCard">Credit Card</option>
            </select>
          </div>
        </div>
      </div>

      <div className="mt-8 border-t border-slate-100 pt-6">
        <button
          type="submit"
          disabled={isSubmitting || !shippingAddress.trim() || !paymentMethod}
          className="group relative flex h-14 w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-emerald-600 px-6 font-bold text-white shadow-lg transition-all hover:bg-emerald-500 hover:shadow-emerald-500/20 disabled:pointer-events-none disabled:opacity-50"
        >
          {isSubmitting ? (
            <FaSpinner className="text-xl animate-spin" />
          ) : (
            <>
              <FaCheckCircle className="text-xl opacity-90 transition-transform group-hover:scale-110" />
              Placed Order
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default CheckoutPanel;
