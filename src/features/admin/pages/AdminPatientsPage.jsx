import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";
import {
  FaChevronLeft,
  FaChevronRight,
  FaSearch,
  FaSyncAlt,
  FaTrash,
} from "react-icons/fa";
import { MdHealing } from "react-icons/md";
import {
  getAllPatients,
  getAdminPatientStats,
  deleteAdminPatient,
} from "@api/patients";
import { deleteAdminPatientMedicalHistory } from "@api/medicalHistories";

const DEFAULT_PAGE_SIZE = 10;
const PAGE_SIZE_OPTIONS = [10, 20, 50];

function StatCard({ label, value, icon, tone = "emerald" }) {
  const tones = {
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-100",
    slate: "bg-slate-50 text-slate-700 border-slate-100",
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{label}</p>
          <p className="mt-3 text-3xl font-black text-slate-900">{value ?? "—"}</p>
        </div>
        <div className={`rounded-2xl border p-3 ${tones[tone]}`}>{icon}</div>
      </div>
    </div>
  );
}

function AdminPatientsPage() {
  const { t } = useTranslation();
  const [patients, setPatients] = useState([]);
  const [stats, setStats] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [totalPages, setTotalPages] = useState(1);
  const [searchValue, setSearchValue] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingIds, setDeletingIds] = useState([]);

  const loadData = async ({ nextPage = pageNumber, nextSize = pageSize } = {}) => {
    setIsLoading(true);
    setError("");
    try {
      const [listRes, statsRes] = await Promise.allSettled([
        getAllPatients(nextPage, nextSize, searchValue),
        getAdminPatientStats(),
      ]);

      if (listRes.status === "fulfilled") {
        const items = Array.isArray(listRes.value?.items) ? listRes.value.items : Array.isArray(listRes.value) ? listRes.value : [];
        setPatients(items);
        setTotalPages(Math.max(1, listRes.value?.totalPages ?? 1));
        setPageNumber(listRes.value?.pageNumber ?? nextPage);
      }

      if (statsRes.status === "fulfilled") {
        setStats(statsRes.value);
      }

      const rejection = [listRes, statsRes].find((r) => r.status === "rejected");
      if (rejection) {
        setError(rejection.reason?.response?.data?.message || "Unable to load patients.");
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to load patients.");
      toast.error("Unable to load patients.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadData({ nextPage: 1, nextSize: pageSize }); }, [pageSize]);
  useEffect(() => { loadData({ nextPage: pageNumber, nextSize: pageSize }); }, [pageNumber]);

  const handleDelete = async (patient) => {
    const id = String(patient.patientId ?? patient.userId ?? patient.id);
    if (deletingIds.includes(id)) return;
    if (!window.confirm(`Delete patient "${patient.userName || patient.fullName}"? This cannot be undone.`)) return;

    setDeletingIds((prev) => [...prev, id]);
    try {
      await deleteAdminPatient(id);
      toast.success("Patient deleted.");
      await loadData({ nextPage: pageNumber, nextSize: pageSize });
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete patient.");
    } finally {
      setDeletingIds((prev) => prev.filter((x) => x !== id));
    }
  };

  const handleDeleteMedicalHistory = async (patient) => {
    const id = String(patient.patientId ?? patient.userId ?? patient.id);
    if (!window.confirm(`Delete medical history for "${patient.userName || patient.fullName}"?`)) return;

    try {
      await deleteAdminPatientMedicalHistory(id);
      toast.success("Medical history deleted.");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete medical history.");
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-8">
      <section className="overflow-hidden rounded-4xl border border-slate-200 bg-linear-to-br from-slate-900 via-slate-800 to-emerald-900 px-6 py-8 text-white shadow-xl shadow-slate-900/10 md:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-7xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-emerald-200">
              <MdHealing className="text-sm" />
              Patients
            </span>
            <h1 className="mt-4 text-3xl font-black tracking-tight md:text-5xl">{t("adminPatients.title", "Manage Patients")}</h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-200 md:text-base">{t("adminPatients.subtitle", "View and manage all patient accounts on the platform.")}</p>
          </div>
          <button type="button" onClick={() => loadData({ nextPage: pageNumber, nextSize: pageSize })} className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/15"><FaSyncAlt className="text-sm" />Refresh</button>
        </div>
      </section>

      {stats && (
        <div className="grid gap-4 md:grid-cols-2">
          <StatCard label="Total patients" value={stats.totalPatients ?? stats.total} icon={<MdHealing className="text-2xl" />} tone="emerald" />
          <StatCard label="Active" value={stats.activePatients ?? stats.active} icon={<MdHealing className="text-2xl" />} tone="emerald" />
        </div>
      )}

      {error && (
        <div className="rounded-3xl border border-rose-100 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/40 px-4 py-3 text-sm font-medium text-rose-700 dark:text-rose-400">{error}</div>
      )}

      <section className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-100 dark:border-slate-700 pb-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Patients list</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Page {pageNumber} of {totalPages}.</p>
          </div>
          <div className="flex w-full flex-col gap-3 lg:w-auto lg:flex-row lg:items-center">
            <div className="relative w-full lg:w-72">
              <div className="pointer-events-none absolute inset-y-0 inset-s-0 flex items-center ps-4 text-slate-400"><FaSearch className="text-sm" /></div>
              <input type="text" value={searchValue} onChange={(e) => setSearchValue(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") loadData({ nextPage: 1, nextSize: pageSize }); }} placeholder="Search patients..." className="block w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-900/70 py-3 ps-11 pe-4 text-sm font-medium text-slate-900 dark:text-slate-100 outline-none transition-all focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-emerald-500/10" />
            </div>
            <div className="flex items-center gap-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-900/70 px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
              <span className="text-slate-500">Size</span>
              <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value) || DEFAULT_PAGE_SIZE); setPageNumber(1); }} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1 text-sm font-bold text-slate-800 dark:text-slate-200 outline-none">
                {PAGE_SIZE_OPTIONS.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12"><div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 dark:border-slate-700 border-t-emerald-500" /></div>
        ) : patients.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-12 text-center text-sm text-slate-500 dark:text-slate-400">No patients found.</div>
        ) : (
          <div className="pt-5">
            <div className="overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-700">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-5 py-3 text-left text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">Name</th>
                      <th className="px-5 py-3 text-left text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">Email</th>
                      <th className="px-5 py-3 text-left text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">Joined</th>
                      <th className="px-5 py-3 text-right text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700 bg-white dark:bg-slate-800">
                    {patients.map((p) => {
                      const id = p.patientId ?? p.userId ?? p.id;
                      const deleting = deletingIds.includes(String(id));
                      return (
                        <tr key={id} className="transition-colors hover:bg-emerald-50/40 dark:hover:bg-emerald-900/20">
                          <td className="px-5 py-4 text-sm font-bold text-slate-900 dark:text-slate-100">{p.userName || p.fullName || "—"}</td>
                          <td className="px-5 py-4 text-sm text-slate-500 dark:text-slate-400">{p.email || "—"}</td>
                          <td className="px-5 py-4 text-sm text-slate-500 dark:text-slate-400">{p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "—"}</td>
                          <td className="px-5 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                            <button type="button" onClick={() => handleDeleteMedicalHistory(p)} className="inline-flex items-center gap-1.5 rounded-xl border border-amber-200 dark:border-amber-800 px-3 py-2 text-xs font-bold text-amber-700 dark:text-amber-400 transition-colors hover:bg-amber-50 dark:hover:bg-amber-900/30">
                              Clear History
                            </button>
                            <button type="button" onClick={() => handleDelete(p)} disabled={deleting} className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 dark:border-rose-800 px-3 py-2 text-xs font-bold text-rose-700 dark:text-rose-400 transition-colors hover:bg-rose-50 dark:hover:bg-rose-900/30 disabled:cursor-not-allowed disabled:opacity-60">
                              {deleting ? <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" /> : <FaTrash className="text-[10px]" />}
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

            {totalPages > 1 && (
              <div className="mt-5 flex items-center justify-center gap-2">
                <button type="button" onClick={() => setPageNumber((p) => Math.max(1, p - 1))} disabled={pageNumber <= 1 || isLoading} className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition-colors hover:border-emerald-300 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"><FaChevronLeft /></button>
                <span className="px-3 text-sm font-bold text-slate-700 dark:text-slate-300">{pageNumber} / {totalPages}</span>
                <button type="button" onClick={() => setPageNumber((p) => Math.min(totalPages, p + 1))} disabled={pageNumber >= totalPages || isLoading} className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition-colors hover:border-emerald-300 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"><FaChevronRight /></button>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}

export default AdminPatientsPage;
