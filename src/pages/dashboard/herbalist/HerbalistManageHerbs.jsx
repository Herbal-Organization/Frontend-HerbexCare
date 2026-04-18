import { useEffect, useMemo, useState } from "react";
import { FaLeaf, FaUpload, FaPen, FaTrash, FaCheckCircle, FaBookOpen, FaGlobe, FaPlus, FaTimes } from "react-icons/fa";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "motion/react";
import ProfileLayout from "../../../components/shared/ProfileLayout";
import {
  createHerb,
  getAllHerbs,
  updateHerb,
  deleteHerb,
} from "../../../api/herbs";
import { addHerbToInventory } from "../../../api/inventory";
import { normalizeHerb } from "../../../services/herbs";

const INITIAL_FORM = {
  herbName: "",
  scientificName: "",
  description: "",
  benefits: "",
  dosage: "",
  warnings: "",
  image: null,
};

const getLocallyStoredHerbIds = (herbalistId) => {
  if (!herbalistId) return [];
  try {
    const data = localStorage.getItem(`my_created_herbs_${herbalistId}`);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const saveLocallyStoredHerbIds = (herbalistId, ids) => {
  if (!herbalistId) return;
  try {
    localStorage.setItem(`my_created_herbs_${herbalistId}`, JSON.stringify(ids));
  } catch {}
};

function HerbalistManageHerbs({ user, dashboardData }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [editingHerbId, setEditingHerbId] = useState(null);
  const [myHerbs, setMyHerbs] = useState([]);
  const [otherHerbs, setOtherHerbs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  // Add to Inventory Modal States
  const [selectedHerbForInventory, setSelectedHerbForInventory] = useState(null);
  const [pricePerKilo, setPricePerKilo] = useState("");
  const [isAddingToInventory, setIsAddingToInventory] = useState(false);

  const herbalistId = useMemo(() => {
    return dashboardData?.herbalistProfile?.id || user?.id;
  }, [dashboardData?.herbalistProfile?.id, user?.id]);

  const imageName = useMemo(() => form.image?.name || "", [form.image]);

  const loadHerbs = async () => {
    if (!herbalistId) return;

    setIsLoading(true);
    try {
      const data = await getAllHerbs();
      const allHerbs = Array.isArray(data) ? data.map(normalizeHerb) : [];

      const mine = [];
      const others = [];

      const localIds = getLocallyStoredHerbIds(herbalistId);

      for (const herb of allHerbs) {
        if (
          (herb.herbalistId && Number(herb.herbalistId) === Number(herbalistId)) ||
          localIds.includes(herb.herbId) ||
          localIds.includes(String(herb.herbId))
        ) {
          mine.push(herb);
        } else {
          others.push(herb);
        }
      }

      setMyHerbs(mine);
      setOtherHerbs(others);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.title ||
        "Failed to load herbs.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHerbs();
  }, [herbalistId]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0] || null;
    setForm((current) => ({
      ...current,
      image: file,
    }));
  };

  const resetForm = () => {
    setForm(INITIAL_FORM);
    setEditingHerbId(null);
    setError("");
  };

  const startEditing = (herb) => {
    setEditingHerbId(herb.herbId);
    setForm({
      herbName: herb.herbName || "",
      scientificName: herb.scientificName || "",
      description: herb.description || "",
      benefits: herb.benefits || "",
      dosage: herb.dosage || "",
      warnings: herb.warnings || "",
      image: null,
    });
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!form.herbName.trim()) {
      setError("Herb name is required.");
      return;
    }
    if (!form.scientificName.trim()) {
      setError("Scientific name is required.");
      return;
    }
    if (!form.description.trim()) {
      setError("Description is required.");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        herbName: form.herbName.trim(),
        scientificName: form.scientificName.trim(),
        description: form.description.trim(),
        benefits: form.benefits.trim(),
        dosage: form.dosage.trim(),
        warnings: form.warnings.trim(),
        image: form.image,
      };

      if (editingHerbId) {
        await updateHerb(editingHerbId, payload);
        toast.success("Herb updated successfully!");
        resetForm();
        await loadHerbs();
      } else {
        const oldIds = new Set([...myHerbs, ...otherHerbs].map((h) => h.herbId));
        await createHerb(payload);
        toast.success("Herb added successfully!");

        // Diff to assign new herb to current user
        const newData = await getAllHerbs();
        const allHerbsRefetched = Array.isArray(newData) ? newData.map(normalizeHerb) : [];
        const newlyAdded = allHerbsRefetched.filter((h) => !oldIds.has(h.herbId));

        if (newlyAdded.length > 0) {
          const stored = getLocallyStoredHerbIds(herbalistId);
          newlyAdded.forEach((h) => {
            if (!stored.includes(h.herbId)) stored.push(h.herbId);
          });
          saveLocallyStoredHerbIds(herbalistId, stored);
        }

        resetForm();
        await loadHerbs();
      }
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.title ||
        `Failed to ${editingHerbId ? "update" : "add"} herb.`;
      setError(message);
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (herbId, herbName) => {
    if (!window.confirm(`Are you sure you want to delete "${herbName}"? This action cannot be undone.`)) {
      return;
    }
    setIsDeleting(true);
    setError("");
    try {
      await deleteHerb(herbId);
      toast.success("Herb deleted successfully!");
      await loadHerbs();
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.title ||
        "Failed to delete herb.";
      setError(message);
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  };

  // Inventory Modal Logic
  const openInventoryModal = (herb) => {
    setSelectedHerbForInventory(herb);
    setPricePerKilo("");
  };

  const closeInventoryModal = () => {
    setSelectedHerbForInventory(null);
    setPricePerKilo("");
  };

  const handleAddToInventory = async (e) => {
    e.preventDefault();
    if (!selectedHerbForInventory) return;

    const parsedPrice = Number(pricePerKilo);
    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      toast.error("Please enter a valid price per kilo (greater than 0).");
      return;
    }

    setIsAddingToInventory(true);
    try {
      await addHerbToInventory({
        herbId: selectedHerbForInventory.herbId || selectedHerbForInventory.id,
        pricePerKilo: parsedPrice,
      });
      toast.success(`${selectedHerbForInventory.herbName} added to your inventory!`);
      closeInventoryModal();
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.title ||
        "Failed to add herb to inventory. It may already exist.";
      toast.error(message);
    } finally {
      setIsAddingToInventory(false);
    }
  };

  const renderHerbCard = (herb, isMine) => (
    <motion.div
      key={herb.herbId || herb.id}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="group relative flex flex-col overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm transition-all hover:shadow-[0_10px_40px_rgb(0,0,0,0.06)] hover:border-emerald-200"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

      <div className="relative p-6 flex flex-col h-full">
        <div className="flex items-start gap-4">
          <div className="h-14 w-14 rounded-2xl overflow-hidden shrink-0 bg-slate-50 border border-slate-100 flex items-center justify-center">
            {herb.imageURL ? (
              <img src={herb.imageURL} alt={herb.herbName} className="object-cover w-full h-full" />
            ) : (
              <FaLeaf className="text-emerald-200/50 text-2xl" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-extrabold text-slate-900 leading-tight truncate">
              {herb.herbName}
            </h3>
            <p className="mt-0.5 text-xs font-medium italic text-slate-500 truncate">
              {herb.scientificName}
            </p>
          </div>
        </div>

        <p className="mt-5 line-clamp-3 text-sm leading-relaxed text-slate-600 flex-1">
          {herb.description}
        </p>

        <div className="mt-6 flex flex-col gap-3">
          {isMine && (
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => startEditing(herb)}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-white border border-emerald-100 px-3 py-2.5 text-xs font-bold text-emerald-600 shadow-sm transition-colors hover:bg-emerald-50"
              >
                <FaPen className="text-[10px]" /> Edit
              </button>
              <button
                type="button"
                onClick={() => handleDelete(herb.herbId, herb.herbName)}
                disabled={isDeleting}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-white border border-red-100 px-3 py-2.5 text-xs font-bold text-red-600 shadow-sm transition-colors hover:bg-red-50 disabled:opacity-50"
              >
                <FaTrash className="text-[10px]" /> Delete
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={() => openInventoryModal(herb)}
            className="w-full relative overflow-hidden flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white transition-all hover:bg-slate-800 hover:shadow-lg hover:-translate-y-0.5 focus:ring-4 focus:ring-slate-900/20"
          >
            <FaBookOpen className="text-xs text-emerald-400" /> 
            Add to Inventory
          </button>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-12 relative min-h-screen">
      
      {/* Creation/Edit Form Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10"
      >
        <div className="flex flex-col gap-2 mb-6">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 drop-shadow-sm">
            Registry Configuration
          </h1>
          <p className="text-lg text-slate-500 font-medium">
            Draft, edit, and formulate proprietary blends for your active catalog.
          </p>
        </div>

        <motion.div 
          layout
          className="overflow-hidden rounded-[2rem] border border-white/60 bg-white/60 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-2xl"
        >
          <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-emerald-100 p-3 shadow-inner text-emerald-600">
                <FaLeaf className="text-xl" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-800">
                  {editingHerbId ? "Edit Custom Herb" : "Create New Herb"}
                </h2>
                <p className="mt-1 text-sm font-medium text-slate-500">
                  {editingHerbId
                    ? "Update the details of your authored herb entry."
                    : "Contribute a new herb configuration to the system registry."}
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {error ? (
              <div className="mb-6 rounded-2xl border border-red-100 bg-red-50/80 backdrop-blur-sm px-5 py-4 text-sm font-bold text-red-700 shadow-sm">
                <FaTimes className="inline mr-2" /> {error}
              </div>
            ) : null}

            {editingHerbId ? (
              <div className="mb-6 flex items-center justify-between rounded-2xl border border-emerald-200 bg-emerald-50/80 backdrop-blur-sm px-6 py-5 text-sm shadow-sm">
                <span className="font-bold flex items-center gap-2 text-emerald-800 tracking-wide">
                  <FaPen className="text-emerald-500" /> Active Edit Session 
                </span>
                <button
                  type="button"
                  onClick={resetForm}
                  className="font-bold text-emerald-600 flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-emerald-100 transition-all hover:bg-emerald-500 hover:text-white"
                >
                  <FaTimes /> Override & Cancel 
                </button>
              </div>
            ) : null}

            <div className="mb-8">
              <h3 className="mb-4 text-xs font-black text-slate-400 uppercase tracking-widest">
                General Information
              </h3>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-slate-700 uppercase tracking-wide">
                    Herb Name
                  </label>
                  <input
                    type="text"
                    name="herbName"
                    value={form.herbName}
                    onChange={handleChange}
                    placeholder="e.g. Ginseng"
                    className="block w-full rounded-2xl border-2 border-slate-200/50 bg-white/80 backdrop-blur-sm px-5 py-4 text-base font-bold text-slate-900 shadow-sm outline-none transition-all placeholder:font-medium placeholder:text-slate-300 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-bold text-slate-700 uppercase tracking-wide">
                    Scientific Name
                  </label>
                  <input
                    type="text"
                    name="scientificName"
                    value={form.scientificName}
                    onChange={handleChange}
                    placeholder="e.g. Panax ginseng"
                    className="block w-full rounded-2xl border-2 border-slate-200/50 bg-white/80 backdrop-blur-sm px-5 py-4 text-base font-bold text-slate-900 shadow-sm outline-none transition-all placeholder:font-medium placeholder:text-slate-300 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                  />
                </div>
              </div>
            </div>

            <div className="mb-8 space-y-2">
              <label className="block text-sm font-bold text-slate-700 uppercase tracking-wide">
                Detailed Description
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Share the origins, appearance, and standard implementations..."
                className="block min-h-[140px] w-full rounded-2xl border-2 border-slate-200/50 bg-white/80 backdrop-blur-sm px-5 py-4 text-base font-semibold text-slate-900 shadow-sm outline-none transition-all placeholder:font-medium placeholder:text-slate-300 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
              />
            </div>

            <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-700 uppercase tracking-wide">
                  Medicinal Benefits
                </label>
                <textarea
                  name="benefits"
                  value={form.benefits}
                  onChange={handleChange}
                  placeholder="e.g. Boosts energy, lowers blood sugar..."
                  className="block min-h-[120px] w-full rounded-2xl border-2 border-slate-200/50 bg-white/80 backdrop-blur-sm px-5 py-4 text-base font-semibold text-slate-900 shadow-sm outline-none transition-all placeholder:font-medium placeholder:text-slate-300 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-700 uppercase tracking-wide">
                  Clinical Warnings
                </label>
                <textarea
                  name="warnings"
                  value={form.warnings}
                  onChange={handleChange}
                  placeholder="e.g. Not recommended for pregnant women..."
                  className="block min-h-[120px] w-full rounded-2xl border-2 border-slate-200/50 bg-white/80 backdrop-blur-sm px-5 py-4 text-base font-semibold text-slate-900 shadow-sm outline-none transition-all placeholder:font-medium placeholder:text-slate-300 focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-500/10"
                />
              </div>
            </div>

            <div className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-700 uppercase tracking-wide">
                  Dosage Instructions
                </label>
                <input
                  type="text"
                  name="dosage"
                  value={form.dosage}
                  onChange={handleChange}
                  placeholder="e.g. 1-3 grams daily"
                  className="block w-full rounded-2xl border-2 border-slate-200/50 bg-white/80 backdrop-blur-sm px-5 py-4 text-base font-bold text-slate-900 shadow-sm outline-none transition-all placeholder:font-medium placeholder:text-slate-300 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-700 uppercase tracking-wide">
                  Visual Media Target
                </label>
                <label className="flex h-[56px] w-full cursor-pointer items-center justify-between overflow-hidden rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/50 px-5 text-sm text-slate-600 transition-all hover:bg-slate-100 hover:border-emerald-400">
                  <span className="truncate font-semibold text-slate-500">
                    {imageName || "Assign High-Res Imagery"}
                  </span>
                  <span className="shrink-0 inline-flex items-center gap-2 font-black text-emerald-700 bg-emerald-100 shadow-sm px-4 py-1.5 rounded-xl">
                    <FaUpload /> Attach File
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </label>
              </div>
            </div>

            <div className="border-t border-slate-200/50 pt-8 flexjustify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="group relative flex h-14 w-full md:w-auto min-w-[200px] md:float-right items-center justify-center gap-2 overflow-hidden rounded-2xl bg-slate-900 px-8 font-bold text-white transition-all hover:bg-slate-800 disabled:pointer-events-none disabled:opacity-50 hover:shadow-[0_8px_20px_rgb(15,23,42,0.3)] hover:-translate-y-0.5"
              >
                {isSaving ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                ) : (
                  <>
                    <FaCheckCircle className="text-emerald-400" />
                    <span>{editingHerbId ? "Finalize Edits" : "Deploy Configuration"}</span>
                  </>
                )}
              </button>
              {/* Clear float block */}
              <div className="clear-both"></div>
            </div>
          </form>
        </motion.div>
      </motion.div>
      
      {/* My Herbs Section */}
      <section className="relative z-10">
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-3">
               <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl shadow-inner">
                 <FaCheckCircle className="text-xl" />
               </div>
               My Managed Herbs
            </h2>
            <p className="mt-2 text-sm text-slate-500 max-w-lg leading-relaxed">
              Herbs natively configured and managed by you. You retain full editing privileges over their details.
            </p>
          </div>
          {myHerbs.length > 0 && (
            <div className="text-xs font-bold uppercase tracking-widest text-slate-400 bg-white shadow-sm border border-slate-200 px-4 py-2 rounded-full">
              {myHerbs.length} Record{myHerbs.length === 1 ? "" : "s"}
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="py-12 flex justify-center">
             <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500/30 border-t-emerald-500" />
          </div>
        ) : myHerbs.length === 0 ? (
          <div className="py-16 text-center rounded-[3rem] border-2 border-dashed border-slate-200 bg-slate-50">
            <FaLeaf className="mx-auto text-4xl text-slate-300 mb-4" />
            <p className="text-lg font-bold text-slate-600">No Custom Herbs</p>
            <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">You have not created any proprietary herbs. Use the form above to deploy your initial formulas.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xlg:grid-cols-3">
             {myHerbs.map((herb) => renderHerbCard(herb, true))}
          </div>
        )}
      </section>

      {/* Global Herbs Section */}
      <section className="relative z-10 pt-8 border-t-2 border-dashed border-slate-200">
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-3">
               <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl shadow-inner">
                 <FaGlobe className="text-xl" />
               </div>
               Global Registry
            </h2>
            <p className="mt-2 text-sm text-slate-500 max-w-lg leading-relaxed">
              Standardized herbs deployed by the central medical board or other practitioners. 
              Review the catalog and instantly import items to your inventory.
            </p>
          </div>
          {otherHerbs.length > 0 && (
            <div className="text-xs font-bold uppercase tracking-widest text-indigo-400 bg-indigo-50 border border-indigo-100 px-4 py-2 rounded-full shadow-sm">
              Read Only Viewer
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="py-12 flex justify-center">
             <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500/30 border-t-indigo-500" />
          </div>
        ) : otherHerbs.length === 0 ? (
          <div className="py-16 text-center rounded-[3rem] border-2 border-dashed border-slate-200 bg-slate-50">
            <p className="text-sm font-semibold text-slate-500">Global registry is currently empty.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xlg:grid-cols-3 opacity-90 transition-opacity hover:opacity-100">
             {otherHerbs.map((herb) => renderHerbCard(herb, false))}
          </div>
        )}
      </section>

      {/* Inventory Modal Focus Box */}
      <AnimatePresence>
        {selectedHerbForInventory && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-md overflow-hidden rounded-[2.5rem] bg-white shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-slate-100 px-8 py-5 bg-slate-50/50">
                <h3 className="text-xl font-extrabold text-slate-900">Push to Inventory</h3>
                <button
                  type="button"
                  onClick={closeInventoryModal}
                  className="rounded-full bg-white p-2 text-slate-400 shadow-sm transition-all hover:bg-slate-100 hover:text-slate-700"
                  disabled={isAddingToInventory}
                >
                  <FaTimes />
                </button>
              </div>
              
              <form onSubmit={handleAddToInventory} className="p-8">
                <div className="mb-6 rounded-3xl bg-emerald-50/50 p-5 border border-emerald-100/50">
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-emerald-600/70">
                    Configuration Target
                  </p>
                  <p className="text-xl font-black text-slate-900 leading-tight block truncate">
                    {selectedHerbForInventory.herbName}
                  </p>
                  <p className="text-xs font-semibold italic text-slate-500 truncate">
                    {selectedHerbForInventory.scientificName}
                  </p>
                </div>

                <div className="mb-8">
                  <label className="mb-2 block text-sm font-bold uppercase tracking-widest text-slate-700">
                    Selling Price / Kg
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-extrabold text-slate-400">EGP</span>
                    <input
                      autoFocus
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={pricePerKilo}
                      onChange={(e) => setPricePerKilo(e.target.value)}
                      placeholder="Pricing estimate..."
                      className="block w-full rounded-2xl border-2 border-slate-200/50 pl-14 pr-4 py-4 text-lg font-black text-slate-900 outline-none transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 placeholder:font-medium placeholder:text-slate-300"
                      disabled={isAddingToInventory}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <button
                    type="submit"
                    disabled={isAddingToInventory || !pricePerKilo}
                    className="group flex w-full h-14 items-center justify-center gap-2 rounded-2xl bg-slate-900 font-bold text-white shadow-[0_8px_20px_rgb(15,23,42,0.2)] transition-all hover:-translate-y-0.5 hover:bg-slate-800 disabled:pointer-events-none disabled:opacity-50"
                  >
                    {isAddingToInventory ? (
                       <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white"></div>
                    ) : (
                       <><FaPlus className="text-xs text-emerald-400" /> Confirm Listing Deployment</>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={closeInventoryModal}
                    className="flex w-full h-14 items-center justify-center rounded-2xl border-2 border-slate-100 bg-transparent font-bold text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50"
                    disabled={isAddingToInventory}
                  >
                    Cancel Action
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default HerbalistManageHerbs;
