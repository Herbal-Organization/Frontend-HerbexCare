import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate, useParams, useLocation } from "react-router-dom";
import {
  FaArrowLeft,
  FaBrain,
  FaCheck,
  FaChevronDown,
  FaChevronUp,
  FaCreditCard,
  FaExclamationCircle,
  FaFlask,
  FaLeaf,
  FaMapMarkerAlt,
  FaPrint,
  FaReceipt,
  FaRedo,
  FaShoppingCart,
  FaSpinner,
  FaStar,
  FaTimesCircle,
  FaTruck,
} from "react-icons/fa";
import { cancelOrder, getOrderById } from "@api/orders";
import { submitRecipeFeedback, submitAiRecipeFeedback } from "@api/feedbacks";
import { getRecipeById as getRecipeByIdApi } from "@api/recipes";
import { OrderTimeline, StatusBadge } from "@components/common";
import { useCart } from "@context/CartContext";
import { toast } from "react-hot-toast";

const normalizeStatus = (status) => (status || "").trim().toLowerCase();

// Once an order is in fulfilment (or beyond) the patient can no longer cancel it.
const isPaidStatus = (status) => {
  const normalized = normalizeStatus(status);
  return (
    normalized === "processing" ||
    normalized === "shipped" ||
    normalized === "partiallyshipped" ||
    normalized === "delivered" ||
    normalized === "partiallydelivered"
  );
};

const isCanceledStatus = (status) => {
  const normalized = normalizeStatus(status);
  return (
    normalized === "canceled" ||
    normalized === "cancelled" ||
    normalized === "partiallycancelled"
  );
};

const canContinuePayment = (order) => {
  const status = normalizeStatus(order?.status);
  const paymentMethod = normalizeStatus(order?.paymentMethod);
  const paymentStatus = normalizeStatus(order?.paymentStatus);

  return (
    status === "pending" &&
    paymentStatus !== "paid" &&
    (paymentMethod === "wallet" || paymentMethod === "creditcard")
  );
};

const ACCENTS = {
  emerald: {
    chip: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300",
    badge:
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
    card: "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-700 hover:border-emerald-200 dark:hover:border-emerald-700",
  },
  teal: {
    chip: "bg-teal-100 text-teal-600 dark:bg-teal-900/40 dark:text-teal-300",
    badge: "bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300",
    card: "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-700 hover:border-teal-200 dark:hover:border-teal-700",
  },
  indigo: {
    chip: "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-300",
    badge:
      "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300",
    card: "bg-indigo-50/40 dark:bg-indigo-900/20 border-indigo-100 dark:border-indigo-800 hover:border-indigo-200 dark:hover:border-indigo-700",
  },
};

const ITEM_STATUS_COLORS = {
  pending: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  awaitingpayment: "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300",
  processing: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  preparing: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300",
  shipped: "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300",
  partiallyshipped: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-300",
  delivered: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  partiallydelivered: "bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300",
  partiallycancelled: "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300",
  cancelled: "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300",
};

function formatStatusLabel(status) {
  return (status || "").replace(/([a-z])([A-Z])/g, "$1 $2");
}

function getItemStatusClass(status) {
  const normalized = (status || "").toLowerCase();
  return ITEM_STATUS_COLORS[normalized] || "bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300";
}

