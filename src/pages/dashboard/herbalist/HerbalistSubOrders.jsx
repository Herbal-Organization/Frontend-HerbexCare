import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  FaArrowRight,
  FaCheckCircle,
  FaExclamationCircle,
  FaFlask,
  FaRedo,
  FaSpinner,
} from "react-icons/fa";
import useSubOrders from "../../../hooks/useSubOrders";

const normalizeSubOrderStatus = (status) => {
  const normalized = (status || "").trim().toLowerCase();

  if (normalized === "inprogress" || normalized === "in progress") {
    return "preparing";
  }

  if (normalized === "accepted") {
    return "accepted";
  }

  if (normalized === "preparing") {
    return "preparing";
  }

  if (normalized === "ready") {
    return "ready";
  }

  if (normalized === "completed") {
    return "completed";
  }

  if (
    normalized === "rejected" ||
    normalized === "cancelled" ||
    normalized === "canceled"
  ) {
    return "rejected";
  }

  return "pending";
};

const getStatusTone = (status) => {
  switch (normalizeSubOrderStatus(status)) {
    case "accepted":
      return "bg-emerald-50 border-emerald-100 text-emerald-700";
    case "preparing":
      return "bg-amber-50 border-amber-100 text-amber-700";
    case "ready":
      return "bg-sky-50 border-sky-100 text-sky-700";
    case "completed":
      return "bg-emerald-50 border-emerald-100 text-emerald-700";
    case "rejected":
      return "bg-rose-50 border-rose-100 text-rose-700";
    default:
      return "bg-slate-50 border-slate-100 text-slate-700";
  }
};

const getNextAction = (status) => {
  switch (normalizeSubOrderStatus(status)) {
    case "pending":
      return "Accepted";
    case "accepted":
      return "Preparing";
    case "preparing":
      return "Ready";
    case "ready":
      return "Completed";
    default:
      return null;
  }
};

function HerbalistSubOrders() {
  const { data, isLoading, error, refresh, setStatus } = useSubOrders();
  const [updatingId, setUpdatingId] = useState(null);

  const handleChangeStatus = async (id, newStatus) => {
    setUpdatingId(id);
    try {
      await setStatus(id, newStatus);
      toast.success("Status updated");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-extrabold">Orders / Tasks</h2>
          <p className="mt-1 text-sm text-slate-500">
            Manage only the sub-orders assigned to you.
          </p>
        </div>
        <button
          onClick={refresh}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50"
        >
          <FaRedo /> Refresh
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-6 text-slate-500">
          <FaSpinner className="animate-spin" /> Loading tasks...
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-4 text-sm font-medium text-red-700">
          <div className="flex items-center gap-2">
            <FaExclamationCircle />
            <span>{error}</span>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {data.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-8 text-sm text-slate-500">
              No tasks found.
            </div>
          ) : (
            data.map((task) => {
              const taskId = task.id || task.subOrderId;
              const status = task.status || "Pending";
              const normalizedStatus = normalizeSubOrderStatus(status);
              const nextStatus = getNextAction(status);
              const isFinal =
                normalizedStatus === "completed" ||
                normalizedStatus === "rejected";

              return (
                <div
                  key={taskId}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
                      <FaFlask className="text-emerald-600" />
                      Sub-order #{String(taskId).slice(0, 8)}
                    </div>
                    <div className="mt-2 font-bold text-slate-900">
                      {task.title ||
                        task.herbName ||
                        task.recipeName ||
                        `Task #${taskId}`}
                    </div>
                    <div className="text-sm text-slate-500">
                      {task.description || task.notes || "No description"}
                    </div>
                    <div className="mt-1 text-xs text-slate-400">
                      Customer: {task.customerName || task.patientName || "N/A"}
                    </div>
                    <div
                      className="mt-2 inline-flex rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-widest shadow-sm ${getStatusTone(
                      status,
                    )}"
                    >
                      {status}
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-2 sm:mt-0 sm:justify-end">
                    <Link
                      to={`${taskId}`}
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-100"
                    >
                      View details <FaArrowRight />
                    </Link>
                    {nextStatus ? (
                      <button
                        onClick={() => handleChangeStatus(taskId, nextStatus)}
                        disabled={updatingId === taskId}
                        className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 transition-colors hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {updatingId === taskId
                          ? "Updating..."
                          : `Mark ${nextStatus}`}
                      </button>
                    ) : null}
                    {!isFinal ? (
                      <button
                        onClick={() => handleChangeStatus(taskId, "Rejected")}
                        disabled={updatingId === taskId}
                        className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700 transition-colors hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Reject
                      </button>
                    ) : null}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

export default HerbalistSubOrders;
