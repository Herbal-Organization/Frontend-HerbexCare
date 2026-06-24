import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FaLeaf,
  FaUpload,
  FaPen,
  FaTrash,
  FaCheckCircle,
  FaBookOpen,
  FaEye,
  FaPlus,
  FaSearch,
  FaTags,
  FaTimes,
} from "react-icons/fa";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "motion/react";
import { Link } from "react-router-dom";
import {
  createHerb,
  getAllHerbs,
  getHerbById,
  getHerbWithHerbalist,
  updateHerb,
  deleteHerb,
} from "@api/herbs";
import {
  addInventoryHerb,
  deleteInventoryHerbById,
  getMyInventoryHerbs,
  updateInventoryHerbById,
} from "@api/inventory";
import { normalizeHerb } from "@features/browse/services/herbs";
import { normalizeInventoryList } from "@features/herbalist/services/inventory";

const INITIAL_FORM = {
  herbName: "",
  scientificName: "",
  description: "",
  benefits: "",
  dosage: "",
  warnings: "",
  image: null,
};

const PAGE_SIZE = 50;

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
    localStorage.setItem(
      `my_created_herbs_${herbalistId}`,
      JSON.stringify(ids),
    );
  } catch {}
};

const extractHerbsArray = (responseData) => {
  if (Array.isArray(responseData)) return responseData;
  if (Array.isArray(responseData?.items)) return responseData.items;
  if (Array.isArray(responseData?.data)) return responseData.data;
  return [];
};

const extractInventoryArray = (responseData) => {
  if (Array.isArray(responseData)) return responseData;
  if (Array.isArray(responseData?.items)) return responseData.items;
  if (Array.isArray(responseData?.data)) return responseData.data;
  return [];
};

const toIdString = (value) => String(value ?? "");

const isManagedHerb = (herb, herbalistId, ownedHerbIdsSet) => {
  const ownerId = herb?.herbalistId ?? herb?.addedByHerbalistId;
  if (
    ownerId !== undefined &&
    ownerId !== null &&
    herbalistId !== undefined &&
    herbalistId !== null &&
    Number(ownerId) === Number(herbalistId)
  ) {
    return true;
  }

  return ownedHerbIdsSet.has(toIdString(herb?.herbId));
};

const isHerbLocked = (herb) => herb?.isApproved === true;

