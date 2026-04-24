import { useState } from "react";
import { toast } from "react-hot-toast";
import useSubOrders from "../../../hooks/useSubOrders";
import { Link } from "react-router-dom";

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
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-extrabold">Orders / Tasks</h2>
        <div>
          <button
            onClick={refresh}
            className="text-sm text-slate-600 underline"
          >
            Refresh
          </button>
        </div>
      </div>

      {isLoading ? (
        <div>Loading…</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : (
        <div className="space-y-4">
          {data.length === 0 ? (
            <div className="text-sm text-slate-500">No tasks found.</div>
          ) : (
            data.map((task) => (
              <div
                key={task.id || task.subOrderId}
                className="rounded-xl p-4 border bg-white flex items-center justify-between"
              >
                <div>
                  <div className="font-bold">
                    {task.title || `Task #${task.id || task.subOrderId}`}
                  </div>
                  <div className="text-sm text-slate-500">
                    {task.description || task.notes || "No description"}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    Customer: {task.customerName || task.patientName || "N/A"}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Link
                    to={`${task.id || task.subOrderId}`}
                    className="text-xs underline"
                  >
                    View
                  </Link>
                  <select
                    value={task.status || ""}
                    onChange={(e) =>
                      handleChangeStatus(
                        task.id || task.subOrderId,
                        e.target.value,
                      )
                    }
                    disabled={updatingId === (task.id || task.subOrderId)}
                    className="rounded border px-2 py-1 text-sm"
                  >
                    <option value="">-- Status --</option>
                    <option value="Pending">Pending</option>
                    <option value="InProgress">InProgress</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default HerbalistSubOrders;