function OrderLineItem({
  imageUrl,
  icon,
  accent,
  typeLabel,
  name,
  unitLabel,
  quantityLabel,
  subTotal,
  itemStatus,
  onBuyAgain,
  onRate,
  onExpand,
  isExpanded,
  details,
  quantity,
  maxQuantity,
  onQuantityChange,
}) {
  const c = ACCENTS[accent] || ACCENTS.emerald;
  const canRate = itemStatus && itemStatus.toLowerCase() === "delivered" && (typeLabel === "Recipe" || typeLabel === "AI Recipe");
  const hasDetails = details && (details.description || details.instructions || details.herbs);

  return (
    <div
      className={`group flex items-stretch gap-4 rounded-2xl border p-4 transition-colors ${c.card}`}
    >
      <div
        className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-base ${c.chip} relative overflow-hidden`}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          icon
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span
            className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${c.badge} flex-shrink-0`}
          >
            {typeLabel}
          </span>
          {itemStatus && (
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${getItemStatusClass(itemStatus)} flex-shrink-0`}
            >
              {formatStatusLabel(itemStatus)}
            </span>
          )}
        </div>
        <p className="mt-1.5 line-clamp-2 text-sm font-bold leading-snug text-slate-900 dark:text-slate-100">
          {name}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <span className="rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
            {unitLabel}
          </span>
          <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500">
            ×
          </span>
          <span className="rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
            {quantityLabel}
          </span>
        </div>

        {/* Expandable details for recipes/AI recipes */}
        {hasDetails && (
          <div className="mt-3 overflow-hidden transition-all duration-300">
            <button
              type="button"
              onClick={onExpand}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
            >
              {isExpanded ? (
                <>
                  <FaChevronUp className="h-3 w-3" /> Hide details
                </>
              ) : (
                <>
                  <FaChevronDown className="h-3 w-3" /> Show details
                </>
              )}
            </button>
            {isExpanded && (
              <div className="mt-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 animate-in slide-in-from-top-2">
                {details.description && (
                  <div className="mb-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">Description</p>
                    <p className="text-sm text-slate-700 dark:text-slate-300">{details.description}</p>
                  </div>
                )}
                {details.instructions && (
                  <div className="mb-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">Instructions</p>
                    <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line">{details.instructions}</p>
                  </div>
                )}
                {details.herbs && details.herbs.length > 0 && (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">Ingredients</p>
                    <div className="flex flex-wrap gap-1.5">
                      {details.herbs.map((h, idx) => (
                        <span key={idx} className="inline-flex items-center gap-1 rounded-full bg-white dark:bg-slate-700 px-2.5 py-1 text-[11px] font-medium text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-600">
                          {h.herbName || h.name} {h.quantity ? `× ${h.quantity}g` : ""}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex shrink-0 flex-col items-end justify-between gap-2 border-l border-slate-100 dark:border-slate-700 pl-4">
        <div className="text-right leading-none">
          <span className="text-lg font-black tracking-tight text-slate-900 dark:text-slate-100">
            {Number(subTotal || 0).toFixed(2)}
          </span>
          <span className="ml-1 text-[11px] font-bold text-slate-400 dark:text-slate-500">
            EGP
          </span>
        </div>

        <div className="flex flex-col gap-1.5 w-full items-end">
          {/* Quantity adjust for reorder */}
          {onQuantityChange && quantity !== undefined && (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
                className="p-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:border-emerald-300 hover:text-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Decrease quantity"
              >
                <FaChevronDown className="h-4 w-4" />
              </button>
              <span className="w-10 text-center text-sm font-bold text-slate-900 dark:text-slate-100">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => onQuantityChange(Math.min(maxQuantity || 99, quantity + 1))}
                disabled={quantity >= (maxQuantity || 99)}
                className="p-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:border-emerald-300 hover:text-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Increase quantity"
              >
                <FaChevronUp className="h-4 w-4" />
              </button>
            </div>
          )}

          {onBuyAgain && (
            <button
              type="button"
              onClick={onBuyAgain}
              className="inline-flex items-center justify-center gap-1.5 rounded-full border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-[10px] font-bold text-slate-500 dark:text-slate-400 transition-all hover:border-emerald-300 hover:text-emerald-600 dark:hover:border-emerald-700 dark:hover:text-emerald-400 sm:opacity-0 sm:group-hover:opacity-100 w-full"
            >
              <FaShoppingCart className="h-2.5 w-2.5" /> Buy again
            </button>
          )}

          {canRate && onRate && (
            <button
              type="button"
              onClick={onRate}
              className="inline-flex items-center justify-center gap-1.5 rounded-full border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/40 px-3 py-1.5 text-[10px] font-bold text-amber-700 dark:text-amber-400 transition-all hover:border-amber-300 hover:bg-amber-100 dark:hover:bg-amber-950/60 w-full sm:opacity-0 sm:group-hover:opacity-100"
            >
              <FaStar className="h-2.5 w-2.5" /> Rate
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function PatientOrderDetails() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { addHerbToCart, addRecipeToCart, addAiRecipeToCart } = useCart();
  const confirmationMessage = location.state?.message;
  const showConfirmation = location.state?.showConfirmation;

  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isCanceling, setIsCanceling] = useState(false);

  // Enhanced features state
  const [expandedItems, setExpandedItems] = useState(new Set());
  const [itemDetails, setItemDetails] = useState({});
  const [ratingModals, setRatingModals] = useState({});
  const [ratingState, setRatingState] = useState({}); // { modalKey: { rating: number, comment: string } }
  const [reorderQuantities, setReorderQuantities] = useState({});

  const fetchOrderDetails = async () => {
    try {
      const data = await getOrderById(orderId);
      setOrder(data);
    } catch (err) {
      console.error("Error fetching order:", err);
      setError(
        err.response?.data?.message ||
          err.response?.data?.title ||
          "Unable to load order details.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Enrich item details for recipes/AI recipes
  const enrichItemDetails = useCallback(async (item, type) => {
    const key = `${type}-${item.recipeId || item.aiRecipeId}`;
    if (itemDetails[key]) return itemDetails[key];

    try {
      let details;
      if (type === "Recipe" && item.recipeId) {
        details = await getRecipeByIdApi(item.recipeId);
      } else if (type === "AI Recipe" && item.aiRecipeId) {
        details = await getRecipeByIdApi(item.aiRecipeId); // AI recipes use recipe API?
      }
      if (details) {
        setItemDetails((prev) => ({ ...prev, [key]: details }));
        return details;
      }
    } catch (err) {
      console.error(`Failed to fetch ${type} details:`, err);
    }
    return null;
  }, [itemDetails]);

  const toggleExpand = (item, type) => {
    const key = `${type}-${item.recipeId || item.aiRecipeId}`;
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
    // Fetch details when expanding
    if (!itemDetails[key]) {
      enrichItemDetails(item, type);
    }
  };

  const openRatingModal = (item, type) => {
    const key = `${type}-${item.recipeId || item.aiRecipeId}`;
    setRatingModals((prev) => ({
      ...prev,
      [key]: { item, type },
    }));
    setRatingState((prev) => ({ ...prev, [key]: { rating: 5, comment: "" } }));
  };

  const closeRatingModal = (item, type) => {
    const key = `${type}-${item.recipeId || item.aiRecipeId}`;
    setRatingModals((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    setRatingState((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const handleRatingChange = (item, type, field, value) => {
    const key = `${type}-${item.recipeId || item.aiRecipeId}`;
    setRatingState((prev) => ({
      ...prev,
      [key]: { ...prev[key], [field]: value },
    }));
  };

  const handleRatingSubmit = async (item, type) => {
    const key = `${type}-${item.recipeId || item.aiRecipeId}`;
    const { rating, comment } = ratingState[key] || { rating: 5, comment: "" };
    try {
      if (type === "Recipe") {
        await submitRecipeFeedback(item.recipeId, { ratingValue: rating, comment });
      } else if (type === "AI Recipe") {
        await submitAiRecipeFeedback(item.aiRecipeId, { ratingValue: rating, comment });
      }
      toast.success("Thank you for your review!");
      closeRatingModal(item, type);
    } catch (err) {
      toast.error("Failed to submit review. Please try again.");
      console.error("Rating error:", err);
    }
  };

  const getReorderQuantity = (item, type) => {
    const key = `${type}-${item.herbId || item.recipeId || item.aiRecipeId}`;
    return reorderQuantities[key] || (type === "Herb" ? (item.quantityPerGram || 100) : (item.quantityPerOne || item.quantity || 1));
  };

  const setReorderQuantity = (item, type, qty) => {
    const key = `${type}-${item.herbId || item.recipeId || item.aiRecipeId}`;
    setReorderQuantities((prev) => ({ ...prev, [key]: qty }));
  };

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const handleCancel = async () => {
    if (
      !window.confirm(
        "Are you sure you want to cancel this order? This action cannot be undone.",
      )
    ) {
      return;
    }

    setIsCanceling(true);
    try {
      await cancelOrder(orderId);
      toast.success("Order canceled successfully");
      navigate("/patient/dashboard/orders");
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          err.response?.data?.title ||
          "Failed to cancel order.",
      );
    } finally {
      setIsCanceling(false);
    }
  };

  const handleBuyAgainHerb = (subOrder, herb) => {
    const qty = getReorderQuantity(herb, "Herb");
    const pricePerKilo = Number(herb.unitPricePerKilo) || 0;
    addHerbToCart({
      herbId: herb.herbId,
      herbalistId: subOrder.herbalistId,
      quantityPerGram: qty,
      pricePerKilo,
      totalPrice: (pricePerKilo * qty) / 1000,
      _previewName: herb.herbName,
      _providerName: subOrder.herbalistName,
    });
    toast.success(`${herb.herbName} (${qty}g) added to cart`);
  };

  const handleBuyAgainRecipe = (subOrder, recipe) => {
    const qty = getReorderQuantity(recipe, "Recipe");
    const unitPrice = Number(recipe.unitPricePerOne) || 0;
    addRecipeToCart({
      recipeId: recipe.recipeId,
      herbalistId: subOrder.herbalistId,
      quantity: qty,
      unitPrice,
      price: unitPrice,
      totalPrice: unitPrice * qty,
      _previewName: recipe.recipeName,
      _providerName: subOrder.herbalistName,
    });
    toast.success(`${recipe.recipeName} (×${qty}) added to cart`);
  };

  const handleBuyAgainAiRecipe = (subOrder, ai) => {
    const qty = getReorderQuantity(ai, "AI Recipe");
    const unitPrice = Number(ai.unitPrice) || 0;
    addAiRecipeToCart({
      aiRecipeId: ai.aiRecipeId,
      herbalistId: subOrder.herbalistId,
      quantity: qty,
      unitPrice,
      price: unitPrice,
      _previewName: ai.recipeName,
      _providerName: subOrder.herbalistName,
      _itemType: "ai-recipe",
    });
    toast.success(`${ai.recipeName} (×${qty}) added to cart`);
  };

  const handleReorder = () => {
    const subOrders = order?.subOrders || [];
    let added = 0;

    subOrders.forEach((subOrder) => {
      (subOrder.herbs || []).forEach((herb) => {
        const qty = getReorderQuantity(herb, "Herb");
        const pricePerKilo = Number(herb.unitPricePerKilo) || 0;
        addHerbToCart({
          herbId: herb.herbId,
          herbalistId: subOrder.herbalistId,
          quantityPerGram: qty,
          pricePerKilo,
          totalPrice: (pricePerKilo * qty) / 1000,
          _previewName: herb.herbName,
          _providerName: subOrder.herbalistName,
        });
        added += 1;
      });
      (subOrder.recipes || []).forEach((recipe) => {
        const qty = getReorderQuantity(recipe, "Recipe");
        const unitPrice = Number(recipe.unitPricePerOne) || 0;
        addRecipeToCart({
          recipeId: recipe.recipeId,
          herbalistId: subOrder.herbalistId,
          quantity: qty,
          unitPrice,
          price: unitPrice,
          totalPrice: unitPrice * qty,
          _previewName: recipe.recipeName,
          _providerName: subOrder.herbalistName,
        });
        added += 1;
      });
      (subOrder.aiRecipes || []).forEach((ai) => {
        const qty = getReorderQuantity(ai, "AI Recipe");
        const unitPrice = Number(ai.unitPrice) || 0;
        addAiRecipeToCart({
          aiRecipeId: ai.aiRecipeId,
          herbalistId: subOrder.herbalistId,
          quantity: qty,
          unitPrice,
          price: unitPrice,
          _previewName: ai.recipeName,
          _providerName: subOrder.herbalistName,
          _itemType: "ai-recipe",
        });
        added += 1;
      });
    });

    if (added === 0) {
      toast.error("No items available to reorder.");
      return;
    }

    navigate("/patient/dashboard/cart");
  };

  const handlePrint = () => window.print();

  if (isLoading) {
    return (
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 dark:border-slate-700 border-t-emerald-500" />
        <p className="mt-6 text-sm font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
          Loading order details
        </p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <Link
          to="/patient/dashboard/orders"
          className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-slate-500 dark:text-slate-400 transition-colors hover:text-emerald-600 dark:text-emerald-400"
        >
          <FaArrowLeft /> Back to orders
        </Link>
        <div className="rounded-[3rem] border border-red-100 dark:border-red-900/50 bg-red-50 dark:bg-red-950/40 p-16 text-center shadow-sm">
          <FaExclamationCircle className="mx-auto mb-6 text-5xl text-red-400" />
          <h2 className="text-2xl font-bold text-red-800 dark:text-red-300">
            Unable to load order
          </h2>
          <p className="mt-2 font-medium text-red-600 dark:text-red-400">
            {error || "Requested order could not be found."}
          </p>
        </div>
      </div>
    );
  }

  const status = order.status || "Pending";
  const isCanceled = isCanceledStatus(status);
  const isPaid = isPaidStatus(status);
  const orderDate = order.orderDate || order.createdAt;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Link
        to="/patient/dashboard/orders"
        className="mb-8 inline-flex items-center gap-2 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-5 py-2 text-sm font-bold text-slate-500 dark:text-slate-400 shadow-sm transition-colors hover:text-emerald-600 dark:text-emerald-400"
      >
        <FaArrowLeft /> Back to orders
      </Link>

      {showConfirmation && (
        <div className="mb-8 rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/30 p-6 shadow-sm sm:p-8">
          <div className="flex items-start gap-4">
            <div className="mt-1 flex shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
              <FaCheck className="text-lg" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-emerald-900 dark:text-emerald-200">
                Order Successfully Sent
              </h3>
              <p className="mt-2 text-sm font-medium text-emerald-700 dark:text-emerald-300">
                {confirmationMessage ||
                  "Your order has been successfully sent to the herbalist for preparation."}
              </p>
              <p className="mt-3 text-xs font-semibold text-emerald-600 dark:text-emerald-400 dark:text-emerald-400">
                You can track the status of your order below and will be
                notified when it's ready.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="mb-8 overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-emerald-600 via-emerald-600 to-teal-700 p-6 shadow-lg dark:border-slate-700 sm:p-8">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="inline-flex rounded-full border border-white/30 bg-white/15 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white backdrop-blur">
                {status}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-100">
                Order ID: {orderId}
              </span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Order #{orderId}
            </h1>
            <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-emerald-50">
              Placed on{" "}
              {new Date(orderDate).toLocaleDateString(undefined, {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}{" "}
              at{" "}
              {new Date(orderDate).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>

          <div className="flex flex-wrap gap-3 print:hidden">
            <button
              type="button"
              onClick={handleReorder}
              className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-2.5 text-sm font-bold text-emerald-700 shadow-md transition-all hover:-translate-y-0.5 hover:bg-emerald-50"
            >
              <FaRedo /> Reorder
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/40 bg-white/10 px-5 py-2.5 text-sm font-bold text-white backdrop-blur transition-all hover:bg-white/20"
            >
              <FaPrint /> Invoice
            </button>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <OrderTimeline status={status} />
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
          <div className="rounded-[2.5rem] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm sm:p-8">
            <h2 className="mb-6 flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 pb-4 text-lg font-extrabold text-slate-900 dark:text-slate-100">
              <FaLeaf /> Order Items
            </h2>

            {order.subOrders?.length ? (
              <div className="space-y-8">
                {order.subOrders.map((subOrder, index) => {
                  const subItemCount =
                    (subOrder.herbs?.length || 0) +
                    (subOrder.recipes?.length || 0) +
                    (subOrder.aiRecipes?.length || 0);
                  const subTotal =
                    (subOrder.herbs || []).reduce(
                      (s, h) => s + (Number(h.subTotal) || 0),
                      0,
                    ) +
                    (subOrder.recipes || []).reduce(
                      (s, r) => s + (Number(r.subTotal) || 0),
                      0,
                    ) +
                    (subOrder.aiRecipes || []).reduce(
                      (s, a) => s + (Number(a.subTotal) || 0),
                      0,
                    );
                  return (
                    <div key={subOrder.subOrderId || index} className="space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-700 pb-2">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-emerald-800 dark:text-emerald-300">
                            From: {subOrder.herbalistName || "Herbalist"}
                          </h3>
                          <span className="rounded-full bg-slate-100 dark:bg-slate-700 px-2 py-0.5 text-[10px] font-bold text-slate-500 dark:text-slate-400">
                            {subItemCount} {subItemCount === 1 ? "item" : "items"}
                          </span>
                        </div>
                        <StatusBadge status={subOrder.status} size="xs" />
                      </div>

                      <div className="space-y-3">
                        {/* Herbs in this suborder */}
                        {subOrder.herbs?.map((herb, hIdx) => {
                          const itemKey = `herb-${herb.herbId}-${hIdx}`;
                          const details = itemDetails[`Recipe-${herb.herbId}`] || itemDetails[`Herb-${herb.herbId}`];
                          const isExpanded = expandedItems.has(`Herb-${herb.herbId}`);
                          const reorderQty = getReorderQuantity(herb, "Herb");
                          return (
                            <OrderLineItem
                              key={itemKey}
                              imageUrl={herb.imageURL || herb.imageUrl || herb.image}
                              icon={<FaLeaf />}
                              accent="emerald"
                              typeLabel="Herb"
                              name={herb.herbName}
                              unitLabel={`${herb.unitPricePerKilo} EGP/kg`}
                              quantityLabel={`${herb.quantityPerGram}g`}
                              subTotal={herb.subTotal}
                              itemStatus={subOrder.status}
                              onBuyAgain={() => handleBuyAgainHerb(subOrder, herb)}
                              onExpand={() => toggleExpand(herb, "Herb")}
                              isExpanded={isExpanded}
                              details={details}
                              quantity={reorderQty}
                              maxQuantity={10000}
                              onQuantityChange={(qty) => setReorderQuantity(herb, "Herb", qty)}
                            />
                          );
                        })}

                        {/* Recipes in this suborder */}
                        {subOrder.recipes?.map((recipe, rIdx) => {
                          const itemKey = `recipe-${recipe.recipeId}-${rIdx}`;
                          const details = itemDetails[`Recipe-${recipe.recipeId}`];
                          const isExpanded = expandedItems.has(`Recipe-${recipe.recipeId}`);
                          const reorderQty = getReorderQuantity(recipe, "Recipe");
                          return (
                            <OrderLineItem
                              key={itemKey}
                              imageUrl={recipe.imageURL || recipe.imageUrl || recipe.image}
                              icon={<FaFlask />}
                              accent="teal"
                              typeLabel="Recipe"
                              name={recipe.recipeName}
                              unitLabel={`${recipe.unitPricePerOne} EGP`}
                              quantityLabel={`×${recipe.quantityPerOne}`}
                              subTotal={recipe.subTotal}
                              itemStatus={subOrder.status}
                              onBuyAgain={() => handleBuyAgainRecipe(subOrder, recipe)}
                              onRate={() => openRatingModal(recipe, "Recipe")}
                              onExpand={() => toggleExpand(recipe, "Recipe")}
                              isExpanded={isExpanded}
                              details={details}
                              quantity={reorderQty}
                              maxQuantity={99}
                              onQuantityChange={(qty) => setReorderQuantity(recipe, "Recipe", qty)}
                            />
                          );
                        })}

                        {/* AI Recipes in this suborder */}
                        {subOrder.aiRecipes?.map((ai, aIdx) => {
                          const itemKey = `ai-${ai.aiRecipeId}-${aIdx}`;
                          const details = itemDetails[`AI Recipe-${ai.aiRecipeId}`];
                          const isExpanded = expandedItems.has(`AI Recipe-${ai.aiRecipeId}`);
                          const reorderQty = getReorderQuantity(ai, "AI Recipe");
                          return (
                            <OrderLineItem
                              key={itemKey}
                              imageUrl={ai.imageURL || ai.imageUrl || ai.image}
                              icon={<FaBrain />}
                              accent="indigo"
                              typeLabel="AI Recipe"
                              name={ai.recipeName}
                              unitLabel={`${ai.unitPrice} EGP`}
                              quantityLabel={`×${ai.quantity}`}
                              subTotal={ai.subTotal}
                              itemStatus={subOrder.status}
                              onBuyAgain={() => handleBuyAgainAiRecipe(subOrder, ai)}
                              onRate={() => openRatingModal(ai, "AI Recipe")}
                              onExpand={() => toggleExpand(ai, "AI Recipe")}
                              isExpanded={isExpanded}
                              details={details}
                              quantity={reorderQty}
                              maxQuantity={99}
                              onQuantityChange={(qty) => setReorderQuantity(ai, "AI Recipe", qty)}
                            />
                          );
                        })}
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-1 text-sm">
                        <span className="font-semibold text-slate-500 dark:text-slate-400">
                          Subtotal
                        </span>
                        <span className="font-extrabold text-slate-900 dark:text-slate-100">
                          {subTotal.toFixed(2)} EGP
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400 dark:text-slate-500">
                <FaLeaf className="mb-4 text-4xl opacity-20" />
                <p>No itemized details available for this order.</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[2.5rem] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm sm:p-8">
            <h2 className="mb-6 flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 pb-4 text-lg font-extrabold text-slate-900 dark:text-slate-100">
              <FaReceipt /> Order Summary
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="font-semibold text-slate-500">
                  Items Total
                </span>
                <span className="font-bold text-slate-900 dark:text-slate-100">
                  {order.itemsTotal || 0} EGP
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-semibold text-slate-500">
                  Delivery Fee
                </span>
                <span className="font-bold text-slate-900 dark:text-slate-100">
                  {order.deliveryFee || 0} EGP
                </span>
              </div>
              <div className="border-t border-slate-100 dark:border-slate-700 pt-4 flex justify-between">
                <span className="text-lg font-extrabold text-slate-900 dark:text-slate-100">
                  Total
                </span>
                <span className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">
                  {order.totalPrice || order.totalCost || 0} EGP
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-6">
          <div className="rounded-[2.5rem] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm sm:p-8">
            <h2 className="mb-6 flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 pb-4 text-lg font-extrabold text-slate-900 dark:text-slate-100">
              <FaMapMarkerAlt /> Shipping & Payment
            </h2>
            <div className="space-y-4 text-sm">
              <div>
                <span className="block font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 text-[10px] mb-1">
                  Address
                </span>
                <p className="font-medium text-slate-700 dark:text-slate-300">
                  {order.shippingAddress || "N/A"}
                </p>
              </div>
              <div>
                <span className="block font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 text-[10px] mb-1">
                  Payment Method
                </span>
                <p className="font-medium text-slate-700 dark:text-slate-300 capitalize">
                  {order.paymentMethod || "N/A"}
                </p>
              </div>
              <div>
                <span className="block font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 text-[10px] mb-1">
                  Payment Status
                </span>
                <p
                  className={`font-bold ${order.paymentStatus === "Paid" ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`}
                >
                  {order.paymentStatus || "Pending"}
                </p>
              </div>

              {/* Delivery Tracking */}
              {order.subOrders?.some((so) => so.trackingNumber) && (
                <div className="border-t border-slate-100 dark:border-slate-700 pt-4">
                  <span className="block font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 text-[10px] mb-3">
                    Delivery Tracking
                  </span>
                  <div className="space-y-2">
                    {order.subOrders.map((subOrder, idx) => (
                      subOrder.trackingNumber && (
                        <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                          <div className="flex items-center gap-3">
                            <FaTruck className="h-5 w-5 text-sky-500" />
                            <div>
                              <p className="font-medium text-slate-700 dark:text-slate-300">
                                {subOrder.herbalistName || "Herbalist"}
                              </p>
                              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                                {subOrder.trackingNumber}
                              </p>
                            </div>
                          </div>
                          <StatusBadge status={subOrder.status} size="xs" />
                        </div>
                      )
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          </div>

          <div className="space-y-3">
            {canContinuePayment(order) ? (
              <Link
                to={`/patient/dashboard/orders/${orderId}/payment`}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-4 text-sm font-bold text-white shadow-lg transition-all hover:bg-slate-800 hover:-translate-y-0.5"
              >
                <FaCreditCard className="text-emerald-400" /> Continue Payment
              </Link>
            ) : null}

            {!isCanceled && !isPaid ? (
              <button
                type="button"
                onClick={handleCancel}
                disabled={isCanceling}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-rose-200 dark:border-rose-800 bg-white dark:bg-slate-800 px-5 py-4 text-sm font-bold text-rose-600 dark:text-rose-400 shadow-sm transition-all hover:bg-rose-50 dark:hover:bg-rose-900/30 disabled:opacity-50"
              >
                {isCanceling ? (
                  <FaSpinner className="animate-spin" />
                ) : (
                  <FaTimesCircle />
                )}
                Cancel Order
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {/* Rating Modals */}
      {Object.values(ratingModals).map((modal) => {
        const key = `${modal.type}-${modal.item.recipeId || modal.item.aiRecipeId}`;
        const { rating, comment } = ratingState[key] || { rating: 0, comment: "" };
        return (
          <div
            key={key}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => closeRatingModal(modal.item, modal.type)}
            role="dialog"
            aria-modal="true"
            aria-labelledby={`rating-modal-title-${modal.item.recipeId || modal.item.aiRecipeId}`}
          >
            <div
              className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-800 p-6 shadow-xl animate-in zoom-in-95"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3
                  id={`rating-modal-title-${modal.item.recipeId || modal.item.aiRecipeId}`}
                  className="text-lg font-bold text-slate-900 dark:text-slate-100"
                >
                  Rate {modal.item.recipeName}
                </h3>
                <button
                  type="button"
                  onClick={() => closeRatingModal(modal.item, modal.type)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  aria-label="Close"
                >
                  <FaTimesCircle className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Your Rating
                  </label>
                  <div className="flex items-center gap-2" role="radiogroup" aria-label="Star rating">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => handleRatingChange(modal.item, modal.type, "rating", star)}
                        className="text-3xl transition-colors"
                        style={{ color: star <= rating ? "#fbbf24" : "#d1d5db" }} // amber-400 when filled, gray-300 when empty
                        aria-label={`${star} star${star > 1 ? "s" : ""}`}
                        aria-pressed={star <= rating}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor={`rating-comment-${key}`} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Comment (optional)
                  </label>
                  <textarea
                    id={`rating-comment-${key}`}
                    rows={3}
                    value={comment}
                    onChange={(e) => handleRatingChange(modal.item, modal.type, "comment", e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    placeholder="Share your experience with this item..."
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => closeRatingModal(modal.item, modal.type)}
                    className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm font-bold text-slate-700 dark:text-slate-300 transition-colors hover:bg-slate-50 dark:hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={rating === 0}
                    onClick={() => handleRatingSubmit(modal.item, modal.type)}
                    className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-bold text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                      rating > 0 ? "bg-emerald-600 hover:bg-emerald-700" : "bg-slate-300 dark:bg-slate-600"
                    }`}
                  >
                    Submit Review
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default PatientOrderDetails;
