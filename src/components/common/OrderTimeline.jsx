import React from "react";
import {
  FaCheck,
  FaClipboardList,
  FaExclamationTriangle,
  FaFlask,
  FaHome,
  FaTimes,
  FaTruck,
} from "react-icons/fa";

const normalize = (status) => (status || "").trim().toLowerCase();

// Canonical patient-facing journey, mapped from the backend OrderStatus enum:
// Pending → Processing → Shipped(/PartiallyShipped) → Delivered(/PartiallyDelivered).
const STEPS = [
  { key: "pending", label: "Pending", icon: FaClipboardList },
  { key: "processing", label: "Processing", icon: FaFlask },
  { key: "shipped", label: "Shipped", icon: FaTruck },
  { key: "delivered", label: "Delivered", icon: FaHome },
];

const STATUS_TO_STEP = {
  pending: 0,
  processing: 1,
  shipped: 2,
  partiallyshipped: 2,
  delivered: 3,
  partiallydelivered: 3,
};

const isFullyCancelled = (status) => normalize(status) === "cancelled" || normalize(status) === "canceled";
const isPartiallyCancelled = (status) => normalize(status) === "partiallycancelled";
const isPartial = (status) =>
  ["partiallyshipped", "partiallydelivered", "partiallycancelled"].includes(
    normalize(status),
  );

const OrderTimeline = ({ status }) => {
  if (isFullyCancelled(status)) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-5 dark:border-rose-900/50 dark:bg-rose-950/40">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-500 text-white">
          <FaTimes />
        </span>
        <div>
          <p className="text-sm font-black uppercase tracking-widest text-rose-700 dark:text-rose-300">
            Order Cancelled
          </p>
          <p className="text-xs font-semibold text-rose-500 dark:text-rose-400">
            This order is no longer being processed.
          </p>
        </div>
      </div>
    );
  }

  const currentStep = STATUS_TO_STEP[normalize(status)] ?? 0;
  const activeIndex = Math.min(currentStep, STEPS.length - 1);
  const progressPct = (activeIndex / (STEPS.length - 1)) * 100;

  return (
    <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-6 shadow-sm dark:border-slate-700 dark:from-slate-800 dark:to-slate-900 sm:p-8">
      {(isPartial(status) || isPartiallyCancelled(status)) && (
        <div className="mb-5 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-xs font-bold text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300">
          <FaExclamationTriangle className="shrink-0" />
          {isPartiallyCancelled(status)
            ? "Part of this order was cancelled — the rest is still being fulfilled."
            : "This order is being fulfilled in parts by different herbalists."}
        </div>
      )}

      <div className="relative">
        <div className="absolute left-0 right-0 top-5 h-1 rounded-full bg-slate-200 dark:bg-slate-700" />
        <div
          className="absolute left-0 top-5 h-1 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-700"
          style={{ width: `${progressPct}%` }}
        />

        <ol className="relative flex justify-between">
          {STEPS.map((step, index) => {
            const isDone = index < activeIndex;
            const isCurrent = index === activeIndex;
            const Icon = step.icon;
            return (
              <li
                key={step.key}
                className="flex flex-col items-center gap-2 text-center"
              >
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm transition-all duration-500 ${
                    isDone || isCurrent
                      ? "border-emerald-500 bg-emerald-500 text-white shadow-lg shadow-emerald-500/30"
                      : "border-slate-200 bg-white text-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-600"
                  } ${isCurrent ? "scale-110 ring-4 ring-emerald-500/20" : ""}`}
                >
                  {isDone ? <FaCheck /> : <Icon />}
                </span>
                <span
                  className={`text-[10px] font-black uppercase tracking-wider sm:text-xs ${
                    isDone || isCurrent
                      ? "text-emerald-700 dark:text-emerald-400"
                      : "text-slate-400 dark:text-slate-500"
                  }`}
                >
                  {step.label}
                </span>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
};

export default OrderTimeline;
