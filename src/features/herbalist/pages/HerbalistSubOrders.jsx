import React from "react";
import { FaBoxOpen, FaExclamationCircle, FaSpinner } from "react-icons/fa";
import useHerbalistOrders from "../hooks/useHerbalistOrders";
import HerbalistOrderCard from "@components/common/HerbalistOrderCard";

function HerbalistSubOrders() {
  const { orders, isLoading, error } = useHerbalistOrders();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">
          Orders / Preparation Tasks
        </h2>
        <p className="mt-2 text-sm text-slate-500 sm:text-base">
          Manage customer herb orders from intake through delivery.
        </p>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm font-semibold text-rose-700 shadow-sm">
          <FaExclamationCircle className="me-2 inline" />
          Failed to load orders. Please try again later.
        </div>
      )}

      {isLoading ? (
        <div className="flex h-64 flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white shadow-lg">
          <FaSpinner className="animate-spin text-3xl text-emerald-600" />
          <p className="mt-4 text-sm font-bold uppercase tracking-widest text-slate-400">
            Loading orders
          </p>
        </div>
      ) : orders.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white px-6 text-center shadow-sm">
          <FaBoxOpen className="text-5xl text-slate-300" />
          <h3 className="mt-4 text-xl font-extrabold text-slate-800">
            No orders yet
          </h3>
          <p className="mt-2 max-w-md text-sm text-slate-500">
            New customer orders assigned to your inventory will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {orders.map((order) => (
            <HerbalistOrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}

export default HerbalistSubOrders;
