import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";
import {
  FaEdit,
  FaLeaf,
  FaPlus,
  FaSearch,
  FaSyncAlt,
  FaTrash,
} from "react-icons/fa";
import { getAllHerbs, adminDeleteHerb, adminCreateHerb, adminUpdateHerb } from "@api/herbs";
import StatCard from "@features/admin/components/herbs/StatCard";
import HerbDetailsModal from "@features/admin/components/herbs/HerbDetailsModal";
import HerbFormModal from "@features/admin/components/herbs/HerbFormModal";
import AdminPagination from "@features/admin/components/users/AdminPagination";

const PAGE_SIZE = 10;

function AdminHerbsAllPage() {
  const { t } = useTranslation();
  const [herbs, setHerbs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedHerb, setSelectedHerb] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [processingIds, setProcessingIds] = useState([]);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingHerb, setEditingHerb] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const loadHerbs = async (page = 1) => {
    setIsLoading(true);
    setError("");

    try {
      const response = await getAllHerbs(page, PAGE_SIZE, searchValue);
      const items = Array.isArray(response?.items)
        ? response.items
        : Array.isArray(response)
          ? response
          : [];
      setHerbs(items);
      setTotalPages(Math.max(1, response?.totalPages ?? 1));
      setTotalItems(response?.totalCount ?? items.length);
      setCurrentPage(response?.pageNumber ?? page);
    } catch (err) {
      const message =
        err?.response?.data?.message || "Unable to load herbs.";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHerbs(1);
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchValue]);

  const isProcessing = (id) => processingIds.includes(String(id));

  const handleDelete = async (herb) => {
    const id = String(herb.herbId ?? herb.id);
    if (isProcessing(id)) return;

    if (
      !window.confirm(
        `Delete "${herb.herbName}"? This action cannot be undone.`,
      )
    )
      return;

    setProcessingIds((prev) => [...prev, id]);
    try {
      await adminDeleteHerb(id);
      toast.success(`"${herb.herbName}" deleted.`);
      await loadHerbs(currentPage);
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to delete herb.",
      );
    } finally {
      setProcessingIds((prev) => prev.filter((x) => x !== id));
    }
  };

  const handleFormSubmit = async (payload) => {
    setIsSaving(true);
    setFormError("");
    try {
      if (editingHerb) {
        const id = editingHerb.herbId ?? editingHerb.id;
        await adminUpdateHerb(id, payload);
        toast.success(`"${payload.herbName}" updated.`);
      } else {
        await adminCreateHerb(payload);
        toast.success(`"${payload.herbName}" created.`);
      }
      setShowFormModal(false);
      setEditingHerb(null);
      await loadHerbs(currentPage);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.title ||
        "Failed to save herb.";
      setFormError(msg);
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const openCreateModal = () => {
    setEditingHerb(null);
    setFormError("");
    setShowFormModal(true);
  };

  const openEditModal = (herb) => {
    setEditingHerb(herb);
    setFormError("");
    setShowFormModal(true);
  };

  const closeFormModal = () => {
    setShowFormModal(false);
    setEditingHerb(null);
    setFormError("");
  };

  return (
    <div className="space-y-6 p-4 md:p-8">
      {/* Hero */}
      <section className="overflow-hidden rounded-4xl border border-slate-200 bg-linear-to-br from-slate-900 via-slate-800 to-emerald-900 px-6 py-8 text-white shadow-xl shadow-slate-900/10 md:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-7xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-emerald-200">
              <FaLeaf className="text-sm" />
              {t("adminSidebar.herbs", "Herbs")}
            </span>
            <h1 className="mt-4 text-3xl font-black tracking-tight md:text-5xl">
              {t("adminHerbs.allTitle", "All Herbs")}
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-200 md:text-base">
              {t(
                "adminHerbs.allSubtitle",
                "Browse, search, and manage the full herb catalogue.",
              )}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-emerald-600 shadow-lg shadow-emerald-500/25"
            >
              <FaPlus className="text-xs" />
              Add Herb
            </button>
            <button
              type="button"
              onClick={() => loadHerbs(currentPage)}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/15"
            >
              <FaSyncAlt className="text-sm" />
              Refresh
            </button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        <StatCard
          label="Total herbs"
          value={totalItems}
          hint="Herbs in the catalogue."
          icon={<FaLeaf className="text-2xl" />}
          tone="emerald"
        />
      </div>

      {error && (
        <div className="rounded-3xl border border-rose-100 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/40 px-4 py-3 text-sm font-medium text-rose-700 dark:text-rose-400">
          {error}
        </div>
      )}

      {/* Herbs Table */}
      <section className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-100 dark:border-slate-700 pb-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Herbs Catalogue
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {totalItems} herbs total. Page {currentPage} of {totalPages}.
            </p>
          </div>
          <div className="relative w-full lg:max-w-md">
            <div className="pointer-events-none absolute inset-y-0 inset-s-0 flex items-center ps-4 text-slate-400">
              <FaSearch className="text-sm" />
            </div>
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") loadHerbs(1);
              }}
              placeholder="Search herbs by name..."
              className="block w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-900/70 py-3 ps-11 pe-4 text-sm font-medium text-slate-900 dark:text-slate-100 outline-none transition-all focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-emerald-500/10"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 dark:border-slate-700 border-t-emerald-500" />
          </div>
        ) : herbs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-12 text-center text-sm text-slate-500 dark:text-slate-400">
            {searchValue
              ? `No herbs match "${searchValue}".`
              : "No herbs in the catalogue yet."}
          </div>
        ) : (
          <div className="pt-5">
            <div className="overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-700">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-5 py-3 text-left text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
                        Herb
                      </th>
                      <th className="px-5 py-3 text-left text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
                        Scientific Name
                      </th>
                      <th className="px-5 py-3 text-left text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
                        Dosage
                      </th>
                      <th className="px-5 py-3 text-right text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700 bg-white dark:bg-slate-800">
                    {herbs.map((herb) => {
                      const id = herb.herbId ?? herb.id;
                      return (
                        <tr
                          key={id}
                          onClick={() => {
                            setSelectedHerb(herb);
                            setIsDetailsOpen(true);
                          }}
                          className="cursor-pointer transition-colors hover:bg-emerald-50/40 dark:hover:bg-emerald-900/20"
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              {herb.imageUrl && (
                                <img
                                  src={herb.imageUrl}
                                  alt=""
                                  className="h-10 w-10 rounded-xl object-cover"
                                />
                              )}
                              <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                                {herb.herbName}
                              </p>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-sm italic text-slate-500 dark:text-slate-400">
                            {herb.scientificName || "\u2014"}
                          </td>
                          <td className="px-5 py-4 text-sm text-slate-700 dark:text-slate-300">
                            {herb.dosage || "\u2014"}
                          </td>
                          <td className="px-5 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openEditModal(herb);
                                }}
                                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 transition-colors hover:border-emerald-300 hover:text-emerald-700"
                              >
                                <FaEdit className="text-[10px]" />
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(herb);
                                }}
                                disabled={isProcessing(id)}
                                className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 dark:border-rose-800 px-3 py-2 text-xs font-bold text-rose-700 dark:text-rose-400 transition-colors hover:bg-rose-50 dark:hover:bg-rose-900/30 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                <FaTrash className="text-[10px]" />
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-5">
              <AdminPagination
                totalItems={totalItems}
                itemsPerPage={PAGE_SIZE}
                currentPage={currentPage}
                onPageChange={(page) => loadHerbs(page)}
              />
            </div>
          </div>
        )}
      </section>

      <HerbDetailsModal
        isOpen={isDetailsOpen}
        herb={selectedHerb}
        onClose={() => {
          setIsDetailsOpen(false);
          setSelectedHerb(null);
        }}
      />
      <HerbFormModal
        isOpen={showFormModal}
        herb={editingHerb}
        formError={formError}
        isSaving={isSaving}
        onClose={closeFormModal}
        onSubmit={handleFormSubmit}
      />
    </div>
  );
}

export default AdminHerbsAllPage;
