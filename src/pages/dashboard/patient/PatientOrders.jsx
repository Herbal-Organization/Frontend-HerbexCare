import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaShoppingBag,
  FaArrowRight,
  FaSpinner,
  FaCalendar,
  FaExclamationCircle,
  FaTimes,
  FaCheckCircle,
  FaStar,
} from "react-icons/fa";
import {
  getMyOrders,
  cancelOrder,
  markOrderAsFavorite,
  getFavoriteOrders,
} from "../../../api/orders";
import { toast } from "react-hot-toast";

function PatientOrders() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancellingOrderId, setCancellingOrderId] = useState(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelError, setCancelError] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);
  const [activeView, setActiveView] = useState("all"); // "all" or "favorites"
  const [favoriteIds, setFavoriteIds] = useState(new Set());

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await getMyOrders();
        setOrders(Array.isArray(data) ? data : data?.items || []);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            err.response?.data?.title ||
            "Unable to retrieve order history at this time.",
        );
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleToggleFavorite = async (orderId) => {
    try {
      await markOrderAsFavorite(orderId);
      setFavoriteIds((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(orderId)) {
          newSet.delete(orderId);
          toast.success("Removed from favorites");
        } else {
          newSet.add(orderId);
          toast.success("Added to favorites");
        }
        return newSet;
      });
    } catch (err) {
      console.error("Failed to toggle favorite", err);
      toast.error("Failed to update favorite status");
    }
  };

  const displayedOrders = orders.filter((order) => {
    if (activeView === "favorites") {
      return favoriteIds.has(order.orderId || order.id);
    }
    return true;
  });

  const handleCancelClick = (orderId) => {
    setCancellingOrderId(orderId);
    setCancelError("");
    setShowCancelConfirm(true);
  };

  const handleConfirmCancel = async () => {
    setIsCancelling(true);
    setCancelError("");
    try {
      await cancelOrder(cancellingOrderId);
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          (order.orderId || order.id) === cancellingOrderId
            ? { ...order, status: "Cancelled" }
            : order,
        ),
      );
      toast.success("Order cancelled successfully!");
      setShowCancelConfirm(false);
      setCancellingOrderId(null);
    } catch (err) {
      console.error("Failed to cancel order", err);
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.title ||
        "Failed to cancel order. Please try again.";
      setCancelError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsCancelling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center py-20">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-500 shadow-sm" />
          <p className="mt-6 text-sm font-bold uppercase tracking-widest text-slate-400">
            Loading Configuration
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-10 flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3 drop-shadow-sm">
          <div className="rounded-xl bg-emerald-100 p-3 text-emerald-600 shadow-inner">
            <FaShoppingBag className="text-2xl" />
          </div>
          Active Prescriptions & Orders
        </h1>
        <p className="text-lg font-medium text-slate-500">
          Track the execution state of your medical requisitions securely.
        </p>
      </div>

      {error && (
        <div className="mb-8 rounded-4xl border border-red-100 bg-red-50 p-8 shadow-sm text-center">
          <FaExclamationCircle className="mx-auto text-4xl text-red-400 mb-4" />
          <p className="text-lg font-bold text-red-700">{error}</p>
        </div>
      )}

      {!error && orders.length > 0 && (
        <div className="mb-6 flex gap-3 items-center">
          <button
            onClick={() => setActiveView("all")}
            className={`px-4 py-2 rounded-lg font-bold transition-all ${
              activeView === "all"
                ? "bg-emerald-600 text-white shadow-md"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            All Orders ({orders.length})
          </button>
          <button
            onClick={() => setActiveView("favorites")}
            className={`px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-2 ${
              activeView === "favorites"
                ? "bg-amber-600 text-white shadow-md"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            <FaStar /> Favorites ({favoriteIds.size})
          </button>
        </div>
      )}

      {!error && displayedOrders.length === 0 && orders.length > 0 ? (
        <div className="flex flex-col items-center justify-center rounded-[3rem] border-2 border-dashed border-slate-200 bg-slate-50/50 py-24 text-center shadow-sm">
          <FaShoppingBag className="text-5xl text-slate-300 mb-6" />
          <h2 className="text-2xl font-bold text-slate-700">
            {activeView === "favorites"
              ? "No Favorite Orders Yet"
              : "No Orders Placed Yet"}
          </h2>
          <p className="mt-2 text-slate-500 mb-8 max-w-sm font-medium">
            You do not currently have any active processing histories tied to
            your cryptographic token.
          </p>
          <Link
            to="/patient/home"
            className="rounded-full bg-slate-900 px-6 py-3 text-sm font-bold text-white transition-all hover:bg-slate-800 hover:-translate-y-0.5 shadow-md"
          >
            Start Browsing
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {displayedOrders.map((order) => {
            const orderId = order.orderId || order.id;
            const dateStr =
              order.orderDate || order.createdAt || new Date().toISOString();

            return (
              <div
                key={orderId}
                className="group relative flex flex-col overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white p-7 shadow-sm transition-all hover:shadow-[0_10px_40px_rgb(0,0,0,0.06)] hover:border-emerald-200"
              >
                <div className="absolute inset-0 bg-linear-to-br from-emerald-50/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none" />

                <div className="flex items-center justify-between mb-5 relative z-10">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-slate-500 border border-slate-200">
                    ID: #{orderId.toString().substring(0, 8)}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleFavorite(orderId)}
                      className={`p-2 rounded-full transition-all ${
                        favoriteIds.has(orderId)
                          ? "bg-amber-100 text-amber-600 shadow-md"
                          : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                      }`}
                      title={
                        favoriteIds.has(orderId)
                          ? "Remove from favorites"
                          : "Add to favorites"
                      }
                    >
                      <FaStar className="text-lg" />
                    </button>

                    {order.status && (
                      <span
                        className={`rounded-full px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest shadow-sm border ${
                          order.status.toLowerCase().includes("cancel")
                            ? "bg-rose-50 border-rose-100 text-rose-600"
                            : order.status.toLowerCase().includes("process")
                              ? "bg-amber-50 border-amber-100 text-amber-600"
                              : "bg-emerald-50 border-emerald-100 text-emerald-600"
                        }`}
                      >
                        {order.status}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex-1 relative z-10 mb-6">
                  <p className="flex items-center gap-2 text-xs font-bold text-slate-400 mb-1">
                    <FaCalendar /> {new Date(dateStr).toLocaleDateString()}
                  </p>
                  <p className="text-base font-bold text-slate-800 line-clamp-2">
                    {order.itemsCount ||
                      (order.herbs?.length || 0) +
                        (order.recipes?.length || 0)}{" "}
                    Operational Target
                    {(order.herbs?.length || 0) +
                      (order.recipes?.length || 0) ===
                    1
                      ? ""
                      : "s"}
                  </p>
                </div>

                <Link
                  to={`/patient/dashboard/orders/${orderId}`}
                  className="relative z-10 mt-auto flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-xs font-bold text-white transition-all hover:bg-slate-800 focus:ring-4 focus:ring-slate-900/10 hover:shadow-lg hover:-translate-y-0.5"
                >
                  Inspect Order Manifest <FaArrowRight />
                </Link>

                {!order.status?.toLowerCase().includes("cancel") && (
                  <button
                    onClick={() => handleCancelClick(orderId)}
                    className="relative z-10 mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-xs font-bold text-rose-600 transition-all hover:bg-rose-100 focus:ring-4 focus:ring-rose-500/10 hover:shadow-lg hover:-translate-y-0.5"
                  >
                    <FaTimes /> Cancel Order
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showCancelConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="mx-4 max-w-md rounded-3xl bg-white p-8 shadow-2xl">
            <div className="flex justify-center mb-4">
              <div
                className={`rounded-full p-4 ${
                  cancelError
                    ? "bg-red-100 text-red-600"
                    : "bg-rose-100 text-rose-600"
                }`}
              >
                <FaExclamationCircle className="text-2xl" />
              </div>
            </div>

            <h3 className="text-center text-xl font-bold text-slate-900 mb-2">
              {cancelError ? "Cannot Cancel Order" : "Cancel Order?"}
            </h3>

            {cancelError ? (
              <div className="mb-6">
                <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700">
                  <p className="font-semibold mb-2">
                    Cancellation Not Allowed:
                  </p>
                  <p>{cancelError}</p>
                </div>
                <p className="text-center text-xs text-slate-500 mt-4">
                  Please contact support if you believe this is an error.
                </p>
              </div>
            ) : (
              <p className="text-center text-sm text-slate-600 mb-6">
                Are you sure you want to cancel this order? This action cannot
                be undone.
              </p>
            )}

            <div className="flex gap-3">
              {cancelError ? (
                <button
                  onClick={() => setShowCancelConfirm(false)}
                  className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white transition-all hover:bg-slate-800 focus:ring-4 focus:ring-slate-500/10"
                >
                  Understood
                </button>
              ) : (
                <>
                  <button
                    onClick={() => setShowCancelConfirm(false)}
                    className="flex-1 rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition-all hover:bg-slate-50 focus:ring-4 focus:ring-slate-500/10 disabled:opacity-50"
                    disabled={isCancelling}
                  >
                    Keep Order
                  </button>

                  <button
                    onClick={handleConfirmCancel}
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-3 text-sm font-bold text-white transition-all hover:bg-rose-700 focus:ring-4 focus:ring-rose-500/10 disabled:opacity-50"
                    disabled={isCancelling}
                  >
                    {isCancelling ? (
                      <>
                        <FaSpinner className="animate-spin" /> Cancelling...
                      </>
                    ) : (
                      <>
                        <FaTimes /> Cancel Order
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PatientOrders;
