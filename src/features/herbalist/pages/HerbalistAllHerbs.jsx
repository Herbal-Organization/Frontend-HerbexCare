import { useEffect, useState } from "react";
import {
  FaLeaf,
  FaSearch,
  FaPlus,
  FaTimes,
  FaBookOpen,
  FaArrowLeft,
  FaGlobe,
} from "react-icons/fa";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";
import { getAllHerbs } from "@api/herbs";
import { addHerbToInventory } from "@api/inventory";
import { normalizeHerb } from "@features/browse/services/herbs";

const extractHerbsArray = (responseData) => {
  if (Array.isArray(responseData)) return responseData;
  if (Array.isArray(responseData?.items)) return responseData.items;
  if (Array.isArray(responseData?.data)) return responseData.data;
  return [];
};

function HerbalistAllHerbs() {
  const navigate = useNavigate();
  const [herbs, setHerbs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Inventory Modal States
  const [selectedHerbForInventory, setSelectedHerbForInventory] =
    useState(null);
  const [pricePerKilo, setPricePerKilo] = useState("");
  const [isAddingToInventory, setIsAddingToInventory] = useState(false);

  const loadHerbs = async () => {
    setIsLoading(true);
    try {
      const data = await getAllHerbs(1, 1000);
      const allHerbs = extractHerbsArray(data).map(normalizeHerb);
      setHerbs(allHerbs);
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
  }, []);

  const filteredHerbs = herbs.filter((herb) => {
    const query = searchQuery.toLowerCase();
    return (
      herb.herbName?.toLowerCase().includes(query) ||
      herb.scientificName?.toLowerCase().includes(query)
    );
  });

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
      toast.success(
        `${selectedHerbForInventory.herbName} added to your inventory!`,
      );
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

  const renderHerbCard = (herb) => (
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
              <img
                src={herb.imageURL}
                alt={herb.herbName}
                className="object-cover w-full h-full"
              />
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

        <div className="mt-6">
          <button
            type="button"
            onClick={() => openInventoryModal(herb)}
            className="w-full relative overflow-hidden flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white transition-all hover:bg-slate-800 hover:shadow-lg hover:-translate-y-0.5 focus:ring-4 focus:ring-slate-900/20"
          >
            <FaPlus className="text-xs text-emerald-400" />
            Add to Inventory
          </button>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-8 relative min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex flex-col gap-2">
          <button
            onClick={() => navigate("/herbalist/dashboard/herbs")}
            className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-primary transition-colors mb-2 w-fit"
          >
            <FaArrowLeft className="text-xs" /> Back to Management
          </button>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-2xl shadow-inner">
              <FaGlobe className="text-2xl" />
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
              Global Herb Registry
            </h1>
          </div>
          <p className="text-lg text-slate-500 font-medium">
            Explore and search the complete system catalog to expand your
            practice.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-96 group">
          <div className="absolute inset-y-0 start-0 flex items-center ps-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors">
            <FaSearch />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search herbs or scientific names..."
            className="block w-full rounded-2xl border-2 border-slate-200 bg-white px-12 py-4 text-sm font-bold text-slate-900 shadow-sm outline-none transition-all placeholder:font-medium placeholder:text-slate-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
          />
        </div>
      </div>

      {/* Grid Section */}
      <div className="relative z-10">
        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-4">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-500/30 border-t-emerald-500" />
            <p className="text-slate-500 font-bold animate-pulse">
              Synchronizing with registry...
            </p>
          </div>
        ) : error ? (
          <div className="py-16 text-center rounded-[3rem] border-2 border-red-100 bg-red-50 px-8">
            <FaTimes className="mx-auto text-4xl text-red-300 mb-4" />
            <p className="text-lg font-bold text-red-700">{error}</p>
            <button
              onClick={loadHerbs}
              className="mt-4 text-sm font-bold text-red-600 underline hover:text-red-800"
            >
              Try to reconnect
            </button>
          </div>
        ) : filteredHerbs.length === 0 ? (
          <div className="py-24 text-center rounded-[3rem] border-2 border-dashed border-slate-200 bg-slate-50">
            <FaLeaf className="mx-auto text-5xl text-slate-200 mb-4" />
            <p className="text-xl font-bold text-slate-600">No Herbs Found</p>
            <p className="text-sm text-slate-400 mt-2">
              We couldn't find any herbs matching your search criteria.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredHerbs.map(renderHerbCard)}
          </div>
        )}
      </div>

      {/* Inventory Modal */}
      <AnimatePresence>
        {selectedHerbForInventory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-md overflow-hidden rounded-[2.5rem] bg-white shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-slate-100 px-8 py-6 bg-slate-50/50">
                <h3 className="text-xl font-extrabold text-slate-900">
                  Import to Inventory
                </h3>
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
                <div className="mb-6 rounded-3xl bg-emerald-50 p-6 border border-emerald-100">
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-emerald-600/70">
                    Configuration Target
                  </p>
                  <p className="text-2xl font-black text-slate-900 leading-tight block truncate">
                    {selectedHerbForInventory.herbName}
                  </p>
                  <p className="text-xs font-semibold italic text-slate-500 truncate mt-1">
                    {selectedHerbForInventory.scientificName}
                  </p>
                </div>

                <div className="mb-8">
                  <label className="mb-3 block text-sm font-bold uppercase tracking-widest text-slate-700 ps-1">
                    Selling Price / Kg
                  </label>
                  <div className="relative">
                    <span className="absolute start-5 top-1/2 -translate-y-1/2 font-extrabold text-slate-400">
                      EGP
                    </span>
                    <input
                      autoFocus
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={pricePerKilo}
                      onChange={(e) => setPricePerKilo(e.target.value)}
                      placeholder="0.00"
                      className="block w-full rounded-2xl border-2 border-slate-200 ps-16 pe-5 py-4 text-xl font-black text-slate-900 outline-none transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 placeholder:font-medium placeholder:text-slate-300"
                      disabled={isAddingToInventory}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <button
                    type="submit"
                    disabled={isAddingToInventory || !pricePerKilo}
                    className="group flex w-full h-14 items-center justify-center gap-2 rounded-2xl bg-slate-900 font-bold text-white shadow-xl transition-all hover:-translate-y-0.5 hover:bg-slate-800 disabled:pointer-events-none disabled:opacity-50"
                  >
                    {isAddingToInventory ? (
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white"></div>
                    ) : (
                      <>
                        <FaPlus className="text-xs text-emerald-400" /> Confirm
                        Import
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={closeInventoryModal}
                    className="flex w-full h-14 items-center justify-center rounded-2xl border-2 border-slate-100 bg-transparent font-bold text-slate-500 transition-all hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50"
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

export default HerbalistAllHerbs;
