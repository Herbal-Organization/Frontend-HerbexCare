import { useEffect, useMemo, useState } from "react";
import { FaLeaf, FaUpload, FaPen, FaTrash } from "react-icons/fa";
import { toast } from "react-hot-toast";
import ProfileLayout from "../../../components/shared/ProfileLayout";
import {
  createHerb,
  getAllHerbs,
  updateHerb,
  deleteHerb,
} from "../../../api/herbs";
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

function HerbalistManageHerbs({ user, dashboardData }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [editingHerbId, setEditingHerbId] = useState(null);
  const [existingHerbs, setExistingHerbs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

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
      
      // Filter herbs added by this herbalist
      const myHerbs = allHerbs.filter(
        (herb) => Number(herb.herbalistId) === Number(herbalistId)
      );
      
      setExistingHerbs(myHerbs);
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
      } else {
        await createHerb(payload);
        toast.success("Herb added successfully!");
      }

      resetForm();
      await loadHerbs();
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
    console.log("Attempting to delete herb:", { herbId, herbName });
    if (
      !window.confirm(
        `Are you sure you want to delete "${herbName}"? This action cannot be undone.`,
      )
    ) {
      return;
    }

    setIsDeleting(true);
    setError("");

    try {
      await deleteHerb(herbId);
      toast.success("Herb deleted successfully!");
      await loadHerbs();
    } catch (err) {
      console.error("Delete herb error:", err);
      console.error("Error response:", err.response);
      console.error("Error response data:", err.response?.data);
      const message =
        err.response?.data?.message ||
        err.response?.data?.title ||
        err.response?.data?.error ||
        err.response?.data ||
        err.message ||
        "Failed to delete herb.";
      setError(message);
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-8">
      <ProfileLayout
        title={editingHerbId ? "Update Herb" : "Add Herb"}
        subtitle={
          editingHerbId
            ? "Edit an existing herb and save it through the herbalist herb API."
            : "Create a new herb entry using the herbalist herb API."
        }
        saving={isSaving}
        onSubmit={handleSubmit}
      >
        {error ? (
          <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        ) : null}

        {editingHerbId ? (
          <div className="mb-6 flex items-center justify-between rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-slate-700">
            <span>Editing herb #{editingHerbId}</span>
            <button
              type="button"
              onClick={resetForm}
              className="font-semibold text-primary"
            >
              Cancel Edit
            </button>
          </div>
        ) : null}

        <div className="mb-8">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
            <FaLeaf className="text-primary" />
            Herb Information
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Herb Name
              </label>
              <input
                type="text"
                name="herbName"
                value={form.herbName}
                onChange={handleChange}
                placeholder="Ginger"
                className="block w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-900 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Scientific Name
              </label>
              <input
                type="text"
                name="scientificName"
                value={form.scientificName}
                onChange={handleChange}
                placeholder="Zingiber officinale"
                className="block w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-900 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        <div className="mb-8">
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Description
          </label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Describe the herb and its common uses."
            className="block min-h-[120px] w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-900 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Benefits
            </label>
            <textarea
              name="benefits"
              value={form.benefits}
              onChange={handleChange}
              placeholder="List benefits separated by commas or sentences."
              className="block min-h-[110px] w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-900 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Warnings
            </label>
            <textarea
              name="warnings"
              value={form.warnings}
              onChange={handleChange}
              placeholder="Add herb warnings, interactions, or cautions."
              className="block min-h-[110px] w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-900 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Dosage
            </label>
            <input
              type="text"
              name="dosage"
              value={form.dosage}
              onChange={handleChange}
              placeholder="1-3 grams daily"
              className="block w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-900 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Herb Image
            </label>
            <label className="flex min-h-[50px] cursor-pointer items-center justify-between rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-600 hover:bg-slate-100">
              <span className="truncate">
                {imageName || "Upload herb image"}
              </span>
              <span className="inline-flex items-center gap-2 font-semibold text-primary">
                <FaUpload className="text-xs" />
                Choose File
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
      </ProfileLayout>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Existing Herbs</h2>
            <p className="mt-1 text-sm text-slate-500">
              Select any herb below to load it into edit mode.
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="py-8 text-center text-sm text-slate-500">
            Loading herbs...
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {existingHerbs.map((herb) => (
              <div
                key={herb.herbId}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="text-base font-bold text-slate-900">
                      {herb.herbName}
                    </p>
                    <p className="mt-1 text-sm italic text-slate-500">
                      {herb.scientificName}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => startEditing(herb)}
                      className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-primary hover:bg-primary hover:text-white transition-colors"
                    >
                      <FaPen className="inline text-[10px]" /> Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(herb.herbId, herb.herbName)}
                      disabled={isDeleting}
                      className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-red-600 hover:bg-red-600 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FaTrash className="inline text-[10px]" /> Delete
                    </button>
                  </div>
                </div>
                <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
                  {herb.description}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default HerbalistManageHerbs;
