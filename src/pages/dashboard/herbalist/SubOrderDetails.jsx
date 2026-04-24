import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import useSubOrders from "../../../hooks/useSubOrders";

function SubOrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getById, setStatus } = useSubOrders();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const resp = await getById(id);
        setItem(resp || null);
      } catch (err) {
        toast.error("Failed to load task");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, getById]);

  const handleStatusChange = async (newStatus) => {
    setUpdating(true);
    try {
      await setStatus(id, newStatus);
      toast.success("Status updated");
      navigate("/herbalist/dashboard/orders");
    } catch (err) {
      toast.error("Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div>Loading…</div>;
  if (!item) return <div>Task not found.</div>;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Task Details</h2>
      </div>

      <div className="rounded-xl border bg-white p-6">
        <pre className="text-xs whitespace-pre-wrap">
          {JSON.stringify(item, null, 2)}
        </pre>
      </div>

      <div className="mt-4 flex gap-3">
        <button
          onClick={() => handleStatusChange("InProgress")}
          disabled={updating}
          className="px-4 py-2 bg-amber-500 text-white rounded"
        >
          Start
        </button>
        <button
          onClick={() => handleStatusChange("Completed")}
          disabled={updating}
          className="px-4 py-2 bg-emerald-600 text-white rounded"
        >
          Complete
        </button>
        <button
          onClick={() => handleStatusChange("Cancelled")}
          disabled={updating}
          className="px-4 py-2 bg-red-500 text-white rounded"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export default SubOrderDetails;
