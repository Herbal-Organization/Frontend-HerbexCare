import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Leaf,
  Upload,
  Pencil,
  Trash2,
  CheckCircle,
  Clock,
  BookOpen,
  Eye,
  Plus,
  Search,
  Tag,
  X,
  Package,
} from "lucide-react";
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
import { cn } from "@utils/cn";

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
  } catch {
    console.error("Failed to save locally stored herb IDs");
  }
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

function HerbCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700/50 dark:bg-slate-800/50">
      <div className="h-44 animate-pulse bg-slate-200 dark:bg-slate-700" />
      <div className="p-5">
        <div className="flex items-center gap-3">
          <div className="h-5 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
          <div className="h-5 w-14 animate-pulse rounded-full bg-slate-200 dark:bg-slate-700" />
        </div>
        <div className="mt-1 h-3 w-36 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
        <div className="mt-4 space-y-2">
          <div className="h-3 w-full animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
          <div className="h-3 w-3/4 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
        </div>
      </div>
    </div>
  );
}

function InventoryCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700/50 dark:bg-slate-800/50">
      <div className="h-44 animate-pulse bg-slate-200 dark:bg-slate-700" />
      <div className="p-5">
        <div className="h-5 w-28 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
        <div className="mt-1 h-3 w-36 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
        <div className="mt-4 h-12 w-full animate-pulse rounded-lg bg-slate-200 dark:bg-slate-700" />
      </div>
    </div>
  );
}

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

  const ownedHerbIdsSet = useMemo(() => {
    const ids = new Set(ownedHerbIds.map(toIdString));
    if (herbalistId) {
      Object.entries(herbalistInfoMap).forEach(([herbKey, info]) => {
        if (info?.herbalistId != null && Number(info.herbalistId) === Number(herbalistId)) {
          ids.add(herbKey);
        }
      });
    }
    return ids;
  }, [ownedHerbIds, herbalistId, herbalistInfoMap]);

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

  const inventoryHerbIdsSet = useMemo(
    () =>
      new Set(
        inventoryItems
          .map((item) => item.herbId ?? item.id)
          .filter(Boolean)
          .map(String),
      ),
    [inventoryItems],
  );

  const displayedHerbs = useMemo(
    () => (isManagedPage ? managedHerbs : isReadOnlyPage ? readOnlyHerbs : []),
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
          const lockMessage = "Approved herb: changes require admin action.";
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
    const herbIdStr = String(herb?.herbId || herb?.id);
    const isInInventory = inventoryHerbIdsSet.has(herbIdStr);

    return (
      <motion.article
        key={herb.herbId || herb.id}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="group flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-lg dark:border-slate-700/50 dark:bg-slate-800/50 dark:hover:border-emerald-700/50"
      >
        <div className="relative h-44 overflow-hidden bg-slate-100 dark:bg-slate-700/50">
          {herb.imageURL ? (
            <img
              src={herb.imageURL}
              alt={herb.herbName}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Leaf className="h-10 w-10 text-emerald-300 dark:text-emerald-600" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          {canManage && (
            <div className="absolute top-3 end-3 flex gap-1.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  startEditing(herb);
                }}
                disabled={!canEdit}
                aria-label="Edit herb"
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/90 text-slate-700 shadow-sm backdrop-blur-sm transition-colors hover:bg-white disabled:opacity-40 dark:bg-slate-800/90 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(herb.herbId, herb.herbName);
                }}
                disabled={isDeleting || !canEdit}
                aria-label="Delete herb"
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/90 text-red-600 shadow-sm backdrop-blur-sm transition-colors hover:bg-red-50 disabled:opacity-40 dark:bg-slate-800/90 dark:text-red-400 dark:hover:bg-red-900/30"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col p-5">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              {herb.herbName}
            </h3>
            <div className="flex shrink-0 items-center gap-1">
              {isInInventory && (
                <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                  <CheckCircle className="h-2.5 w-2.5" />
                  Listed
                </span>
              )}
              <span
                className={cn(
                  "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                  approved
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400"
                    : "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400",
                )}
              >
                {approved ? "Approved" : "Pending"}
              </span>
            </div>
          </div>
          <p className="mt-0.5 text-xs italic text-slate-400 dark:text-slate-500">
            {herb.scientificName}
          </p>
          <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            {herb.description}
          </p>

          <div className="mt-auto pt-4">
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              By{" "}
              <span className="font-medium text-slate-600 dark:text-slate-300">
                {creatorName}
              </span>
            </p>
          </div>
        </div>

        <div className="border-t border-slate-100 px-5 py-3 dark:border-slate-700/50">
          {canManage && isLocked && (
            <p className="mb-2 rounded-md bg-amber-50 px-2.5 py-1.5 text-[11px] font-medium text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">
              Approved: admin action required to edit
            </p>
          )}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => openDetailsModal(herb)}
              className="inline-flex h-8 flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 transition-colors hover:border-emerald-300 hover:text-emerald-700 dark:border-slate-700 dark:text-slate-400 dark:hover:border-emerald-600 dark:hover:text-emerald-400"
            >
              <Eye className="h-3.5 w-3.5" />
              Details
            </button>
            {(canManage || isReadOnlyPage) && (
              <button
                type="button"
                onClick={() => openInventoryModal(herb)}
                disabled={isInInventory}
                className={cn(
                  "inline-flex h-8 flex-1 items-center justify-center gap-1.5 rounded-lg text-xs font-medium text-white transition-colors",
                  isInInventory
                    ? "cursor-not-allowed bg-emerald-400 dark:bg-emerald-600"
                    : "bg-emerald-600 hover:bg-emerald-700",
                )}
              >
                <Package className="h-3.5 w-3.5" />
                {isInInventory ? "Listed" : "Inventory"}
              </button>
            )}
          </div>
        </div>
      </motion.article>
    );
  };

  const renderInventoryCard = (item) => (
    <motion.article
      key={item.inventoryId || item.id || item.herbId}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="group flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-lg dark:border-slate-700/50 dark:bg-slate-800/50 dark:hover:border-emerald-700/50"
    >
      <div className="relative h-44 overflow-hidden bg-slate-100 dark:bg-slate-700/50">
        {item.imageURL ? (
          <img
            src={item.imageURL}
            alt={item.herbName}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Leaf className="h-10 w-10 text-emerald-300 dark:text-emerald-600" />
          </div>
        )}
        <div className="absolute top-3 end-3 flex gap-1.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              openInventoryEditModal(item);
            }}
            aria-label="Edit price"
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/90 text-slate-700 shadow-sm backdrop-blur-sm transition-colors hover:bg-white dark:bg-slate-800/90 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteInventoryItem(item);
            }}
            disabled={deletingInventoryId === (item.inventoryId || item.id)}
            aria-label="Remove from inventory"
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/90 text-red-600 shadow-sm backdrop-blur-sm transition-colors hover:bg-red-50 disabled:opacity-40 dark:bg-slate-800/90 dark:text-red-400 dark:hover:bg-red-900/30"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
          {item.herbName}
        </h3>
        <p className="mt-0.5 text-xs italic text-slate-400 dark:text-slate-500">
          {item.scientificName}
        </p>

        <div className="mt-auto pt-4">
          <div className="rounded-lg bg-emerald-50 px-3 py-2 dark:bg-emerald-900/20">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Price / kg
            </p>
            <p className="mt-0.5 text-lg font-bold text-emerald-700 dark:text-emerald-300">
              {item.pricePerKilo != null ? `${item.pricePerKilo} EGP` : "\u2014"}
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-100 px-5 py-3 dark:border-slate-700/50">
        <button
          type="button"
          onClick={() => openDetailsModal({ herbId: item.herbId })}
          className="inline-flex h-8 w-full items-center justify-center gap-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 transition-colors hover:border-emerald-300 hover:text-emerald-700 dark:border-slate-700 dark:text-slate-400 dark:hover:border-emerald-600 dark:hover:text-emerald-400"
        >
          <Eye className="h-3.5 w-3.5" />
          View Herb Details
        </button>
      </div>
    </motion.article>
  );

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
      <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 dark:border-slate-700/50 dark:bg-slate-800/50">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl dark:text-slate-50">
                {isManagedPage
                  ? "My Added Herbs"
                  : isReadOnlyPage
                    ? "Read-Only Herbs"
                    : "Herb Inventory"}
              </h1>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {isManagedPage
                  ? "Herbs you added and can fully manage."
                  : isReadOnlyPage
                    ? "All herbs you can view but not edit."
                    : "Manage all herbs currently listed in your inventory."}
              </p>
            </div>

            {isManagedPage && (
              <button
                type="button"
                onClick={openCreateModal}
                className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 text-sm font-medium text-white shadow-sm transition-colors hover:bg-emerald-700"
              >
                <Plus className="h-4 w-4" />
                Add Herb
              </button>
            )}
          </div>

          <div className="inline-flex w-full rounded-lg bg-slate-100 p-1 sm:w-fit dark:bg-slate-800">
            <Link
              to="/herbalist/dashboard/herbs/managed"
              className={cn(
                "inline-flex h-8 flex-1 items-center justify-center rounded-md px-3 text-xs font-medium transition-colors sm:flex-none sm:px-4",
                isManagedPage
                  ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-slate-100"
                  : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200",
              )}
            >
              My Added
            </Link>
            <Link
              to="/herbalist/dashboard/herbs/readonly"
              className={cn(
                "inline-flex h-8 flex-1 items-center justify-center rounded-md px-3 text-xs font-medium transition-colors sm:flex-none sm:px-4",
                isReadOnlyPage
                  ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-slate-100"
                  : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200",
              )}
            >
              Read-Only
            </Link>
            <Link
              to="/herbalist/dashboard/herbs/inventory"
              className={cn(
                "inline-flex h-8 flex-1 items-center justify-center rounded-md px-3 text-xs font-medium transition-colors sm:flex-none sm:px-4",
                isInventoryPage
                  ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-slate-100"
                  : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200",
              )}
            >
              Inventory
            </Link>
          </div>

          <p className="text-xs text-slate-400 dark:text-slate-500">
            {isManagedPage
              ? "Herbs you created. Edit, delete, or list them in your inventory."
              : isReadOnlyPage
                ? "Herbs by other herbalists. View details or add them to your own inventory."
                : "Herbs you have listed for sale. Manage pricing and availability."}
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-800">
              <span className="text-slate-400 dark:text-slate-500">Total</span>
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                {herbs.length}
              </span>
            </div>
            <div className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm dark:border-emerald-800 dark:bg-emerald-900/20">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span className="font-medium text-emerald-700 dark:text-emerald-400">
                Approved
              </span>
              <span className="font-semibold text-emerald-800 dark:text-emerald-300">
                {approvedCount}
              </span>
            </div>
            {!isInventoryPage && (
              <div className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-800">
                <span className="text-slate-400 dark:text-slate-500">
                  {isManagedPage ? "Manageable" : "Read-Only"}
                </span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  {isManagedPage ? managedCount : readOnlyCount}
                </span>
              </div>
            )}
            {isInventoryPage && (
              <div className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-800">
                <span className="text-slate-400 dark:text-slate-500">
                  Items
                </span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  {inventoryCount}
                </span>
              </div>
            )}
          </div>

          <div className="relative w-full sm:max-w-sm">
            <Search className="pointer-events-none absolute inset-y-0 start-0 ms-3.5 h-4 w-4 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder={
                isInventoryPage
                  ? "Search inventory herbs..."
                  : "Search herbs..."
              }
              className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pe-4 ps-10 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-emerald-500"
            />
          </div>
        </div>
      </section>

      {loadError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          {loadError}
        </div>
      )}

      {isInventoryPage ? (
        isInventoryLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <InventoryCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredInventoryItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 py-16 text-center dark:border-slate-700">
            <div className="mb-4 rounded-2xl bg-slate-100 p-4 dark:bg-slate-800">
              <Package className="h-8 w-8 text-slate-300 dark:text-slate-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">
              No inventory herbs found
            </h3>
            <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">
              Add herbs from managed or read-only pages to see them here.
            </p>
          </div>
        ) : (
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filteredInventoryItems.map((item) => renderInventoryCard(item))}
          </section>
        )
      ) : isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <HerbCardSkeleton key={i} />
          ))}
        </div>
      ) : filteredHerbs.length === 0 ? (
        !searchQuery && isManagedPage ? (
          <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 py-16 text-center dark:border-slate-700">
            <div className="mb-4 rounded-2xl bg-emerald-50 p-4 dark:bg-emerald-900/20">
              <Leaf className="h-10 w-10 text-emerald-400 dark:text-emerald-500" />
            </div>
            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">
              Welcome to your herbarium
            </h3>
            <p className="mt-1 max-w-md text-sm text-slate-500 dark:text-slate-400">
              Start building your catalog so patients can discover your remedies.
            </p>

            <div className="mt-8 grid max-w-lg grid-cols-1 gap-4 sm:grid-cols-3">
              {[
                {
                  icon: Plus,
                  step: "1",
                  title: "Add a Herb",
                  desc: "Submit your herb details for admin review",
                },
                {
                  icon: Clock,
                  step: "2",
                  title: "Get Approved",
                  desc: "Admin will review and approve your listing",
                },
                {
                  icon: Package,
                  step: "3",
                  title: "List in Inventory",
                  desc: "Set a price so patients can order it",
                },
              ].map((item) => (
                <div
                  key={item.step}
                  className="flex flex-col items-center gap-2 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800/50"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
                    {item.step}
                  </div>
                  <item.icon className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                    {item.title}
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={openCreateModal}
              className="mt-8 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-emerald-700"
            >
              <Plus className="h-4 w-4" />
              Add Your First Herb
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 py-16 text-center dark:border-slate-700">
            <div className="mb-4 rotate-3 rounded-2xl bg-slate-100 p-4 dark:bg-slate-800">
              <Leaf className="h-8 w-8 text-slate-300 dark:text-slate-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">
              {searchQuery ? "No matching herbs found" : "No herbs yet"}
            </h3>
            <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">
              {searchQuery
                ? "Try adjusting your search terms."
                : "No read-only herbs match your current search."}
            </p>
          </div>
        )
      ) : (
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredHerbs.map((herb) => renderHerbCard(herb))}
        </section>
      )}

      <AnimatePresence>
        {isManagedPage && showFormModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 p-4 backdrop-blur-sm sm:items-center"
          >
            <motion.div
              initial={{ scale: 0.96, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.96, y: 16 }}
              className="w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-800"
            >
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-700">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    Herb Registry
                  </p>
                  <h2 className="mt-0.5 text-lg font-bold text-slate-900 dark:text-slate-100">
                    {editingHerbId ? "Update Herb" : "Add New Herb"}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={closeFormModal}
                  disabled={isSaving}
                  className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 disabled:opacity-60 dark:hover:bg-slate-700 dark:hover:text-slate-300"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form
                onSubmit={handleSubmit}
                className="max-h-[80vh] overflow-y-auto p-6"
              >
                {formError && (
                  <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
                    {formError}
                  </div>
                )}

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-400">
                      Herb Name
                    </label>
                    <input
                      type="text"
                      name="herbName"
                      value={form.herbName}
                      onChange={handleChange}
                      placeholder="e.g. Chamomile"
                      className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition-colors focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-400">
                      Scientific Name
                    </label>
                    <input
                      type="text"
                      name="scientificName"
                      value={form.scientificName}
                      onChange={handleChange}
                      placeholder="e.g. Matricaria chamomilla"
                      className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition-colors focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-400">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows={3}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition-colors focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  />
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-400">
                      Benefits
                    </label>
                    <textarea
                      name="benefits"
                      value={form.benefits}
                      onChange={handleChange}
                      rows={3}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition-colors focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-400">
                      Warnings
                    </label>
                    <textarea
                      name="warnings"
                      value={form.warnings}
                      onChange={handleChange}
                      rows={3}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition-colors focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                    />
                  </div>
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-400">
                      Dosage
                    </label>
                    <input
                      type="text"
                      name="dosage"
                      value={form.dosage}
                      onChange={handleChange}
                      placeholder="e.g. 1-3 grams daily"
                      className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition-colors focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-400">
                      Image
                    </label>
                    <label className="flex h-10 cursor-pointer items-center justify-between rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3.5 text-xs text-slate-500 transition-colors hover:border-emerald-400 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-400 dark:hover:border-emerald-500">
                      <span className="truncate">
                        {imageName || "Upload herb image"}
                      </span>
                      <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-emerald-100 px-2 py-1 text-[11px] font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                        <Upload className="h-3 w-3" />
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

                <div className="mt-6 flex flex-col-reverse gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end dark:border-slate-700">
                  <button
                    type="button"
                    onClick={closeFormModal}
                    disabled={isSaving}
                    className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-200 px-4 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-60 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSaving ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    ) : (
                      <CheckCircle className="h-4 w-4" />
                    )}
                    {editingHerbId ? "Save Changes" : "Create Herb"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedInventoryItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[55] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.96, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.96, y: 16 }}
              className="w-full max-w-sm overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-800"
            >
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-700">
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Update Price
                </h3>
                <button
                  type="button"
                  onClick={closeInventoryEditModal}
                  disabled={isUpdatingInventoryItem}
                  className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 disabled:opacity-60 dark:hover:bg-slate-700 dark:hover:text-slate-300"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleUpdateInventoryItem} className="p-6">
                <div className="mb-5 rounded-lg bg-emerald-50 px-4 py-3 dark:bg-emerald-900/20">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    Herb
                  </p>
                  <p className="mt-0.5 text-base font-bold text-slate-900 dark:text-slate-100">
                    {selectedInventoryItem.herbName}
                  </p>
                </div>

                <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-400">
                  Price / Kg
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3.5 text-sm font-semibold text-slate-400 dark:text-slate-500">
                    EGP
                  </span>
                  <input
                    autoFocus
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={inventoryPriceValue}
                    onChange={(event) =>
                      setInventoryPriceValue(event.target.value)
                    }
                    placeholder="0.00"
                    className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pe-4 ps-12 text-sm font-semibold text-slate-900 outline-none transition-colors focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                    disabled={isUpdatingInventoryItem}
                  />
                </div>

                <div className="mt-5 flex flex-col gap-2">
                  <button
                    type="submit"
                    disabled={isUpdatingInventoryItem || !inventoryPriceValue}
                    className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isUpdatingInventoryItem ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    ) : (
                      <Tag className="h-4 w-4" />
                    )}
                    Save Price
                  </button>
                  <button
                    type="button"
                    onClick={closeInventoryEditModal}
                    disabled={isUpdatingInventoryItem}
                    className="inline-flex h-10 w-full items-center justify-center rounded-lg border border-slate-200 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-60 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isDetailsOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[58] flex items-end justify-center bg-slate-900/40 p-4 backdrop-blur-sm sm:items-center"
          >
            <motion.div
              initial={{ scale: 0.96, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.96, y: 16 }}
              className="w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-800"
            >
              <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-4 dark:border-slate-700">
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    Herb Details
                  </p>
                  <h3 className="mt-0.5 truncate text-lg font-bold text-slate-900 dark:text-slate-100">
                    {selectedHerbDetails?.herbName || "Herb"}
                  </h3>
                  <p className="mt-0.5 text-xs italic text-slate-400 dark:text-slate-500">
                    {selectedHerbDetails?.scientificName || "Scientific name"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeDetailsModal}
                  className="shrink-0 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-300"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="max-h-[70vh] overflow-y-auto p-6">
                {isDetailsLoading ? (
                  <div className="flex justify-center py-10">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500/30 border-t-emerald-500" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-700">
                        {selectedHerbDetails?.imageURL ? (
                          <img
                            src={selectedHerbDetails.imageURL}
                            alt={selectedHerbDetails.herbName}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-emerald-300">
                            <Leaf className="h-8 w-8" />
                          </div>
                        )}
                      </div>
                      <div className="grid flex-1 grid-cols-2 gap-2">
                        <div className="rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-900/50">
                          <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
                            Status
                          </p>
                          <p className="mt-0.5 text-sm font-semibold text-slate-700 dark:text-slate-200">
                            {selectedHerbDetails?.isApproved
                              ? "Approved"
                              : "Pending"}
                          </p>
                        </div>
                        <div className="rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-900/50">
                          <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
                            Created By
                          </p>
                          <p className="mt-0.5 truncate text-sm font-semibold text-slate-700 dark:text-slate-200">
                            {selectedHerbDetails?.herbalistName || "Unknown"}
                          </p>
                        </div>
                        {selectedHerbDetails?.dosage && (
                          <div className="col-span-2 rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-900/50">
                            <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
                              Dosage
                            </p>
                            <p className="mt-0.5 text-sm font-medium text-slate-700 dark:text-slate-300">
                              {selectedHerbDetails.dosage}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {selectedHerbDetails?.description && (
                      <div className="rounded-lg bg-slate-50 px-4 py-3 dark:bg-slate-900/50">
                        <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
                          Description
                        </p>
                        <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                          {selectedHerbDetails.description}
                        </p>
                      </div>
                    )}

                    {selectedHerbDetails?.benefits && (
                      <div className="rounded-lg bg-slate-50 px-4 py-3 dark:bg-slate-900/50">
                        <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
                          Benefits
                        </p>
                        <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                          {selectedHerbDetails.benefits}
                        </p>
                      </div>
                    )}

                    {selectedHerbDetails?.warnings && (
                      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-800 dark:bg-amber-900/20">
                        <p className="text-[10px] font-medium uppercase tracking-wider text-amber-600 dark:text-amber-400">
                          Warnings
                        </p>
                        <p className="mt-1 text-sm leading-relaxed text-amber-800 dark:text-amber-300">
                          {selectedHerbDetails.warnings}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedHerbForInventory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.96, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.96, y: 16 }}
              className="w-full max-w-sm overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-800"
            >
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-700">
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Add to Inventory
                </h3>
                <button
                  type="button"
                  onClick={closeInventoryModal}
                  className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 disabled:opacity-60 dark:hover:bg-slate-700 dark:hover:text-slate-300"
                  disabled={isAddingToInventory}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleAddToInventory} className="p-6">
                <div className="mb-5 rounded-lg bg-emerald-50 px-4 py-3 dark:bg-emerald-900/20">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    Selected Herb
                  </p>
                  <p className="mt-0.5 truncate text-base font-bold text-slate-900 dark:text-slate-100">
                    {selectedHerbForInventory.herbName}
                  </p>
                  <p className="mt-0.5 text-xs italic text-slate-500 dark:text-slate-400">
                    {selectedHerbForInventory.scientificName}
                  </p>
                </div>

                <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-400">
                  Selling Price / Kg
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3.5 text-sm font-semibold text-slate-400 dark:text-slate-500">
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
                    className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pe-4 ps-12 text-sm font-semibold text-slate-900 outline-none transition-colors focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                    disabled={isAddingToInventory}
                  />
                </div>

                <div className="mt-5 flex flex-col gap-2">
                  <button
                    type="submit"
                    disabled={isAddingToInventory || !pricePerKilo}
                    className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isAddingToInventory ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                    Confirm
                  </button>
                  <button
                    type="button"
                    onClick={closeInventoryModal}
                    disabled={isAddingToInventory}
                    className="inline-flex h-10 w-full items-center justify-center rounded-lg border border-slate-200 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-60 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-700"
                  >
                    Cancel
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
