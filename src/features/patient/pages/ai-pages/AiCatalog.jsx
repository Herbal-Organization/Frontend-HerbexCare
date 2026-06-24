import { useState, useEffect } from "react";
import {
  FaLeaf,
  FaSpinner,
  FaSearch,
  FaExclamationTriangle,
  FaTimes,
} from "react-icons/fa";
import {
  fetchConsultationCatalog,
  fetchCatalogById,
} from "@api/aiConsultations";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";

function HerbCatalog() {
  const { t } = useTranslation();
  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [selectedCatalog, setSelectedCatalog] = useState(null);
  const [catalogDetail, setCatalogDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    loadCatalog();
  }, []);

  const loadCatalog = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchConsultationCatalog();
      setCatalog(Array.isArray(data) ? data : data?.items ? data.items : []);
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        t("aiConsultation.catalog.messages.loadError");
      setError(message);
      toast.error(message);
      console.error("Failed to load catalog:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadCatalogDetail = async (id) => {
    if (!id) return;
    setDetailLoading(true);
    try {
      const data = await fetchCatalogById(id);
      setCatalogDetail(data);
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        t("aiConsultation.catalog.messages.detailError");
      toast.error(message);
      console.error("Failed to load catalog detail:", err);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleSelectCatalog = (item) => {
    setSelectedCatalog(item);
    loadCatalogDetail(item.id || item.consultationId);
  };

  const filteredCatalog = catalog.filter(
    (item) =>
      item.name?.toLowerCase().includes(search.toLowerCase()) ||
      item.description?.toLowerCase().includes(search.toLowerCase()) ||
      item.type?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="rounded-2xl bg-linear-to-br from-emerald-500 to-teal-500 p-4 text-white shadow-lg">
            <FaLeaf className="text-3xl" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              {t("aiConsultation.catalog.title")}
            </h1>
            <p className="text-slate-600">
              {t("aiConsultation.catalog.subtitle")}
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <FaSearch className="absolute start-3 top-3.5 text-slate-400" />
          <input
            type="text"
            placeholder={t("aiConsultation.catalog.searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full ps-10 pe-4 py-3 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          />
        </div>
      </div>

      {/* Error State */}
      {error && !loading && (
        <div className="mb-6 rounded-lg border border-eed-200 bg-red-50 p-4 flex items-center gap-3">
          <FaExclamationTriangle className="text-red-600 text-lg" />
          <div>
            <p className="font-semibold text-red-900">{t("aiConsultation.catalog.messages.loadError")}</p>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
          <button
            onClick={loadCatalog}
            className="ms-auto px-4 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-500 transition text-sm"
          >
            {t("aiConsultation.catalog.actions.retry")}
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="text-center">
            <FaSpinner className="text-4xl text-emerald-600 animate-spin mx-auto mb-4" />
            <p className="text-slate-600">{t("aiConsultation.catalog.loading")}</p>
          </div>
        </div>
      ) : !error ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredCatalog.length > 0 ? (
            filteredCatalog.map((item) => (
              <div
                key={item.id || item.consultationId}
                className="rounded-lg border border-slate-200 bg-white shadow-sm hover:shadow-md transition cursor-pointer overflow-hidden hover:border-emerald-300"
                onClick={() => handleSelectCatalog(item)}
              >
                {/* Header */}
                <div className="bg-linear-to-r from-emerald-50 to-teal-50 p-4 border-b border-slate-200">
                  <h3 className="font-bold text-slate-900 text-lg">
                    {item.name || item.title}
                  </h3>
                  {item.type && (
                    <p className="text-xs text-slate-500 font-medium mt-1">
                      {t("aiConsultation.myConsultations.type")}: {item.type}
                    </p>
                  )}
                </div>

                {/* Content */}
                <div className="p-4 space-y-3">
                  {item.description && (
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-slate-600 mb-2">
                        {t("aiConsultation.myConsultations.description")}
                      </p>
                      <p className="text-sm text-slate-700 line-clamp-2">
                        {item.description}
                      </p>
                    </div>
                  )}

                  {item.focusAreas && (
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-slate-600 mb-2">
                        {t("aiConsultation.catalog.focusAreas")}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {(Array.isArray(item.focusAreas)
                          ? item.focusAreas
                          : item.focusAreas.split(",")
                        ).map((area, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold"
                          >
                            {typeof area === "string" ? area.trim() : area}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {item.duration && (
                    <div className="rounded-lg bg-slate-50 p-3">
                      <p className="text-xs font-bold text-slate-600 mb-1">
                        {t("aiConsultation.catalog.duration")}
                      </p>
                      <p className="text-sm text-slate-700">{item.duration}</p>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <FaLeaf className="text-6xl text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600 text-lg font-medium">
                {t("aiConsultation.catalog.noResults")}
              </p>
            </div>
          )}
        </div>
      ) : null}

      {/* Detailed View Modal */}
      {selectedCatalog && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => {
            setSelectedCatalog(null);
            setCatalogDetail(null);
          }}
        >
          <div
            className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-linear-to-r from-emerald-500 to-teal-500 text-white p-6 sticky top-0 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">
                  {selectedCatalog.name || selectedCatalog.title}
                </h2>
                {selectedCatalog.type && (
                  <p className="text-emerald-100 mt-1">
                    {t("aiConsultation.myConsultations.type")}: {selectedCatalog.type}
                  </p>
                )}
              </div>
              <button
                onClick={() => {
                  setSelectedCatalog(null);
                  setCatalogDetail(null);
                }}
                className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>

            {detailLoading ? (
              <div className="p-6 flex justify-center">
                <FaSpinner className="text-3xl text-emerald-600 animate-spin" />
              </div>
            ) : (
              <div className="p-6 space-y-4">
                {selectedCatalog.description && (
                  <div>
                    <h3 className="font-bold text-slate-900 mb-2">
                      {t("aiConsultation.myConsultations.description")}
                    </h3>
                    <p className="text-slate-700">
                      {selectedCatalog.description}
                    </p>
                  </div>
                )}

                {catalogDetail?.focusAreas && (
                  <div>
                    <h3 className="font-bold text-slate-900 mb-2">
                      {t("aiConsultation.catalog.focusAreas")}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {(Array.isArray(catalogDetail.focusAreas)
                        ? catalogDetail.focusAreas
                        : catalogDetail.focusAreas.split(",")
                      ).map((area, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-sm font-semibold"
                        >
                          {typeof area === "string" ? area.trim() : area}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                 {catalogDetail?.duration && (
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h3 className="font-bold text-blue-900 mb-2">{t("aiConsultation.catalog.duration")}</h3>
                    <p className="text-blue-800">{catalogDetail.duration}</p>
                  </div>
                )}

                 {catalogDetail?.benefits && (
                  <div className="bg-emerald-50 rounded-lg p-4">
                    <h3 className="font-bold text-emerald-900 mb-2">
                      {t("aiConsultation.catalog.benefits")}
                    </h3>
                    <p className="text-emerald-800">{catalogDetail.benefits}</p>
                  </div>
                )}

                 {catalogDetail?.recommendations && (
                  <div className="bg-yellow-50 rounded-lg p-4">
                    <h3 className="font-bold text-yellow-900 mb-2">
                      {t("aiConsultation.myConsultations.recommendations")}
                    </h3>
                    <p className="text-yellow-800">
                      {catalogDetail.recommendations}
                    </p>
                  </div>
                )}

                {/* Add to Consultation Button */}
                 <button
                  className="w-full mt-6 rounded-lg bg-emerald-600 px-4 py-2.5 font-semibold text-white hover:bg-emerald-500 transition"
                  onClick={() => {
                    toast.success(t("aiConsultation.catalog.messages.selected"));
                    setSelectedCatalog(null);
                    setCatalogDetail(null);
                  }}
                >
                  {t("aiConsultation.catalog.actions.use")}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default HerbCatalog;
