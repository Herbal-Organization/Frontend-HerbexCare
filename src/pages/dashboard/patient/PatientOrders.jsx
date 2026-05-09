import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaBox,
  FaExclamationCircle,
  FaShoppingBag,
  FaChevronRight,
} from "react-icons/fa";
import { getAllMyOrders } from "../../../api/orders";

function extractOrdersArray(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
}

const normalizeStatus = (status) => (status || "").trim().toLowerCase();

const getStatusColor = (status) => {
  const normalized = normalizeStatus(status);
  switch (normalized) {
    case "paid":
    case "confirmed":
    case "completed":
      return "bg-emerald-100 text-emerald-800";
    case "pending":
      return "bg-amber-100 text-amber-800";
    case "processing":
      return "bg-blue-100 text-blue-800";
    case "canceled":
    case "cancelled":
      return "bg-red-100 text-red-800";
    default:
      return "bg-slate-100 text-slate-800";
  }
};

const getStatusIcon = (status) => {
  const normalized = normalizeStatus(status);
  if (normalized === "completed") return "✓";
  if (normalized === "pending") return "⏳";
  if (normalized === "canceled" || normalized === "cancelled") return "✕";
  return "○";
};

function PatientOrders() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setIsLoading(true);
        setError("");
        const response = await getAllMyOrders();
        setOrders(extractOrdersArray(response));
      } catch (err) {
        setError(
          err.response?.data?.message ||
            err.response?.data?.title ||
            "Unable to load orders right now. Please try again later.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadOrders();
  }, []);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center py-20">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-500 shadow-sm" />
          <p className="mt-6 text-sm font-bold uppercase tracking-widest text-slate-400">
            Loading Orders
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center py-20">
          <FaExclamationCircle className="h-12 w-12 text-red-500" />
          <p className="mt-4 text-center text-slate-600">{error}</p>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center py-20">
          <FaShoppingBag className="h-12 w-12 text-slate-300" />
          <p className="mt-4 text-slate-500">No orders found</p>
          <p className="mt-2 text-sm text-slate-400">
            Start shopping to create your first order
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center gap-3">
        <FaBox className="h-8 w-8 text-emerald-600" />
        <h1 className="text-3xl font-bold text-slate-900">My Orders</h1>
      </div>

      <div className="space-y-4">
        {orders.map((order) => {
          const orderId = order.orderId || order.id;
          const orderDate = new Date(order.orderDate || order.createdAt);
          const formattedDate = orderDate.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          });
          const totalPrice = order.totalPrice || order.total || 0;
          const status = order.status || "Pending";
          const itemCount =
            (Array.isArray(order.recipes) ? order.recipes.length : 0) +
            (Array.isArray(order.herbs) ? order.herbs.length : 0) +
            (Array.isArray(order.aiRecipes) ? order.aiRecipes.length : 0);

          return (
            <Link
              key={orderId}
              to={`/patient/dashboard/orders/${orderId}`}
              className="block rounded-lg border border-slate-200 bg-white p-6 transition-all hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-4">
                    <div>
                      <h3 className="font-semibold text-slate-900">
                        Order #{orderId}
                      </h3>
                      <p className="text-sm text-slate-500">{formattedDate}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-slate-900">
                        {totalPrice.toFixed(2)} EGP
                      </p>
                      <p className="text-sm text-slate-500">
                        {itemCount} item{itemCount !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span
                    className={`inline-block rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(status)}`}
                  >
                    {getStatusIcon(status)} {status}
                  </span>
                  <FaChevronRight className="h-5 w-5 text-slate-400" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default PatientOrders;
