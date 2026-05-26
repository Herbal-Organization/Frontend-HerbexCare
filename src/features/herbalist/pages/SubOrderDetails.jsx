import React from "react";
import { useNavigate, useParams } from "react-router-dom";
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
import useHerbalistOrder from "../hooks/useHerbalistOrder";
import HerbOrderItem from "../components/HerbOrderItem";
import StatusBadge from "@components/common/StatusBadge";

const formatCurrency = (value) => `${Number(value || 0).toFixed(2)} EGP`;

function SubOrderDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { order, isLoading, error } = useHerbalistOrder(id);
  const herbItems = Array.isArray(order?.items)
    ? order.items.filter((item) => item.herbId)
    : [];

  if (isLoading) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white shadow-lg">
        <FaSpinner className="animate-spin text-3xl text-emerald-600" />
        <p className="mt-4 text-sm font-bold uppercase tracking-widest text-slate-400">
          Loading order
        </p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="rounded-3xl border border-rose-100 bg-rose-50 p-10 text-center shadow-sm">
        <FaExclamationCircle className="mx-auto text-4xl text-rose-500" />
        <p className="mt-4 font-semibold text-rose-700">
          {error ? "Failed to load order." : "Order not found."}
        </p>
        <button
          onClick={() => navigate("/herbalist/dashboard/orders")}
          className="mt-4 text-sm font-bold text-emerald-600 underline"
        >
          Back to Orders
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={() => navigate("/herbalist/dashboard/orders")}
        className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 transition-all duration-200 hover:bg-slate-50 hover:shadow-sm"
      >
        <FaArrowLeft /> Back
      </button>

      <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-start sm:justify-between">
        <div className="flex-1">
          <h1 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">
            Order #{order.id}
          </h1>
          <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-slate-500">
            <FaCalendarAlt />
            {new Date(order.date).toLocaleString()}
          </p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-5 flex items-center gap-2 border-b border-slate-100 pb-4 text-lg font-extrabold text-slate-900">
            <FaLeaf /> Ordered Herbs
          </h2>
          {herbItems.length > 0 ? (
            <div className="space-y-3">
              {herbItems.map((item, index) => (
                <HerbOrderItem key={index} item={item} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center">
              <p className="text-sm font-bold text-slate-600">
                No herbs in the order.
              </p>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-5 flex items-center gap-2 border-b border-slate-100 pb-4 text-lg font-extrabold text-slate-900">
              <FaUser /> Customer
            </h2>
            <p className="font-bold text-slate-900">{order.customer.name}</p>
            <p className="mt-2 text-sm font-semibold text-slate-500">
              {order.customer.contact}
            </p>
            <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <p className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400">
                <FaMapMarkerAlt /> Shipping
              </p>
              <p className="whitespace-pre-wrap text-sm font-semibold text-slate-700">
                {order.customer.address}
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-5 flex items-center gap-2 border-b border-slate-100 pb-4 text-lg font-extrabold text-slate-900">
              <FaCreditCard /> Payment
            </h2>
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-500">Status</span>
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-black text-slate-700">
                {order.paymentStatus}
              </span>
            </div>
            <div className="mt-4 flex items-center justify-between rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
              <span className="text-sm font-black uppercase tracking-widest text-emerald-800">
                Total
              </span>
              <span className="text-xl font-black text-emerald-700">
                {formatCurrency(order.subTotal)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SubOrderDetails;
