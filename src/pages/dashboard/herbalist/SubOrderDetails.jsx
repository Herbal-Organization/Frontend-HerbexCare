import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  FaArrowLeft,
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

function SubOrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getById, setStatus } = useSubOrders();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    let active = true;

    (async () => {
      setLoading(true);
      try {
        const resp = await getById(id);
        if (active) {
          setItem(resp || null);
        }
      } catch (_err) {
        toast.error("Failed to load task");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [id, getById]);

  const handleStatusChange = async (newStatus) => {
    setUpdating(true);
    try {
      await setStatus(id, newStatus);
      toast.success("Status updated");
      navigate("/herbalist/dashboard/orders");
    } catch (_err) {
      toast.error("Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-6 text-slate-500">
        <FaSpinner className="animate-spin" /> Loading task...
      </div>
    );
  }

  if (!item) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-8 text-sm text-slate-500">
        Task not found.
      </div>
    );
  }

  const currentStatus = item.status || "Pending";
  const normalizedStatus = normalizeSubOrderStatus(currentStatus);
  const nextStatus = getNextAction(currentStatus);
  const isFinal =
    normalizedStatus === "completed" || normalizedStatus === "rejected";

  return (
    <div>
      <button
        type="button"
        onClick={() => navigate("/herbalist/dashboard/orders")}
        className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-50"
      >
        <FaArrowLeft /> Back to tasks
      </button>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
          <FaFlask className="text-emerald-600" /> Task Details
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <div className="text-xs text-slate-500">Task ID</div>
            <div className="font-semibold">
              {item.id || item.subOrderId || id}
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-500">Status</div>
            <div className="font-semibold">{currentStatus}</div>
          </div>
          <div>
            <div className="text-xs text-slate-500">Customer</div>
            <div className="font-semibold">
              {item.customerName || item.patientName || "N/A"}
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-500">Amount</div>
            <div className="font-semibold">
              {item.totalPrice ?? item.price ?? "N/A"}
            </div>
          </div>
        </div>

        <div>
          <div className="text-xs text-slate-500">Notes</div>
          <div className="text-sm text-slate-700">
            {item.notes || item.description || "No additional notes."}
          </div>
        </div>

        <details>
          <summary className="cursor-pointer text-sm text-slate-600">
            View raw API payload
          </summary>
          <pre className="mt-2 whitespace-pre-wrap rounded bg-slate-50 p-3 text-xs">
            {JSON.stringify(item, null, 2)}
          </pre>
        </details>

        <div className="flex flex-wrap gap-3 pt-2">
          {nextStatus ? (
            <button
              onClick={() => handleStatusChange(nextStatus)}
              disabled={updating}
              className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-700 transition-colors hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {updating ? (
                <FaSpinner className="animate-spin" />
              ) : (
                <FaCheckCircle />
              )}
              Mark {nextStatus}
            </button>
          ) : null}

          {!isFinal ? (
            <button
              onClick={() => handleStatusChange("Rejected")}
              disabled={updating}
              className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-bold text-rose-700 transition-colors hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FaExclamationCircle /> Reject
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default SubOrderDetails;
