import React, { useMemo, useState, useEffect } from "react";
import { FaSearch, FaTimes } from "react-icons/fa";
import { getAllDiseaseNames } from "../../api/diseases";
import { toast } from "react-hot-toast";

/**
 * DiseaseSearchSelect: Lightweight multi-select dropdown for recipes
 * Shows only name, minimal details - no full disease management
 */
export default function DiseaseSearchSelect({
  selectedDiseaseIds = [],
  onSelectionChange = () => {},
  disabled = false,
  isLoading = false,
}) {
  const [diseases, setDiseases] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoadingDiseases, setIsLoadingDiseases] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [error, setError] = useState("");

  // Load diseases on mount
  useEffect(() => {
    const loadDiseases = async () => {
      setIsLoadingDiseases(true);
      setError("");
      try {
        const response = await getAllDiseaseNames();
        const diseaseList = Array.isArray(response)
          ? response
          : Array.isArray(response?.items)
            ? response.items
            : Array.isArray(response?.data)
              ? response.data
              : [];

        const normalized = diseaseList
          .map((disease, index) => {
            const diseaseName =
              disease.diseaseName ?? disease.name ?? disease.label ?? "";
            const diseaseId =
              disease.diseaseId ?? disease.id ?? disease.value ?? diseaseName;
            return {
              diseaseId: String(diseaseId),
              diseaseName: String(diseaseName),
            };
          })
          .filter((d) => d.diseaseName);

        setDiseases(normalized);
      } catch (err) {
        const message =
          err.response?.data?.message ||
          err.response?.data?.title ||
          "Failed to load diseases";
        setError(message);
        toast.error(message);
      } finally {
        setIsLoadingDiseases(false);
      }
    };

    loadDiseases();
  }, []);

  const filteredDiseases = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return diseases;
    return diseases.filter((disease) =>
      disease.diseaseName.toLowerCase().includes(query),
    );
  }, [diseases, searchQuery]);

  const selectedDiseases = useMemo(
    () =>
      selectedDiseaseIds
        .map((id) =>
          diseases.find((disease) => disease.diseaseId === String(id)),
        )
        .filter(Boolean),
    [diseases, selectedDiseaseIds],
  );

  const handleToggle = (diseaseId) => {
    const newIds = selectedDiseaseIds.includes(String(diseaseId))
      ? selectedDiseaseIds.filter((id) => id !== String(diseaseId))
      : [...selectedDiseaseIds, String(diseaseId)];
    onSelectionChange(newIds);
  };

  const handleRemoveTag = (diseaseId) => {
    handleToggle(diseaseId);
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-5 text-slate-400">
          <FaSearch className="text-sm" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setShowDropdown(true)}
          placeholder="Search diseases..."
          disabled={disabled || isLoading || isLoadingDiseases}
          className="block w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-3 pl-12 pr-4 outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 text-slate-900 text-sm font-medium transition-all hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>

      {selectedDiseases.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedDiseases.map((disease) => (
            <span
              key={disease.diseaseId}
              className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-bold text-primary"
            >
              {disease.diseaseName}
              <button
                type="button"
                onClick={() => handleRemoveTag(disease.diseaseId)}
                disabled={disabled || isLoading}
                className="text-primary/70 hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaTimes className="text-[10px]" />
              </button>
            </span>
          ))}
        </div>
      )}

      {showDropdown && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowDropdown(false)}
          />
          <div className="relative z-50 rounded-2xl border border-slate-100 bg-white shadow-lg">
            <div className="max-h-48 overflow-auto">
              {isLoadingDiseases ? (
                <div className="flex items-center justify-center p-6">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent" />
                </div>
              ) : error ? (
                <div className="p-4 text-sm text-red-600">{error}</div>
              ) : filteredDiseases.length > 0 ? (
                filteredDiseases.map((disease) => {
                  const isSelected = selectedDiseaseIds.includes(
                    String(disease.diseaseId),
                  );
                  return (
                    <button
                      key={disease.diseaseId}
                      type="button"
                      onClick={() => handleToggle(disease.diseaseId)}
                      className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors border-l-2 ${isSelected ? "border-l-primary bg-primary/5 text-primary" : "border-l-transparent text-slate-900 hover:bg-slate-50"}`}
                    >
                      <span className="flex items-center justify-between">
                        {disease.diseaseName}
                        {isSelected && <span className="text-primary">✓</span>}
                      </span>
                    </button>
                  );
                })
              ) : (
                <div className="p-4 text-sm text-slate-500 text-center">
                  No diseases found
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
