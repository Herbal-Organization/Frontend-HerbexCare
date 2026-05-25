import React from "react";
import { Link } from "react-router-dom";
import { FaBox, FaChevronRight, FaUser } from "react-icons/fa";
import StatusBadge from "./StatusBadge";

const HerbalistOrderCard = ({ order }) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-300 hover:border-emerald-300 hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <FaBox />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800">
              Order #{order.id}
            </p>
            <p className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <FaUser />
              {order.customer.name}
            </p>
          </div>
        </div>
        <StatusBadge status={order.status} />
      </div>
      <div className="mt-4 flex items-center justify-between rounded-lg bg-slate-50 p-3">
        <div>
          <p className="text-xs font-medium text-slate-500">Total</p>
          <p className="font-bold text-slate-800">{order.subTotal} EGP</p>
        </div>
        <Link
          to={`/herbalist/dashboard/orders/${order.id}`}
          className="flex items-center gap-1.5 rounded-md bg-emerald-500 px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-emerald-600"
        >
          Details
          <FaChevronRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
};

export default HerbalistOrderCard;
