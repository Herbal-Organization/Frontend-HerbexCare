import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaCreditCard,
  FaExclamationCircle,
  FaLeaf,
  FaMapMarkerAlt,
  FaSpinner,
  FaUser,
} from "react-icons/fa";
import { getSubOrderById, updateSubOrderStatus } from "../../../api/subOrders";
import {
  getCustomerContact,
  getCustomerName,
  getItemName,
  getItemQuantityLabel,
  getItemSubtotal,
  getItemUnitPrice,
  getOrderDate,
  getOrderId,
  getOrderItems,
  getOrderTotal,
  getPaymentStatus,
  getShippingAddress,
  normalizeStatusLabel,
  normalizeStatusPayload,
  ORDER_STATUSES,
} from "../../../utils/orderWorkflow";

const formatCurrency = (value) => `${Number(value || 0).toFixed(2)} EGP`;

function SubOrderDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const loadOrder = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await getSubOrderById(id);
      setOrder(response);
    } catch (err) {
      console.error("Failed to load suborder:", {
        id,
        status: err.response?.status,
        data: err.response?.data,
        message: err.message,
      });
      setError(
        err.response?.data?.message ||
          err.response?.data?.title ||
          "Unable to load this order.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  const handleStatusChange = async (event) => {
    const nextStatus = event.target.value;
    setIsUpdating(true);
    try {
      await updateSubOrderStatus(id, normalizeStatusPayload(nextStatus));
      setOrder((current) => ({
        ...(current || {}),
        status: nextStatus,
        preparationStatus: nextStatus,
      }));
      toast.success(`Order moved to ${nextStatus}.`);
      await loadOrder();
    } catch (err) {
      console.error("Failed to update suborder status:", {
        id,
        nextStatus,
        status: err.response?.status,
        data: err.response?.data,
        message: err.message,
      });
      toast.error(
        err.response?.data?.message ||
          err.response?.data?.title ||
          "Failed to update order status.",
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const status = normalizeStatusLabel(
    order?.preparationStatus || order?.status,
  );
  const items = getOrderItems(order || {});
  const calculatedTotal = items.reduce(
    (sum, item) => sum + getItemSubtotal(item),
    0,
  );
  const total = getOrderTotal(order || {}) || calculatedTotal;
  const orderDate = getOrderDate(order || {});

  const statusBadgeClasses = {
    Pending: "bg-amber-100 text-amber-800 border-amber-200",
    Confirmed: "bg-sky-100 text-sky-800 border-sky-200",
    Preparing: "bg-indigo-100 text-indigo-800 border-indigo-200",
    Ready: "bg-emerald-100 text-emerald-800 border-emerald-200",
    Delivered: "bg-slate-100 text-slate-700 border-slate-200",
    Cancelled: "bg-rose-100 text-rose-800 border-rose-200",
  };

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={() => navigate("/herbalist/dashboard/orders")}
        className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 transition-all duration-200 hover:bg-slate-50 hover:shadow-sm"
      >
        <FaArrowLeft /> Back
      </button>

      {isLoading ? (
        <div className="flex h-64 flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white shadow-lg">
          <FaSpinner className="text-3xl text-emerald-600 animate-spin" />
          <p className="mt-4 text-sm font-bold uppercase tracking-widest text-slate-400">
            Loading order
          </p>
        </div>
      ) : error || !order ? (
        <div className="rounded-3xl border border-rose-100 bg-rose-50 p-10 text-center shadow-sm">
          <FaExclamationCircle className="mx-auto text-4xl text-rose-500" />
          <p className="mt-4 font-semibold text-rose-700">
            {error || "Order not found."}
          </p>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-start sm:justify-between">
            <div className="flex-1">
              <h1 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">
                Order #{getOrderId(order) || id}
              </h1>
              <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-slate-500">
                <FaCalendarAlt />
                {orderDate
                  ? new Date(orderDate).toLocaleString()
                  : "Date unavailable"}
              </p>
              <div className="mt-3 sm:hidden">
                <span
                  className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold transition-colors ${
                    statusBadgeClasses[status] || statusBadgeClasses.Pending
                  }`}
                >
                  {status}
                </span>
              </div>
            </div>

            <div className="w-full sm:w-auto">
              <label className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-400">
                Preparation Status
              </label>
              <select
                value={ORDER_STATUSES.includes(status) ? status : "Pending"}
                onChange={handleStatusChange}
                disabled={isUpdating}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-black text-slate-800 outline-none transition-all duration-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 disabled:opacity-60 sm:w-auto"
              >
                {ORDER_STATUSES.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
            {/* Items Section */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-5 flex items-center gap-2 border-b border-slate-100 pb-4 text-lg font-extrabold text-slate-900">
                <FaLeaf /> Ordered Herbs
              </h2>
              <div className="space-y-3">
                {items.length ? (
                  items.map((item, index) => (
                    <div
                      key={`${getItemName(item)}-${index}`}
                      className="grid gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4 transition-all duration-200 hover:bg-slate-100 hover:shadow-sm sm:grid-cols-[1fr_110px_120px_120px] sm:items-center"
                    >
                      <div>
                        <p className="font-bold text-slate-900">
                          {getItemName(item)}
                        </p>
                        <p className="mt-1 text-xs font-semibold text-slate-500">
                          {item.itemType || item.type || "Herb"}
                        </p>
                      </div>
                      <p className="text-sm font-bold text-slate-700">
                        {getItemQuantityLabel(item)}
                      </p>
                      <p className="text-sm font-bold text-slate-700">
                        {formatCurrency(getItemUnitPrice(item))}
                      </p>
                      <p className="text-sm font-black text-emerald-700">
                        {formatCurrency(getItemSubtotal(item))}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-amber-100 bg-amber-50 p-5 text-sm font-semibold text-amber-800">
                    Item details are not included in this backend response.
                  </div>
                )}
              </div>
            </div>

            {/* Customer & Payment Section */}
            <div className="space-y-6">
              {/* Customer Info */}
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="mb-5 flex items-center gap-2 border-b border-slate-100 pb-4 text-lg font-extrabold text-slate-900">
                  <FaUser /> Customer
                </h2>
                <div className="space-y-4">
                  <div>
                    <p className="font-bold text-slate-900">
                      {getCustomerName(order)}
                    </p>
                    {getCustomerContact(order) ? (
                      <p className="mt-2 text-sm font-semibold text-slate-500">
                        {getCustomerContact(order)}
                      </p>
                    ) : null}
                  </div>

                  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <p className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400">
                      <FaMapMarkerAlt /> Shipping
                    </p>
                    <p className="whitespace-pre-wrap text-sm font-semibold text-slate-700">
                      {getShippingAddress(order) ||
                        "Shipping address unavailable"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Payment Info */}
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="mb-5 flex items-center gap-2 border-b border-slate-100 pb-4 text-lg font-extrabold text-slate-900">
                  <FaCreditCard /> Payment
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-500">
                      Status
                    </span>
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-black text-slate-700">
                      {getPaymentStatus(order)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                    <span className="text-sm font-black uppercase tracking-widest text-emerald-800">
                      Total
                    </span>
                    <span className="text-xl font-black text-emerald-700">
                      {formatCurrency(total)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default SubOrderDetails;
