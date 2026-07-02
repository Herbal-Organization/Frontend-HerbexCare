import { useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { FaCartPlus, FaTimes } from "react-icons/fa";
import { useCart } from "@context/CartContext";

const getAiRecipeId = (recipe) => {
  const candidate = Number(
    recipe?.aiRecipeId ||
      recipe?.recipeId ||
      recipe?.id ||
      recipe?.targetId ||
      0,
  );
  return Number.isFinite(candidate) && candidate > 0 ? candidate : null;
};

const getProviderId = (p) =>
  String(p?.herbalistId ?? p?.userId ?? p?.id ?? "");
const getProviderName = (p) =>
  p?.herbalistName || p?.fullName || p?.name || p?.userName || "Licensed Herbalist";
const getProviderPrice = (p) => {
  const v = p?.price ?? p?.pricePerKilo ?? p?.inventoryPrice;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

function AiRecipeAddToCartAction({
  recipe,
  recipeTitle,
  providers = [],
  buttonClassName = "",
}) {
  const { addAiRecipeToCart } = useCart();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [quantity, setQuantity] = useState("1");
  const [selectedProviderId, setSelectedProviderId] = useState("");

  const aiRecipeId = useMemo(() => getAiRecipeId(recipe), [recipe]);

  const sortedProviders = useMemo(() => {
    const seen = new Set();
    return [...(providers || [])]
      .filter((p) => {
        const id = getProviderId(p);
        if (!id || seen.has(id)) return false;
        seen.add(id);
        return true;
      })
      .sort((a, b) => (getProviderPrice(a) || Infinity) - (getProviderPrice(b) || Infinity));
  }, [providers]);

  const selectedProvider = useMemo(
    () => sortedProviders.find((p) => getProviderId(p) === String(selectedProviderId)),
    [selectedProviderId, sortedProviders],
  );

  const openModal = () => {
    if (!aiRecipeId) {
      toast.error("Invalid AI recipe id.");
      return;
    }
    setIsModalOpen(true);
    setQuantity("1");
    setSelectedProviderId("");
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setQuantity("1");
    setSelectedProviderId("");
  };

  const handleAddToCart = () => {
    if (!aiRecipeId) {
      toast.error("Invalid AI recipe id.");
      return;
    }

    const parsedQuantity = Number(quantity);
    if (!Number.isInteger(parsedQuantity) || parsedQuantity <= 0) {
      toast.error("Please enter a valid quantity.");
      return;
    }

    if (sortedProviders.length > 0 && !selectedProviderId) {
      toast.error("Please select a herbalist.");
      return;
    }

    const unitPrice = selectedProvider
      ? getProviderPrice(selectedProvider) || Number(recipe?.price || recipe?.unitPrice || 0)
      : Number(recipe?.price || recipe?.unitPrice || 0);

    addAiRecipeToCart({
      aiRecipeId,
      herbalistId: selectedProviderId ? Number(selectedProviderId) : 0,
      quantity: parsedQuantity,
      unitPrice,
      price: unitPrice,
      _previewName: recipeTitle || recipe?.recommendedRecipeName || recipe?.recipeName || "AI Recipe",
      _providerName: selectedProvider ? getProviderName(selectedProvider) : "Platform",
      _itemType: "ai-recipe",
    });

    closeModal();
  };

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className={
          buttonClassName ||
          "inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-500"
        }
      >
        <FaCartPlus /> Add to Cart
      </button>

      {isModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-extrabold text-slate-900">
                Add AI Recipe to Cart
              </h3>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-full p-2 text-slate-500 hover:bg-slate-100 transition-colors"
              >
                <FaTimes />
              </button>
            </div>

            <p className="mb-6 line-clamp-2 text-sm font-semibold text-slate-700">
              {recipeTitle || recipe?.recommendedRecipeName || recipe?.recipeName || "AI Recipe"}
            </p>

            {sortedProviders.length > 0 && (
              <div className="mb-6">
                <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-500">
                  Select Herbalist
                </label>
                <select
                  value={selectedProviderId}
                  onChange={(e) => setSelectedProviderId(e.target.value)}
                  className="w-full rounded-2xl border-2 border-slate-200 bg-white px-3 py-3 text-sm font-semibold text-slate-900 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all appearance-none cursor-pointer"
                >
                  <option value="">Choose a herbalist...</option>
                  {sortedProviders.map((p) => {
                    const pid = getProviderId(p);
                    const name = getProviderName(p);
                    const price = getProviderPrice(p);
                    return (
                      <option key={pid} value={pid}>
                        {name}{price ? ` • ${price} EGP` : ""}
                      </option>
                    );
                  })}
                </select>
                {selectedProvider && (
                  <div className="mt-2 p-2 bg-emerald-50 rounded-xl border border-emerald-200">
                    <p className="text-xs font-semibold text-emerald-800">
                      {getProviderName(selectedProvider)}
                      {getProviderPrice(selectedProvider) > 0 && ` — ${getProviderPrice(selectedProvider)} EGP`}
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="mb-8">
              <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-500">
                Quantity
              </label>
              <input
                type="number"
                min="1"
                step="1"
                value={quantity}
                onChange={(event) => setQuantity(event.target.value)}
                className="w-full rounded-2xl border-2 border-slate-200 bg-white px-3 py-3 text-sm font-semibold text-slate-900 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleAddToCart}
                className="flex-1 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-500 shadow-md shadow-emerald-200"
              >
                Confirm Add to Cart
              </button>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-2xl border-2 border-slate-200 px-6 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 hover:border-slate-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

export default AiRecipeAddToCartAction;