function HerbalistManageHerbs({ user, dashboardData, view = "managed" }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [editingHerbId, setEditingHerbId] = useState(null);
  const [showFormModal, setShowFormModal] = useState(false);

  const [herbs, setHerbs] = useState([]);
  const [ownedHerbIds, setOwnedHerbIds] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [formError, setFormError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedHerbDetails, setSelectedHerbDetails] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);
  const [herbalistInfoMap, setHerbalistInfoMap] = useState({});

  const [selectedHerbForInventory, setSelectedHerbForInventory] =
    useState(null);
  const [pricePerKilo, setPricePerKilo] = useState("");
  const [isAddingToInventory, setIsAddingToInventory] = useState(false);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [isInventoryLoading, setIsInventoryLoading] = useState(true);
  const [selectedInventoryItem, setSelectedInventoryItem] = useState(null);
  const [inventoryPriceValue, setInventoryPriceValue] = useState("");
  const [isUpdatingInventoryItem, setIsUpdatingInventoryItem] = useState(false);
  const [deletingInventoryId, setDeletingInventoryId] = useState(null);

  const isManagedPage = view === "managed";
  const isReadOnlyPage = view === "readonly";
  const isInventoryPage = view === "inventory";

  const herbalistId = useMemo(
    () => dashboardData?.herbalistProfile?.id || user?.id || null,
    [dashboardData?.herbalistProfile?.id, user?.id],
  );

  useEffect(() => {
    setOwnedHerbIds(getLocallyStoredHerbIds(herbalistId));
  }, [herbalistId]);

  const ownedHerbIdsSet = useMemo(
    () => new Set(ownedHerbIds.map(toIdString)),
    [ownedHerbIds],
  );

  const loadHerbs = useCallback(async () => {
    setIsLoading(true);
    setLoadError("");

    try {
      let currentPage = 1;
      let totalPages = 1;
      const collectedHerbs = [];

      do {
        const response = await getAllHerbs(currentPage, PAGE_SIZE);
        const pageHerbs = extractHerbsArray(response).map(normalizeHerb);
        collectedHerbs.push(...pageHerbs);

        const parsedTotalPages = Number(
          response?.totalPages || response?.meta?.totalPages || 1,
        );
        totalPages =
          Number.isFinite(parsedTotalPages) && parsedTotalPages > 0
            ? parsedTotalPages
            : 1;

        currentPage += 1;
      } while (currentPage <= totalPages);

      const deduped = Array.from(
        new Map(
          collectedHerbs.map((herb) => [toIdString(herb.herbId), herb]),
        ).values(),
      );

      setHerbs(deduped);
      return deduped;
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.title ||
        "Failed to load herbs.";
      setLoadError(message);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHerbs();
  }, [loadHerbs]);

  const loadInventory = useCallback(async () => {
    setIsInventoryLoading(true);
    try {
      const response = await getMyInventoryHerbs();
      const normalized = normalizeInventoryList(
        extractInventoryArray(response),
      );
      setInventoryItems(normalized);
      return normalized;
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.title ||
        "Failed to load inventory herbs.";
      toast.error(message);
      return [];
    } finally {
      setIsInventoryLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInventory();
  }, [loadInventory]);

  const managedHerbs = useMemo(
    () =>
      herbs.filter((herb) => isManagedHerb(herb, herbalistId, ownedHerbIdsSet)),
    [herbs, herbalistId, ownedHerbIdsSet],
  );

  const readOnlyHerbs = useMemo(
    () =>
      herbs.filter(
        (herb) => !isManagedHerb(herb, herbalistId, ownedHerbIdsSet),
      ),
    [herbs, herbalistId, ownedHerbIdsSet],
  );

  const displayedHerbs = useMemo(
    () =>
      isManagedPage ? managedHerbs : isReadOnlyPage ? readOnlyHerbs : [],
    [isManagedPage, isReadOnlyPage, managedHerbs, readOnlyHerbs],
  );

  const filteredHerbs = useMemo(() => {
    if (!searchQuery.trim()) return displayedHerbs;
    const query = searchQuery.trim().toLowerCase();
    return displayedHerbs.filter((herb) =>
      [herb.herbName, herb.scientificName, herb.description]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [displayedHerbs, searchQuery]);

  const filteredInventoryItems = useMemo(() => {
    if (!searchQuery.trim()) return inventoryItems;
    const query = searchQuery.trim().toLowerCase();
    return inventoryItems.filter((item) =>
      [item.herbName, item.scientificName, item.description]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [inventoryItems, searchQuery]);

  useEffect(() => {
    const herbsNeedingInfo = filteredHerbs
      .map((herb) => ({
        herbId: herb?.herbId || herb?.id,
        herbKey: toIdString(herb?.herbId || herb?.id),
        hasName: Boolean(herb?.herbalistName),
      }))
      .filter(
        (item) =>
          item.herbId &&
          !item.hasName &&
          !herbalistInfoMap[item.herbKey]?.herbalistName,
      )
      .slice(0, 20);

    if (!herbsNeedingInfo.length) return;

    let cancelled = false;

    const loadCreators = async () => {
      const responses = await Promise.allSettled(
        herbsNeedingInfo.map((item) => getHerbWithHerbalist(item.herbId)),
      );
      if (cancelled) return;

      setHerbalistInfoMap((current) => {
        const next = { ...current };

        responses.forEach((response, index) => {
          if (response.status !== "fulfilled") return;
          const payload = response.value?.data || response.value || {};
          const fallbackKey = herbsNeedingInfo[index].herbKey;
          const herbKey = toIdString(payload?.herbId || fallbackKey);
          if (!herbKey) return;

          next[herbKey] = {
            herbalistName:
              payload?.herbalistName || next[herbKey]?.herbalistName || "",
            herbalistId:
              payload?.herbalistId ?? next[herbKey]?.herbalistId ?? null,
          };
        });

        return next;
      });
    };

    loadCreators();

    return () => {
      cancelled = true;
    };
  }, [filteredHerbs, herbalistInfoMap]);

  const managedCount = useMemo(
    () =>
      herbs.filter((herb) => isManagedHerb(herb, herbalistId, ownedHerbIdsSet))
        .length,
    [herbs, herbalistId, ownedHerbIdsSet],
  );

  const approvedCount = useMemo(
    () => herbs.filter((herb) => herb.isApproved === true).length,
    [herbs],
  );

  const readOnlyCount = useMemo(() => readOnlyHerbs.length, [readOnlyHerbs]);
  const inventoryCount = useMemo(() => inventoryItems.length, [inventoryItems]);

  const imageName = useMemo(() => form.image?.name || "", [form.image]);

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

  const resetFormState = () => {
    setForm(INITIAL_FORM);
    setEditingHerbId(null);
    setFormError("");
  };

  const openCreateModal = () => {
    resetFormState();
    setShowFormModal(true);
  };

  const closeFormModal = () => {
    if (isSaving) return;
    setShowFormModal(false);
    resetFormState();
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
    setFormError("");
    setShowFormModal(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");

    if (!form.herbName.trim()) {
      setFormError("Herb name is required.");
      return;
    }
    if (!form.scientificName.trim()) {
      setFormError("Scientific name is required.");
      return;
    }
    if (!form.description.trim()) {
      setFormError("Description is required.");
      return;
    }

    const payload = {
      herbName: form.herbName.trim(),
      scientificName: form.scientificName.trim(),
      description: form.description.trim(),
      benefits: form.benefits.trim(),
      dosage: form.dosage.trim(),
      warnings: form.warnings.trim(),
      image: form.image,
    };

    setIsSaving(true);
    try {
      if (editingHerbId) {
        const targetHerb = herbs.find(
          (herb) => toIdString(herb?.herbId) === toIdString(editingHerbId),
        );
        if (isHerbLocked(targetHerb)) {
          const lockMessage =
            "Approved herb: changes require admin action.";
          setFormError(lockMessage);
          toast.error(lockMessage);
          return;
        }
        await updateHerb(editingHerbId, payload);
        toast.success("Herb updated successfully!");
        await loadHerbs();
      } else {
        const oldIds = new Set(herbs.map((herb) => toIdString(herb.herbId)));
        await createHerb(payload);
        toast.success("Herb added successfully!");

        const refreshed = await loadHerbs();
        const createdIds = refreshed
          .filter((herb) => !oldIds.has(toIdString(herb.herbId)))
          .map((herb) => toIdString(herb.herbId));

        if (createdIds.length > 0 && herbalistId) {
          setOwnedHerbIds((current) => {
            const next = Array.from(
              new Set([...current.map(toIdString), ...createdIds]),
            );
            saveLocallyStoredHerbIds(herbalistId, next);
            return next;
          });
        }
      }

      setShowFormModal(false);
      resetFormState();
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.title ||
        `Failed to ${editingHerbId ? "update" : "add"} herb.`;
      setFormError(message);
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (herbId, herbName) => {
    const targetHerb = herbs.find(
      (herb) => toIdString(herb?.herbId) === toIdString(herbId),
    );
    if (isHerbLocked(targetHerb)) {
      toast.error("Approved herb: changes require admin action.");
      return;
    }

    if (
      !window.confirm(
        `Are you sure you want to delete "${herbName}"? This action cannot be undone.`,
      )
    ) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteHerb(herbId);
      toast.success("Herb deleted successfully!");
      await loadHerbs();

      if (herbalistId) {
        setOwnedHerbIds((current) => {
          const next = current.filter(
            (id) => toIdString(id) !== toIdString(herbId),
          );
          saveLocallyStoredHerbIds(herbalistId, next);
          return next;
        });
      }
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.title ||
        "Failed to delete herb.";
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  };

  const openInventoryModal = (herb) => {
    setSelectedHerbForInventory(herb);
    setPricePerKilo("");
  };

  const closeInventoryModal = () => {
    setSelectedHerbForInventory(null);
    setPricePerKilo("");
  };

  const handleAddToInventory = async (event) => {
    event.preventDefault();
    if (!selectedHerbForInventory) return;

    const parsedPrice = Number(pricePerKilo);
    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      toast.error("Please enter a valid price per kilo (greater than 0).");
      return;
    }

    setIsAddingToInventory(true);
    try {
      await addInventoryHerb({
        herbId: selectedHerbForInventory.herbId || selectedHerbForInventory.id,
        pricePerKilo: parsedPrice,
      });
      toast.success(
        `${selectedHerbForInventory.herbName} added to your inventory!`,
      );
      closeInventoryModal();
      await loadInventory();
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

  const openInventoryEditModal = (item) => {
    setSelectedInventoryItem(item);
    setInventoryPriceValue(
      item?.pricePerKilo == null ? "" : String(item.pricePerKilo),
    );
  };

  const closeInventoryEditModal = () => {
    setSelectedInventoryItem(null);
    setInventoryPriceValue("");
  };

  const handleUpdateInventoryItem = async (event) => {
    event.preventDefault();
    if (!selectedInventoryItem) return;

    const parsedPrice = Number(inventoryPriceValue);
    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      toast.error("Please enter a valid inventory price greater than 0.");
      return;
    }

    const inventoryId =
      selectedInventoryItem?.inventoryId || selectedInventoryItem?.id;
    if (!inventoryId) {
      toast.error("Invalid inventory item.");
      return;
    }

    setIsUpdatingInventoryItem(true);
    try {
      await updateInventoryHerbById(inventoryId, { pricePerKilo: parsedPrice });
      toast.success("Inventory herb updated successfully.");
      closeInventoryEditModal();
      await loadInventory();
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.title ||
        "Failed to update inventory herb.";
      toast.error(message);
    } finally {
      setIsUpdatingInventoryItem(false);
    }
  };

  const handleDeleteInventoryItem = async (item) => {
    const inventoryId = item?.inventoryId || item?.id;
    if (!inventoryId) {
      toast.error("Invalid inventory item.");
      return;
    }

    if (
      !window.confirm(
        `Remove "${item.herbName}" from your inventory? This action cannot be undone.`,
      )
    ) {
      return;
    }

    setDeletingInventoryId(inventoryId);
    try {
      await deleteInventoryHerbById(inventoryId);
      toast.success("Inventory herb removed.");
      await loadInventory();
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.title ||
        "Failed to remove inventory herb.";
      toast.error(message);
    } finally {
      setDeletingInventoryId(null);
    }
  };

  const openDetailsModal = async (herb) => {
    const herbId = herb?.herbId || herb?.id;
    if (!herbId) return;

    setIsDetailsOpen(true);
    setIsDetailsLoading(true);
    setSelectedHerbDetails(herb);

    try {
      const [detailsData, withHerbalistData] = await Promise.all([
        getHerbById(herbId),
        getHerbWithHerbalist(herbId),
      ]);
      const normalized = normalizeHerb({
        ...(detailsData?.data || detailsData || herb),
        ...(withHerbalistData?.data || withHerbalistData || {}),
      });
      const withHerbalistPayload =
        withHerbalistData?.data || withHerbalistData || {};
      const herbKey = toIdString(normalized?.herbId || herbId);
      setHerbalistInfoMap((current) => ({
        ...current,
        [herbKey]: {
          herbalistName:
            withHerbalistPayload?.herbalistName ||
            normalized?.herbalistName ||
            current[herbKey]?.herbalistName ||
            "",
          herbalistId:
            withHerbalistPayload?.herbalistId ??
            normalized?.herbalistId ??
            current[herbKey]?.herbalistId ??
            null,
        },
      }));
      setSelectedHerbDetails(normalized);
    } catch (err) {
      setSelectedHerbDetails(herb);
      const message =
        err.response?.data?.message ||
        err.response?.data?.title ||
        "Failed to load herb details.";
      toast.error(message);
    } finally {
      setIsDetailsLoading(false);
    }
  };

  const closeDetailsModal = () => {
    setIsDetailsOpen(false);
    setSelectedHerbDetails(null);
    setIsDetailsLoading(false);
  };

  const renderHerbCard = (herb) => {
    const canManage =
      isManagedPage && isManagedHerb(herb, herbalistId, ownedHerbIdsSet);
    const approved = herb.isApproved === true;
    const isLocked = isHerbLocked(herb);
    const canEdit = canManage && !isLocked;
    const herbKey = toIdString(herb?.herbId || herb?.id);
    const creatorName =
      herb?.herbalistName ||
      herbalistInfoMap[herbKey]?.herbalistName ||
      (canManage ? "You" : "Unknown herbalist");

    return (
      <motion.article
        key={herb.herbId || herb.id}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-[0_10px_30px_rgb(0,0,0,0.08)]"
      >
        <div className="p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-slate-100">
              {herb.imageURL ? (
                <img
                  src={herb.imageURL}
                  alt={herb.herbName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <FaLeaf className="text-2xl text-emerald-300" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <h3 className="truncate text-lg font-black text-slate-900">
                  {herb.herbName}
                </h3>
                <span
                  className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${
                    approved
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {approved ? "Approved (Locked)" : "Pending"}
                </span>
              </div>
              <p className="truncate text-xs font-semibold italic text-slate-500">
                {herb.scientificName}
              </p>
            </div>
          </div>

          <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-600">
            {herb.description}
          </p>

          <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Created By
            </p>
            <p className="mt-1 truncate text-sm font-bold text-slate-700">
              {creatorName}
            </p>
          </div>
        </div>

        <div className="mt-auto border-t border-slate-100 bg-slate-50/80 p-4">
          <div className="flex flex-col gap-2 sm:flex-row">
            {canManage ? (
              <>
                <button
                  type="button"
                  onClick={() => startEditing(herb)}
                  disabled={!canEdit}
                  className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-white text-xs font-bold text-emerald-700 transition-colors hover:bg-emerald-50"
                >
                  <FaPen className="text-[10px]" />
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(herb.herbId, herb.herbName)}
                  disabled={isDeleting || !canEdit}
                  className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-red-200 bg-white text-xs font-bold text-red-700 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <FaTrash className="text-[10px]" />
                  Delete
                </button>
              </>
            ) : (
              <div className="inline-flex h-10 w-full items-center justify-center rounded-xl border border-slate-200 bg-white text-xs font-bold uppercase tracking-wider text-slate-500">
                Read Only
              </div>
            )}
          </div>

          {canManage && isLocked ? (
            <p
              title="Approved herb: changes require admin action."
              className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] font-semibold text-amber-800"
            >
              Approved herb: changes require admin action.
            </p>
          ) : null}

          <button
            type="button"
            onClick={() => openDetailsModal(herb)}
            className="mt-2 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-xs font-bold uppercase tracking-wider text-slate-700 transition-colors hover:border-emerald-300 hover:text-emerald-700"
          >
            <FaEye className="text-[10px]" />
            View Details
          </button>

          <button
            type="button"
            onClick={() => openInventoryModal(herb)}
            className="mt-2 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 text-sm font-bold text-white transition-colors hover:bg-slate-800"
          >
            <FaBookOpen className="text-xs text-emerald-300" />
            Add to Inventory
          </button>
        </div>
      </motion.article>
    );
  };

  const renderInventoryCard = (item) => (
    <motion.article
      key={item.inventoryId || item.id || item.herbId}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-[0_10px_30px_rgb(0,0,0,0.08)]"
    >
      <div className="p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-slate-100">
            {item.imageURL ? (
              <img
                src={item.imageURL}
                alt={item.herbName}
                className="h-full w-full object-cover"
              />
            ) : (
              <FaLeaf className="text-2xl text-emerald-300" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="truncate text-lg font-black text-slate-900">
              {item.herbName}
            </h3>
            <p className="truncate text-xs font-semibold italic text-slate-500">
              {item.scientificName}
            </p>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-700/70">
            Price / Kg
          </p>
          <p className="mt-1 text-xl font-black text-emerald-700">
            {item.pricePerKilo != null ? `${item.pricePerKilo} EGP` : "—"}
          </p>
        </div>
      </div>

      <div className="mt-auto border-t border-slate-100 bg-slate-50/80 p-4">
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={() => openInventoryEditModal(item)}
            className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-white text-xs font-bold text-emerald-700 transition-colors hover:bg-emerald-50"
          >
            <FaPen className="text-[10px]" />
            Edit Price
          </button>
          <button
            type="button"
            onClick={() => handleDeleteInventoryItem(item)}
            disabled={deletingInventoryId === (item.inventoryId || item.id)}
            className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-red-200 bg-white text-xs font-bold text-red-700 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <FaTrash className="text-[10px]" />
            Remove
          </button>
        </div>

        <button
          type="button"
          onClick={() => openDetailsModal({ herbId: item.herbId })}
          className="mt-2 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-xs font-bold uppercase tracking-wider text-slate-700 transition-colors hover:border-emerald-300 hover:text-emerald-700"
        >
          <FaEye className="text-[10px]" />
          View Herb Details
        </button>
      </div>
    </motion.article>
  );

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
      <section className="rounded-3xl border border-emerald-200 bg-linear-to-br from-emerald-50 via-white to-slate-50 p-5 sm:p-6 lg:p-8">
        <div className="flex flex-col gap-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-start gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/25">
                <FaLeaf className="text-lg" />
              </div>
              <div className="min-w-0">
                <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                  {isManagedPage
                    ? "My Added Herbs"
                    : isReadOnlyPage
                      ? "Read-Only Herbs"
                      : "Herb Inventory"}
                </h1>
                <p className="mt-1 text-sm font-medium text-slate-600 sm:text-base">
                  {isManagedPage
                    ? "Herbs you added and can fully manage."
                    : isReadOnlyPage
                      ? "All herbs you can view but not edit."
                      : "Manage all herbs currently listed in your inventory."}
                </p>
              </div>
            </div>

            {isManagedPage ? (
              <button
                type="button"
                onClick={openCreateModal}
                className="hidden h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition-all hover:-translate-y-0.5 hover:bg-emerald-700 md:inline-flex"
              >
                <FaPlus className="text-xs" />
                Add Herb
              </button>
            ) : null}
          </div>

          <div className="inline-flex w-full rounded-xl border border-slate-200 bg-white p-1 sm:w-fit">
            <Link
              to="/herbalist/dashboard/herbs/managed"
              className={`inline-flex h-9 items-center justify-center rounded-lg px-3 text-xs font-bold uppercase tracking-wider transition-colors sm:px-4 ${
                isManagedPage
                  ? "bg-emerald-600 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              My Added Herbs
            </Link>
            <Link
              to="/herbalist/dashboard/herbs/readonly"
                className={`inline-flex h-9 items-center justify-center rounded-lg px-3 text-xs font-bold uppercase tracking-wider transition-colors sm:px-4 ${
                isReadOnlyPage
                  ? "bg-emerald-600 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              Read-Only Herbs
            </Link>
            <Link
              to="/herbalist/dashboard/herbs/inventory"
              className={`inline-flex h-9 items-center justify-center rounded-lg px-3 text-xs font-bold uppercase tracking-wider transition-colors sm:px-4 ${
                isInventoryPage
                  ? "bg-emerald-600 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              Inventory
            </Link>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                Total Herbs
              </p>
              <p className="mt-1 text-2xl font-black text-slate-900">
                {herbs.length}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                Approved
              </p>
              <p className="mt-1 text-2xl font-black text-emerald-700">
                {approvedCount}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                Manageable
              </p>
              <p className="mt-1 text-2xl font-black text-slate-900">
                {managedCount}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                Read-Only
              </p>
              <p className="mt-1 text-2xl font-black text-slate-900">
                {readOnlyCount}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 sm:col-span-2 xl:col-span-4">
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                Inventory Items
              </p>
              <p className="mt-1 text-2xl font-black text-slate-900">
                {inventoryCount}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="relative w-full md:max-w-md">
              <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3.5 text-slate-400">
                <FaSearch className="text-sm" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder={
                  isInventoryPage
                    ? "Search inventory herbs..."
                    : "Search by herb, scientific name, description..."
                }
                className="w-full rounded-xl border border-slate-200 bg-white py-3 pe-4 ps-10 text-sm font-medium text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/10"
              />
            </div>

            {isManagedPage ? (
              <button
                type="button"
                onClick={openCreateModal}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition-all hover:-translate-y-0.5 hover:bg-emerald-700 md:hidden"
              >
                <FaPlus className="text-xs" />
                Add Herb
              </button>
            ) : null}
          </div>
        </div>
      </section>

      {loadError ? (
        <div className="rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm font-bold text-red-700">
          {loadError}
        </div>
      ) : null}

      {isInventoryPage ? (
        isInventoryLoading ? (
          <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-slate-200 bg-white py-20">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-500/30 border-t-emerald-500" />
            <p className="text-sm font-bold uppercase tracking-widest text-slate-400">
              Loading Inventory...
            </p>
          </div>
        ) : filteredInventoryItems.length === 0 ? (
          <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50 py-20 text-center">
            <FaBookOpen className="mx-auto mb-4 text-5xl text-slate-300" />
            <p className="text-xl font-bold text-slate-700">
              No Inventory Herbs Found
            </p>
            <p className="mt-2 text-sm font-medium text-slate-500">
              Add herbs from managed or read-only pages to see them here.
            </p>
          </div>
        ) : (
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filteredInventoryItems.map((item) => renderInventoryCard(item))}
          </section>
        )
      ) : isLoading ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-slate-200 bg-white py-20">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-500/30 border-t-emerald-500" />
          <p className="text-sm font-bold uppercase tracking-widest text-slate-400">
            Loading Herbs...
          </p>
        </div>
      ) : filteredHerbs.length === 0 ? (
        <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50 py-20 text-center">
          <FaLeaf className="mx-auto mb-4 text-5xl text-slate-300" />
          <p className="text-xl font-bold text-slate-700">No Herbs Found</p>
          <p className="mt-2 text-sm font-medium text-slate-500">
            {isManagedPage
              ? "No managed herbs match your current search."
              : "No read-only herbs match your current search."}
          </p>
        </div>
      ) : (
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredHerbs.map((herb) => renderHerbCard(herb))}
        </section>
      )}

      <AnimatePresence>
        {isManagedPage && showFormModal ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/45 p-4 backdrop-blur-md sm:items-center"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-7xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl"
            >
              <div className="flex items-start justify-between gap-4 border-b border-slate-100 bg-slate-50 px-6 py-5">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-700">
                    Herb Registry
                  </p>
                  <h2 className="mt-1 text-xl font-black text-slate-900 sm:text-2xl">
                    {editingHerbId ? "Update Herb" : "Add New Herb"}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={closeFormModal}
                  disabled={isSaving}
                  className="rounded-full bg-white p-2 text-slate-400 shadow-sm transition-all hover:bg-slate-100 hover:text-slate-700 disabled:opacity-60"
                >
                  <FaTimes />
                </button>
              </div>

              <form
                onSubmit={handleSubmit}
                className="max-h-[80vh] overflow-y-auto p-6 sm:p-8"
              >
                {formError ? (
                  <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm font-bold text-red-700">
                    {formError}
                  </div>
                ) : null}

                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-500">
                      Herb Name
                    </label>
                    <input
                      type="text"
                      name="herbName"
                      value={form.herbName}
                      onChange={handleChange}
                      placeholder="e.g. Chamomile"
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition-all focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/10"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-500">
                      Scientific Name
                    </label>
                    <input
                      type="text"
                      name="scientificName"
                      value={form.scientificName}
                      onChange={handleChange}
                      placeholder="e.g. Matricaria chamomilla"
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition-all focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/10"
                    />
                  </div>
                </div>

                <div className="mt-5">
                  <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-500">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows={4}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition-all focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/10"
                  />
                </div>

                <div className="mt-5 grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-500">
                      Benefits
                    </label>
                    <textarea
                      name="benefits"
                      value={form.benefits}
                      onChange={handleChange}
                      rows={3}
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition-all focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/10"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-500">
                      Warnings
                    </label>
                    <textarea
                      name="warnings"
                      value={form.warnings}
                      onChange={handleChange}
                      rows={3}
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition-all focus:border-amber-600 focus:ring-2 focus:ring-amber-600/10"
                    />
                  </div>
                </div>

                <div className="mt-5 grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-500">
                      Dosage
                    </label>
                    <input
                      type="text"
                      name="dosage"
                      value={form.dosage}
                      onChange={handleChange}
                      placeholder="e.g. 1-3 grams daily"
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition-all focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/10"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-500">
                      Image
                    </label>
                    <label className="flex h-11 cursor-pointer items-center justify-between rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 text-xs font-semibold text-slate-600 transition-colors hover:border-emerald-400 hover:bg-slate-100">
                      <span className="truncate">
                        {imageName || "Upload herb image"}
                      </span>
                      <span className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-emerald-100 px-2.5 py-1 text-emerald-700">
                        <FaUpload className="text-[10px]" />
                        Select
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

                <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={closeFormModal}
                    disabled={isSaving}
                    className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 px-5 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-60"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 text-sm font-bold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSaving ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    ) : (
                      <FaCheckCircle className="text-emerald-300" />
                    )}
                    {editingHerbId ? "Save Changes" : "Create Herb"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {selectedInventoryItem ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[55] flex items-center justify-center bg-slate-900/45 p-4 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-6 py-5">
                <h3 className="text-xl font-extrabold text-slate-900">
                  Update Inventory Price
                </h3>
                <button
                  type="button"
                  onClick={closeInventoryEditModal}
                  disabled={isUpdatingInventoryItem}
                  className="rounded-full bg-white p-2 text-slate-400 shadow-sm transition-all hover:bg-slate-100 hover:text-slate-700 disabled:opacity-60"
                >
                  <FaTimes />
                </button>
              </div>

              <form onSubmit={handleUpdateInventoryItem} className="p-6">
                <div className="mb-4 rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-700/70">
                    Herb
                  </p>
                  <p className="mt-1 text-lg font-black text-slate-900">
                    {selectedInventoryItem.herbName}
                  </p>
                </div>

                <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-500">
                  Price / Kg
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 start-0 flex items-center ps-4 text-sm font-extrabold text-slate-400">
                    EGP
                  </span>
                  <input
                    autoFocus
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={inventoryPriceValue}
                    onChange={(event) => setInventoryPriceValue(event.target.value)}
                    placeholder="0.00"
                    className="w-full rounded-xl border border-slate-200 py-3 pe-4 ps-14 text-base font-black text-slate-900 outline-none transition-all focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/10"
                    disabled={isUpdatingInventoryItem}
                  />
                </div>

                <div className="mt-6 flex flex-col gap-3">
                  <button
                    type="submit"
                    disabled={isUpdatingInventoryItem || !inventoryPriceValue}
                    className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 text-sm font-bold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isUpdatingInventoryItem ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    ) : (
                      <FaTags className="text-xs text-emerald-300" />
                    )}
                    Save Price
                  </button>
                  <button
                    type="button"
                    onClick={closeInventoryEditModal}
                    disabled={isUpdatingInventoryItem}
                    className="inline-flex h-11 w-full items-center justify-center rounded-xl border border-slate-200 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-60"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {isDetailsOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[58] flex items-end justify-center bg-slate-900/45 p-4 backdrop-blur-md sm:items-center"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl"
            >
              <div className="flex items-start justify-between gap-4 border-b border-slate-100 bg-slate-50 px-6 py-5">
                <div className="min-w-0">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-700">
                    Herb Details
                  </p>
                  <h3 className="truncate text-xl font-black text-slate-900 sm:text-2xl">
                    {selectedHerbDetails?.herbName || "Herb"}
                  </h3>
                  <p className="truncate text-xs font-semibold italic text-slate-500">
                    {selectedHerbDetails?.scientificName || "Scientific name"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeDetailsModal}
                  className="rounded-full bg-white p-2 text-slate-400 shadow-sm transition-all hover:bg-slate-100 hover:text-slate-700"
                >
                  <FaTimes />
                </button>
              </div>

              <div className="max-h-[75vh] overflow-y-auto p-6">
                {isDetailsLoading ? (
                  <div className="flex justify-center py-12">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500/30 border-t-emerald-500" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-[120px_1fr]">
                      <div className="h-30 w-30 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
                        {selectedHerbDetails?.imageURL ? (
                          <img
                            src={selectedHerbDetails.imageURL}
                            alt={selectedHerbDetails.herbName}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-emerald-300">
                            <FaLeaf className="text-3xl" />
                          </div>
                        )}
                      </div>
                      <div className="grid gap-2 sm:grid-cols-2">
                        <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                            Herb ID
                          </p>
                          <p className="text-sm font-bold text-slate-800">
                            {selectedHerbDetails?.herbId || "—"}
                          </p>
                        </div>
                        <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                            Status
                          </p>
                          <p className="text-sm font-bold text-slate-800">
                            {selectedHerbDetails?.isApproved
                              ? "Approved"
                              : "Pending"}
                          </p>
                        </div>
                        <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                            Created By
                          </p>
                          <p className="text-sm font-bold text-slate-800">
                            {selectedHerbDetails?.herbalistName || "Unknown"}
                          </p>
                        </div>
                        <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                            Herbalist ID
                          </p>
                          <p className="text-sm font-bold text-slate-800">
                            {selectedHerbDetails?.herbalistId ?? "—"}
                          </p>
                        </div>
                        <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 sm:col-span-2">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                            Dosage
                          </p>
                          <p className="text-sm font-semibold text-slate-700">
                            {selectedHerbDetails?.dosage ||
                              "No dosage provided."}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        Description
                      </p>
                      <p className="mt-1 text-sm leading-6 text-slate-700">
                        {selectedHerbDetails?.description ||
                          "No description provided."}
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        Benefits
                      </p>
                      <p className="mt-1 text-sm leading-6 text-slate-700">
                        {selectedHerbDetails?.benefits ||
                          "No benefits provided."}
                      </p>
                    </div>

                    <div className="rounded-xl border border-amber-200 bg-amber-50/60 px-4 py-3">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-amber-700">
                        Warnings
                      </p>
                      <p className="mt-1 text-sm leading-6 text-amber-900/80">
                        {selectedHerbDetails?.warnings ||
                          "No warnings provided."}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {selectedHerbForInventory ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/45 p-4 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-6 py-5">
                <h3 className="text-xl font-extrabold text-slate-900">
                  Add to Inventory
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

              <form onSubmit={handleAddToInventory} className="p-6">
                <div className="mb-6 rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-700/70">
                    Selected Herb
                  </p>
                  <p className="mt-1 truncate text-lg font-black text-slate-900">
                    {selectedHerbForInventory.herbName}
                  </p>
                  <p className="truncate text-xs font-semibold italic text-slate-500">
                    {selectedHerbForInventory.scientificName}
                  </p>
                </div>

                <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-500">
                  Selling Price / Kg
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 start-0 flex items-center ps-4 text-sm font-extrabold text-slate-400">
                    EGP
                  </span>
                  <input
                    autoFocus
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={pricePerKilo}
                    onChange={(event) => setPricePerKilo(event.target.value)}
                    placeholder="0.00"
                    className="w-full rounded-xl border border-slate-200 py-3 pe-4 ps-14 text-base font-black text-slate-900 outline-none transition-all focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/10"
                    disabled={isAddingToInventory}
                  />
                </div>

                <div className="mt-6 flex flex-col gap-3">
                  <button
                    type="submit"
                    disabled={isAddingToInventory || !pricePerKilo}
                    className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 text-sm font-bold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isAddingToInventory ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    ) : (
                      <FaPlus className="text-xs text-emerald-300" />
                    )}
                    Confirm
                  </button>
                  <button
                    type="button"
                    onClick={closeInventoryModal}
                    disabled={isAddingToInventory}
                    className="inline-flex h-11 w-full items-center justify-center rounded-xl border border-slate-200 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-60"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export default HerbalistManageHerbs;
