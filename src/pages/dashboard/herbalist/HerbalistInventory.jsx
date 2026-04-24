import { useEffect, useMemo, useState } from "react";
import {
  FaBoxOpen,
  FaEdit,
  FaTrashAlt,
  FaTimes,
  FaLeaf,
  FaTags,
  FaCheckCircle,
  FaExclamationCircle,
} from "react-icons/fa";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "motion/react";
import { getAllHerbs } from "../../../api/herbs";
import {
  addHerbToInventory,
  deleteInventoryHerb,
  getMyInventory,
  updateInventoryHerb,
} from "../../../api/inventory";
import { normalizeHerb } from "../../../services/herbs";
import { normalizeInventoryList } from "../../../services/inventory";

const INITIAL_FORM = {
  herbId: "",
  pricePerKilo: "",
  isActive: true,
};

const extractInventoryArray = (responseData) => {
  if (Array.isArray(responseData)) return responseData;
  if (Array.isArray(responseData?.items)) return responseData.items;
  if (Array.isArray(responseData?.data)) return responseData.data;
  return [];
};

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
};

function HerbalistInventory() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [editingItem, setEditingItem] = useState(null);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [allHerbs, setAllHerbs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadInventoryData = async () => {
    setIsLoading(true);
    try {
      const [inventoryResponse, herbsResponse] = await Promise.all([
        getMyInventory(),
        getAllHerbs(),
      ]);

      const normalizedInventory = normalizeInventoryList(
        extractInventoryArray(inventoryResponse),
      );
      const normalizedHerbs = Array.isArray(herbsResponse)
        ? herbsResponse.map(normalizeHerb)
        : [];

      setInventoryItems(normalizedInventory);
      setAllHerbs(normalizedHerbs);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.title ||
        "Failed to load inventory.";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInventoryData();
  }, []);

  const occupiedHerbIds = useMemo(() => {
    const occupied = new Set(
      inventoryItems
        .map((item) => Number(item.herbId))
        .filter((value) => Number.isFinite(value)),
    );

    if (editingItem?.herbId) {
      occupied.delete(Number(editingItem.herbId));
    }

    return occupied;
  }, [editingItem?.herbId, inventoryItems]);

  const availableHerbs = useMemo(() => {
    return allHerbs.filter(
      (herb) => !occupiedHerbIds.has(Number(herb.herbId || herb.id)),
    );
  }, [allHerbs, occupiedHerbIds]);

  const resetForm = () => {
    setForm(INITIAL_FORM);
    setEditingItem(null);
  };

  const startEditing = (item) => {
    setEditingItem(item);
    setForm({
      herbId: String(item.herbId || ""),
      pricePerKilo: item.pricePerKilo == null ? "" : String(item.pricePerKilo),
      isActive: Boolean(item.isActive),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const herbId = Number(form.herbId);
    const pricePerKilo = Number(form.pricePerKilo);

    if (!Number.isFinite(herbId) || herbId <= 0) {
      toast.error("Please select a valid herb.");
      return;
    }

    if (!Number.isFinite(pricePerKilo) || pricePerKilo <= 0) {
      toast.error("Price per kilo must be a valid positive number.");
      return;
    }

    setIsSaving(true);
    try {
      if (editingItem) {
        const inventoryId = editingItem.inventoryId || editingItem.id;

        // Validate inventoryId
        if (!Number.isFinite(Number(inventoryId))) {
          throw new Error(
            `Invalid inventory ID: ${inventoryId}. Cannot proceed with update.`,
          );
        }

        // Log the data being sent for debugging
        console.log("Updating inventory with:", {
          inventoryId: Number(inventoryId),
          payload: { pricePerKilo, isActive: Boolean(form.isActive) },
        });

        await updateInventoryHerb(inventoryId, {
          pricePerKilo,
          isActive: Boolean(form.isActive),
        });
        toast.success("Inventory updated seamlessly!");
      } else {
        await addHerbToInventory({ herbId, pricePerKilo });
        toast.success("Herb securely added to inventory!");
      }

      resetForm();
      await loadInventoryData();
    } catch (err) {
      // Get detailed error information
      const errorData = err.response?.data;
      let message = `Failed to ${editingItem ? "update" : "add"} inventory item.`;

      if (errorData?.message) {
        message = errorData.message;
      } else if (errorData?.title) {
        message = errorData.title;
      } else if (err.message) {
        message = err.message;
      }

      // Log full error for debugging
      console.error("API Error:", {
        status: err.response?.status,
        data: errorData,
        message,
      });

      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (item) => {
    if (
      !window.confirm(
        `Are you absolutely sure you want to remove ${item.herbName} from your inventory?`,
      )
    ) {
      return;
    }

    setIsDeleting(true);
    try {
      const inventoryId = item.inventoryId || item.id;
      await deleteInventoryHerb(inventoryId);
      toast.success("Herb removed from inventory.");
      await loadInventoryData();
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.title ||
        "Failed to delete inventory item.";
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  };

  const hasSelectableHerb =
    Boolean(form.herbId) || availableHerbs.length > 0 || Boolean(editingItem);

  return (
    <div className="space-y-8 relative min-h-full overflow-x-hidden overflow-y-visible">
      {/* Dynamic Background Blur Effects */}
      <div className="pointer-events-none absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-emerald-400/10 blur-[120px] mix-blend-multiply"></div>
      <div className="pointer-events-none absolute top-40 -left-20 h-[400px] w-[400px] rounded-full bg-teal-400/10 blur-[100px] mix-blend-multiply"></div>

      {/* Form Section */}
      <div className="relative z-10">
        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-white/60 bg-white shadow-[0_4px_20px_rgb(0,0,0,0.03)] backdrop-blur-xl p-8"
        >
          <div className="mb-8">
            <h2 className="text-2xl font-extrabold text-slate-900">
              {editingItem
                ? "Update Inventory Item"
                : "Add New Herb to Inventory"}
            </h2>
            <p className="mt-2 text-sm font-medium text-slate-600">
              {editingItem
                ? "Modify the price and availability status for this herb."
                : "Select a global herb and set its price per kilogram."}
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Herb Selection */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                <FaLeaf className="inline mr-2 text-emerald-600" />
                Select Herb
              </label>
              <select
                name="herbId"
                value={form.herbId}
                onChange={handleChange}
                disabled={Boolean(editingItem)}
                className="w-full rounded-lg border-2 border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:bg-slate-100 disabled:text-slate-500"
              >
                <option value="">
                  {hasSelectableHerb
                    ? "Choose an herb..."
                    : "No herbs available"}
                </option>
                {(editingItem ? [editingItem] : availableHerbs).map((herb) => (
                  <option
                    key={herb.herbId || herb.id}
                    value={herb.herbId || herb.id}
                  >
                    {herb.herbName || herb.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Per Kilo */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                <FaTags className="inline mr-2 text-emerald-600" />
                Price Per Kilogram (EGP)
              </label>
              <input
                type="number"
                name="pricePerKilo"
                value={form.pricePerKilo}
                onChange={handleChange}
                step="0.01"
                min="0"
                placeholder="Enter price..."
                className="w-full rounded-lg border-2 border-slate-200 px-4 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>

          {/* Active Status Checkbox */}
          <div className="mt-6 flex items-center gap-3">
            <input
              type="checkbox"
              name="isActive"
              checked={form.isActive}
              onChange={handleChange}
              className="h-5 w-5 cursor-pointer rounded-lg border-2 border-slate-200 accent-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
            />
            <label className="text-sm font-bold text-slate-700 cursor-pointer">
              <FaCheckCircle className="inline mr-2 text-emerald-600" />
              Mark as Active
            </label>
          </div>

          {/* Form Buttons */}
          <div className="mt-8 flex gap-3">
            <button
              type="submit"
              disabled={isSaving || !hasSelectableHerb || !form.pricePerKilo}
              className="flex-1 rounded-lg bg-emerald-600 px-6 py-3 font-bold text-white shadow-md transition-all hover:bg-emerald-700 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                  {editingItem ? "Updating..." : "Adding..."}
                </>
              ) : editingItem ? (
                "Update Item"
              ) : (
                "Add to Inventory"
              )}
            </button>

            {editingItem && (
              <button
                type="button"
                onClick={resetForm}
                className="flex-1 rounded-lg border-2 border-slate-200 px-6 py-3 font-bold text-slate-700 transition-all hover:bg-slate-50"
              >
                <FaTimes className="inline mr-2" />
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Inventory Grid Section */}
      <div className="relative z-10">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-extrabold text-slate-900">
            Current Stock
          </h2>
          <div className="rounded-full bg-white px-4 py-1.5 shadow-sm border border-slate-200">
            <span className="text-sm font-bold text-slate-600">
              {inventoryItems.length} listed item
              {inventoryItems.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {isLoading ? (
          <div className="flex h-64 flex-col items-center justify-center rounded-[2rem] bg-white/40 border border-white/60 shadow-sm backdrop-blur-md">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-500/30 border-t-emerald-500" />
            <p className="mt-4 text-sm font-bold tracking-widest text-slate-400 uppercase">
              Synchronizing Data...
            </p>
          </div>
        ) : inventoryItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center rounded-[3rem] border-2 border-dashed border-slate-200 bg-white/50 px-6 py-20 text-center backdrop-blur-xl"
          >
            <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-emerald-100 text-emerald-500 shadow-inner">
              <FaBoxOpen className="text-5xl" />
            </div>
            <h3 className="text-2xl font-extrabold text-slate-800">
              Your inventory is empty
            </h3>
            <p className="mt-2 text-base font-medium text-slate-500 max-w-sm">
              You haven't listed any herbs yet. Select a global herb from the
              menu above to initiate your first offering!
            </p>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid gap-6 md:grid-cols-2 xl:grid-cols-3"
          >
            <AnimatePresence>
              {inventoryItems.map((item) => (
                <motion.div
                  key={`${item.herbId}-${item.inventoryId || "entry"}`}
                  variants={itemVariants}
                  exit={{
                    opacity: 0,
                    scale: 0.9,
                    transition: { duration: 0.2 },
                  }}
                  whileHover={{ y: -6, transition: { duration: 0.2 } }}
                  className="group relative flex flex-col overflow-hidden rounded-[2rem] border border-white/60 bg-white shadow-[0_4px_20px_rgb(0,0,0,0.03)] backdrop-blur-xl transition-all hover:shadow-[0_10px_40px_rgb(0,0,0,0.08)] hover:border-emerald-100"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/30 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

                  <div className="relative p-6 flex flex-col h-full flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-xl font-extrabold text-slate-900 leading-tight">
                          {item.herbName}
                        </h3>
                        <p className="mt-1 text-xs font-medium italic text-slate-500">
                          {item.scientificName}
                        </p>
                      </div>
                      <div
                        className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider shadow-sm border ${
                          item.isActive
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200/50"
                            : "bg-slate-100 text-slate-500 border-slate-200"
                        }`}
                      >
                        {item.isActive ? (
                          <FaCheckCircle />
                        ) : (
                          <FaExclamationCircle />
                        )}
                        {item.isActive ? "Active" : "Inactive"}
                      </div>
                    </div>

                    <div className="mt-8 flex-1">
                      <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100/80">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                          Selling Price
                        </p>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-2xl font-black text-emerald-600">
                            {item.pricePerKilo == null
                              ? "-"
                              : item.pricePerKilo}
                          </span>
                          <span className="text-sm font-bold text-emerald-600/60">
                            EGP / kg
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 flex gap-3 opacity-80 transition-opacity group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={() => startEditing(item)}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-white border-2 border-emerald-100 px-4 py-3 text-xs font-bold text-emerald-700 shadow-sm transition-all hover:bg-emerald-50 hover:border-emerald-200 hover:shadow"
                      >
                        <FaEdit /> Modify
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item)}
                        disabled={isDeleting}
                        className="flex items-center justify-center rounded-xl bg-white border-2 border-red-50 p-3 text-red-500 shadow-sm transition-all hover:bg-red-50 hover:border-red-100 hover:text-red-600 disabled:opacity-50"
                        title="Delete listing"
                      >
                        <FaTrashAlt />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default HerbalistInventory;
