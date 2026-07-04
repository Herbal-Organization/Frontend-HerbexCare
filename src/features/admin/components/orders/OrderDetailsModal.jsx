import { FaTimes } from "react-icons/fa";

const statusColor = (status) => {
  const s = String(status || "").toLowerCase();
  if (s === "completed")
    return "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400";
  if (s === "approved")
    return "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400";
  if (s === "pending")
    return "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400";
  if (s === "rejected" || s === "cancelled")
    return "bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-400";
  return "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300";
};

function OrderDetailsModal({ isOpen, order, onClose }) {
  if (!isOpen || !order) return null;

  const subOrders = Array.isArray(order.subOrders) ? order.subOrders : [];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-4 backdrop-blur-sm sm:items-center">
      <div className="w-full max-w-3xl overflow-hidden rounded-4xl border border-slate-200 bg-white shadow-xl max-h-[90vh] flex flex-col">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 bg-slate-50 px-6 py-5 shrink-0">
          <div className="min-w-0">
            <p className="text-[11px] font-black uppercase tracking-[0.22em] text-emerald-700">
              Order Details
            </p>
            <h2 className="mt-2 truncate text-xl font-black text-slate-900">
              Order #{order.orderId ?? order.id}
            </h2>
            <div className="mt-1 flex flex-wrap gap-2 text-sm text-slate-500">
              <span
                className={`inline-flex rounded-full px-3 py-1 text-xs font-black uppercase tracking-wide ${statusColor(order.status || order.orderStatus)}`}
              >
                {order.status || order.orderStatus || "Unknown"}
              </span>
              {order.totalCost != null && (
                <span className="font-semibold">
                  Total: ${Number(order.totalCost).toFixed(2)}
                </span>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 transition-colors hover:border-rose-200 hover:text-rose-700 shrink-0"
          >
            <FaTimes />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-6 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 px-4 py-3">
              <p className="text-xs font-bold text-slate-600">Patient</p>
              <p className="mt-1 text-sm text-slate-700">
                {order.patientName || order.patientUserName || "N/A"}
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 px-4 py-3">
              <p className="text-xs font-bold text-slate-600">Date</p>
              <p className="mt-1 text-sm text-slate-700">
                {order.createdAt || order.orderDate
                  ? new Date(
                      order.createdAt || order.orderDate,
                    ).toLocaleDateString()
                  : "N/A"}
              </p>
            </div>
          </div>

          {order.shippingAddress && (
            <div className="rounded-2xl bg-slate-50 px-4 py-3">
              <p className="text-xs font-bold text-slate-600">
                Shipping Address
              </p>
              <p className="mt-1 text-sm text-slate-700">
                {order.shippingAddress}
              </p>
            </div>
          )}

          {subOrders.length > 0 && (
            <div className="rounded-2xl border border-slate-200 p-4">
              <p className="text-xs font-bold text-slate-600 mb-3">
                Sub-Orders ({subOrders.length})
              </p>
              <div className="space-y-3">
                {subOrders.map((sub, i) => (
                  <div
                    key={sub.subOrderId || i}
                    className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        {sub.herbalistName ||
                          sub.herbalistUserName ||
                          `Sub-order #${sub.subOrderId || i + 1}`}
                      </p>
                      <span
                        className={`inline-flex mt-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${statusColor(sub.status || sub.subOrderStatus)}`}
                      >
                        {sub.status || sub.subOrderStatus || "\u2014"}
                      </span>
                    </div>
                    {sub.totalPrice != null && (
                      <p className="text-sm font-bold text-slate-700">
                        ${Number(sub.totalPrice).toFixed(2)}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default OrderDetailsModal;
