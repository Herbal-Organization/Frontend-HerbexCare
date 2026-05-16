import { useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { FaCartPlus, FaTimes, FaStore } from "react-icons/fa";
import { useCart } from "@context/CartContext";
import { getInventoryAIRecipeHerbalists } from "@api/inventoryAIRecipes";

const extractArray = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

const getAiRecipeId = (recipe) => {
  const candidate = Number(
    recipe?.aiRecipeId || recipe?.recipeId || recipe?.id || recipe?.targetId || 0,
  );
  return Number.isFinite(candidate) && candidate > 0 ? candidate : null;
};

const getProviderId = (provider) =>
  Number(
    provider?.herbalistId ||
      provider?.id ||
      provider?.userId ||
      provider?.providerId ||
      0,
  );

const getProviderName = (provider) =>
  provider?.herbalistName ||
  provider?.fullName ||
  provider?.name ||
  provider?.userName ||
  provider?.username ||
  "Licensed Herbalist";

const getProviderPrice = (provider) => {
  const value =
    provider?.price ||
    provider?.unitPrice ||
    provider?.inventoryPrice ||
    provider?.pricePerRecipe;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

function AiRecipeAddToCartAction({ recipe, recipeTitle, buttonClassName = "" }) {
  const { addAiRecipeToCart } = useCart();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoadingProviders, setIsLoadingProviders] = useState(false);
  const [providers, setProviders] = useState([]);
  const [selectedProviderId, setSelectedProviderId] = useState("");
  const [quantity, setQuantity] = useState("1");

  const aiRecipeId = useMemo(() => getAiRecipeId(recipe), [recipe]);

  const sortedProviders = useMemo(
    () =>
      [...providers].sort((a, b) => {
        const priceA = getProviderPrice(a) || Number.POSITIVE_INFINITY;
        const priceB = getProviderPrice(b) || Number.POSITIVE_INFINITY;
        return priceA - priceB;
      }),
    [providers],
  );

  const selectedProvider = useMemo(
    () =>
      sortedProviders.find(
        (provider) => String(getProviderId(provider)) === String(selectedProviderId),
      ),
    [selectedProviderId, sortedProviders],
  );

  const openModal = async () => {
    if (!aiRecipeId) {
      toast.error("Invalid AI recipe id.");
      return;
    }

    setIsModalOpen(true);
    setIsLoadingProviders(true);
    setSelectedProviderId("");
    setQuantity("1");

    try {
      const response = await getInventoryAIRecipeHerbalists(aiRecipeId);
      const items = extractArray(response);
      setProviders(items);
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.title ||
        "Failed to load herbalist offers for this AI recipe.";
      toast.error(message);
      setProviders([]);
    } finally {
      setIsLoadingProviders(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setProviders([]);
    setSelectedProviderId("");
    setQuantity("1");
  };

  const handleAddToCart = () => {
    if (!aiRecipeId) {
      toast.error("Invalid AI recipe id.");
      return;
    }

    const providerId = Number(selectedProviderId);
    if (!Number.isFinite(providerId) || providerId <= 0 || !selectedProvider) {
      toast.error("Please select a herbalist.");
      return;
    }

    const parsedQuantity = Number(quantity);
    if (!Number.isInteger(parsedQuantity) || parsedQuantity <= 0) {
      toast.error("Please enter a valid quantity.");
      return;
    }

    const unitPrice = getProviderPrice(selectedProvider);
    if (!Number.isFinite(unitPrice) || unitPrice <= 0) {
      toast.error("Selected herbalist has invalid price.");
      return;
    }

    addAiRecipeToCart({
      aiRecipeId,
      herbalistId: providerId,
      quantity: parsedQuantity,
      unitPrice,
      price: unitPrice,
      _previewName: recipeTitle || "AI Recipe",
      _providerName: getProviderName(selectedProvider),
      _itemType: "ai-recipe",
    });

    closeModal();
  };

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className={buttonClassName || "inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-500"}
      >
        <FaCartPlus /> Add to Cart
      </button>

      {isModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-extrabold text-slate-900">Add AI Recipe to Cart</h3>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-full p-2 text-slate-500 hover:bg-slate-100"
              >
                <FaTimes />
              </button>
            </div>

            <p className="mb-4 line-clamp-2 text-sm font-semibold text-slate-700">
              {recipeTitle || "AI Recipe"}
            </p>

            {isLoadingProviders ? (
              <div className="py-8 text-center text-sm font-semibold text-slate-500">
                Loading herbalist offers...
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-500">
                    Select herbalist
                  </label>
                  <select
                    value={selectedProviderId}
                    onChange={(event) => setSelectedProviderId(event.target.value)}
                    className="w-full rounded-2xl border-2 border-slate-200 bg-white px-3 py-3 text-sm font-semibold text-slate-900 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                  >
                    <option value="">
                      {sortedProviders.length
                        ? "Choose herbalist offer"
                        : "No offers available"}
                    </option>
                    {sortedProviders.map((provider, index) => {
                      const providerId = getProviderId(provider);
                      const providerName = getProviderName(provider);
                      const providerPrice = getProviderPrice(provider);
                      return (
                        <option key={`${providerId}-${index}`} value={providerId}>
                          {providerName} • {providerPrice ? `${providerPrice} EGP` : "Price N/A"}
                        </option>
                      );
                    })}
                  </select>
                </div>

                {selectedProvider ? (
                  <div className="mb-4 rounded-2xl border border-emerald-100 bg-emerald-50 p-3 text-sm">
                    <p className="font-semibold text-emerald-800">
                      <FaStore className="me-2 inline" />
                      {getProviderName(selectedProvider)}
                    </p>
                    <p className="mt-1 font-bold text-emerald-700">
                      Price: {getProviderPrice(selectedProvider)} EGP / recipe
                    </p>
                  </div>
                ) : null}

                <div className="mb-6">
                  <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-500">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={quantity}
                    onChange={(event) => setQuantity(event.target.value)}
                    className="w-full rounded-2xl border-2 border-slate-200 bg-white px-3 py-3 text-sm font-semibold text-slate-900 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    className="flex-1 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-500"
                    disabled={!sortedProviders.length}
                  >
                    Add to Cart
                  </button>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}

export default AiRecipeAddToCartAction;
