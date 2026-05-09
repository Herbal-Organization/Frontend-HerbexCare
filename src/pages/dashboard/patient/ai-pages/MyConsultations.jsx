import { useState, useEffect } from "react";
import {
  FaBrain,
  FaSpinner,
  FaSearch,
  FaExclamationTriangle,
  FaTimes,
  FaClock,
} from "react-icons/fa";
import {
  fetchMyConsultations,
  fetchMyConsultationById,
} from "../../../../api/aiConsultations";
import { toast } from "react-hot-toast";

function MyConsultations() {
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [consultationDetail, setConsultationDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    loadConsultations();
  }, []);

  const loadConsultations = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchMyConsultations();
      setConsultations(
        Array.isArray(data) ? data : data?.items ? data.items : []
      );
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to load consultations";
      setError(message);
      toast.error(message);
      console.error("Failed to load consultations:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadConsultationDetail = async (id) => {
    if (!id) return;
    setDetailLoading(true);
    try {
      const data = await fetchMyConsultationById(id);
      setConsultationDetail(data);
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to load consultation details";
      toast.error(message);
      console.error("Failed to load consultation detail:", err);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleSelectConsultation = (item) => {
    setSelectedConsultation(item);
    loadConsultationDetail(item.id || item.consultationId);
  };

  const filteredConsultations = consultations.filter(
    (item) =>
      item.title?.toLowerCase().includes(search.toLowerCase()) ||
      item.description?.toLowerCase().includes(search.toLowerCase()) ||
      item.type?.toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (dateString) => {
    if (!dateString) return "Date unknown";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="rounded-2xl bg-linear-to-br from-blue-500 to-purple-500 p-4 text-white shadow-lg">
            <FaBrain className="text-3xl" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              My Consultations
            </h1>
            <p className="text-slate-600">Review your past AI consultations</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <FaSearch className="absolute left-3 top-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search consultations by title or type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>
      </div>

      {/* Error State */}
      {error && !loading && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 flex items-center gap-3">
          <FaExclamationTriangle className="text-red-600 text-lg" />
          <div>
            <p className="font-semibold text-red-900">Failed to load consultations</p>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
          <button
            onClick={loadConsultations}
            className="ml-auto px-4 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-500 transition text-sm"
          >
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="text-center">
            <FaSpinner className="text-4xl text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-slate-600">Loading your consultations...</p>
          </div>
        </div>
      ) : !error ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredConsultations.length > 0 ? (
            filteredConsultations.map((item) => (
              <div
                key={item.id || item.consultationId}
                className="rounded-lg border border-slate-200 bg-white shadow-sm hover:shadow-md transition cursor-pointer overflow-hidden hover:border-blue-300"
                onClick={() => handleSelectConsultation(item)}
              >
                {/* Header */}
                <div className="bg-linear-to-r from-blue-50 to-purple-50 p-4 border-b border-slate-200">
                  <h3 className="font-bold text-slate-900 text-lg">
                    {item.title || item.consultationType}
                  </h3>
                  {item.type && (
                    <p className="text-xs text-slate-500 font-medium mt-1">
                      Type: {item.type}
                    </p>
                  )}
                </div>

                {/* Content */}
                <div className="p-4 space-y-3">
                  {item.description && (
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-slate-600 mb-2">
                        Description
                      </p>
                      <p className="text-sm text-slate-700 line-clamp-2">
                        {item.description}
                      </p>
                    </div>
                  )}

                  {item.createdAt && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <FaClock className="text-sm" />
                      <p className="text-sm">{formatDate(item.createdAt)}</p>
                    </div>
                  )}

                  {item.confidenceScore && (
                    <div className="rounded-lg bg-blue-50 p-2">
                      <p className="text-xs font-bold text-blue-900 mb-1">
                        Confidence
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-blue-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-600"
                            style={{
                              width: `${(item.confidenceScore || 0) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-blue-900">
                          {Math.round((item.confidenceScore || 0) * 100)}%
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <FaBrain className="text-6xl text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600 text-lg font-medium">
                No consultations found matching your search
              </p>
              <p className="text-slate-500 mt-2">
                Start by generating a new consultation using the AI Recipe Generator
              </p>
            </div>
          )}
        </div>
      ) : null}

      {/* Detailed View Modal */}
      {selectedConsultation && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => {
            setSelectedConsultation(null);
            setConsultationDetail(null);
          }}
        >
          <div
            className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-linear-to-r from-blue-500 to-purple-500 text-white p-6 sticky top-0 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">
                  {selectedConsultation.title || selectedConsultation.consultationType}
                </h2>
                {selectedConsultation.type && (
                  <p className="text-blue-100 mt-1">
                    Type: {selectedConsultation.type}
                  </p>
                )}
                {selectedConsultation.createdAt && (
                  <p className="text-blue-100 text-sm mt-1">
                    Created: {formatDate(selectedConsultation.createdAt)}
                  </p>
                )}
              </div>
              <button
                onClick={() => {
                  setSelectedConsultation(null);
                  setConsultationDetail(null);
                }}
                className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>

            {detailLoading ? (
              <div className="p-6 flex justify-center">
                <FaSpinner className="text-3xl text-blue-600 animate-spin" />
              </div>
            ) : (
              <div className="p-6 space-y-4">
                {selectedConsultation.description && (
                  <div>
                    <h3 className="font-bold text-slate-900 mb-2">
                      Description
                    </h3>
                    <p className="text-slate-700">
                      {selectedConsultation.description}
                    </p>
                  </div>
                )}

                {consultationDetail?.symptoms && (
                  <div className="bg-red-50 rounded-lg p-4">
                    <h3 className="font-bold text-red-900 mb-2">Symptoms</h3>
                    <div className="flex flex-wrap gap-2">
                      {(Array.isArray(consultationDetail.symptoms)
                        ? consultationDetail.symptoms
                        : consultationDetail.symptoms.split(",")
                      ).map((symptom, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 rounded-full bg-red-100 text-red-700 text-sm font-semibold"
                        >
                          {typeof symptom === "string" ? symptom.trim() : symptom}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {consultationDetail?.recommendations && (
                  <div className="bg-emerald-50 rounded-lg p-4">
                    <h3 className="font-bold text-emerald-900 mb-2">
                      Recommendations
                    </h3>
                    <p className="text-emerald-800">
                      {consultationDetail.recommendations}
                    </p>
                  </div>
                )}

                {consultationDetail?.preparationInstructions && (
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h3 className="font-bold text-blue-900 mb-3">
                      Preparation Instructions
                    </h3>
                    <ol className="space-y-2 list-decimal list-inside">
                      {(Array.isArray(consultationDetail.preparationInstructions)
                        ? consultationDetail.preparationInstructions
                        : consultationDetail.preparationInstructions.split("\n")
                      ).map((instruction, idx) => (
                        <li
                          key={idx}
                          className="text-blue-800 text-sm"
                        >
                          {typeof instruction === "string"
                            ? instruction.trim()
                            : instruction}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                {selectedConsultation.confidenceScore && (
                  <div className="bg-slate-50 rounded-lg p-4">
                    <h3 className="font-bold text-slate-900 mb-3">
                      Confidence Score
                    </h3>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-linear-to-r from-blue-500 to-purple-500"
                            style={{
                              width: `${
                                (selectedConsultation.confidenceScore || 0) * 100
                              }%`,
                            }}
                          />
                        </div>
                      </div>
                      <span className="text-lg font-bold text-slate-900">
                        {Math.round(
                          (selectedConsultation.confidenceScore || 0) * 100
                        )}
                        %
                      </span>
                    </div>
                  </div>
                )}

                {consultationDetail?.relatedHerbs && (
                  <div>
                    <h3 className="font-bold text-slate-900 mb-3">
                      Related Herbs
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      {(Array.isArray(consultationDetail.relatedHerbs)
                        ? consultationDetail.relatedHerbs
                        : consultationDetail.relatedHerbs.split(",")
                      ).map((herb, idx) => (
                        <div
                          key={idx}
                          className="p-2 rounded-lg border border-emerald-200 bg-emerald-50"
                        >
                          <p className="text-sm font-semibold text-emerald-900">
                            {typeof herb === "string" ? herb.trim() : herb}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default MyConsultations;
