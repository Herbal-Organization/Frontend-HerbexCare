import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaShoppingCart,
  FaTrash,
  FaMapMarkerAlt,
  FaCreditCard,
  FaCheckCircle,
  FaSpinner,
  FaPlus,
  FaMinus,
} from "react-icons/fa";
import { useCart } from "../../../context/CartContext";
import { createOrder } from "../../../api/orders";
import { toast } from "react-hot-toast";

function PatientCart() {
  const {
    cart,
    removeHerbFromCart,
    removeRecipeFromCart,
    updateHerbQuantity,
    updateRecipeQuantity,
    clearCart,
    getCartCount,
  } = useCart();
  const navigate = useNavigate();

  const [shippingAddress, setShippingAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Online");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const cartCount = getCartCount();

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    // Validate that all herbs have a valid herbalistId
    const missingHerbalists = cart.herbs.some((herb) => !herb.herbalistId);
    if (missingHerbalists) {
      setError("Please ensure all herbs have a valid herbalist selected.");
      return;
    }

    // Validate shipping address
    if (!shippingAddress.trim()) {
      setError("Please enter a shipping address.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const orderPayload = {
        shippingAddress,
        paymentMethod,
        herbs: cart.herbs.map((herb) => ({
          herbId: herb.herbId,
          herbalistId: herb.herbalistId,
          quantityPerGram: herb.quantityPerGram,
        })),
        recipes: cart.recipes.map((recipe) => ({
          recipeId: recipe.recipeId,
          quantity: recipe.quantity,
        })),
      };

      await createOrder(orderPayload);

      toast.success("Order placed successfully!");
      clearCart();
      navigate("/patient/orders");
    } catch (err) {
      console.error("Failed to place order", err);
      setError(
        err.response?.data?.message ||
          "Failed to place order. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
          <div className="rounded-xl bg-emerald-100 p-3 text-emerald-600 shadow-inner">
            <FaShoppingCart className="text-2xl" />
          </div>
          Checkout Registry
        </h1>
        {cartCount > 0 && (
          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-bold uppercase tracking-wider text-emerald-700 shadow-sm">
            {cartCount} Element{cartCount === 1 ? "" : "s"} Staged
          </span>
        )}
      </div>

      {cartCount === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-[3rem] border-2 border-dashed border-slate-200 bg-slate-50/50 py-24 text-center">
          <FaShoppingCart className="text-5xl text-slate-300 mb-6" />
          <h2 className="text-2xl font-bold text-slate-700">
            Your Medical Cart is Empty
          </h2>
          <p className="mt-2 text-slate-500 mb-8 max-w-sm">
            Navigate back to the active catalogs to discover proprietary herbs
            and tailored recipes.
          </p>
          <Link
            to="/patient/home"
            className="rounded-full bg-slate-900 px-6 py-3 text-sm font-bold text-white transition-all hover:bg-slate-800 hover:-translate-y-0.5 shadow-md"
          >
            Explore Options
          </Link>
        </div>
      ) : (
        <form
          onSubmit={handleCheckout}
          className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]"
        >
          <div className="space-y-6">
            <div className="rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-sm">
              <h2 className="text-lg font-extrabold text-slate-900 mb-6 flex items-center gap-2">
                Cart Items
              </h2>

              {cart.herbs.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4 border-b border-slate-100 pb-2">
                    Custom Herb Sourcing
                  </h3>
                  <div className="space-y-4">
                    {cart.herbs.map((h, i) => {
                      const estimatedPrice = h.pricePerKilo
                        ? ((h.pricePerKilo * h.quantityPerGram) / 1000).toFixed(
                            2,
                          )
                        : "N/A";
                      return (
                        <div
                          key={`herb-${i}`}
                          className="flex flex-col gap-3 rounded-2xl bg-emerald-50 border border-emerald-100 p-4"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <p className="font-bold text-emerald-900">
                                {h._previewName}
                              </p>
                              <p className="text-xs text-emerald-600 mt-1">
                                By:{" "}
                                <span className="font-semibold">
                                  {h._providerName}
                                </span>
                              </p>
                              <p className="text-xs text-emerald-600 mt-1">
                                Quantity: {h.quantityPerGram}g
                              </p>
                              {h.pricePerKilo && (
                                <div className="text-sm font-semibold text-emerald-700 mt-2">
                                  <span className="text-emerald-600">
                                    {h.pricePerKilo} EGP/kg
                                  </span>
                                  {" × "}
                                  <span className="text-emerald-600">
                                    {h.quantityPerGram}g
                                  </span>
                                  {" = "}
                                  <span className="text-emerald-800 font-bold">
                                    {estimatedPrice} EGP
                                  </span>
                                </div>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                removeHerbFromCart(h.herbId, h.herbalistId)
                              }
                              className="p-2 text-emerald-600 hover:bg-white hover:text-rose-600 rounded-full transition-all shadow-sm"
                              title="Remove from cart"
                            >
                              <FaTrash />
                            </button>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  updateHerbQuantity(
                                    h.herbId,
                                    h.herbalistId,
                                    Math.max(1, h.quantityPerGram - 50),
                                  )
                                }
                                className="w-8 h-8 flex items-center justify-center rounded-full bg-emerald-100 border border-emerald-200 text-emerald-700 font-bold hover:bg-emerald-200 transition-all"
                              >
                                <FaMinus className="text-xs" />
                              </button>
                              <div className="text-center min-w-16 px-2 py-1 bg-white rounded border border-emerald-200">
                                <p className="font-bold text-emerald-900 text-sm">
                                  {h.quantityPerGram}g
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() =>
                                  updateHerbQuantity(
                                    h.herbId,
                                    h.herbalistId,
                                    h.quantityPerGram + 50,
                                  )
                                }
                                className="w-8 h-8 flex items-center justify-center rounded-full bg-emerald-100 border border-emerald-200 text-emerald-700 font-bold hover:bg-emerald-200 transition-all"
                              >
                                <FaPlus className="text-xs" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {cart.recipes.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4 border-b border-slate-100 pb-2">
                    Compound Prescriptions
                  </h3>
                  <div className="space-y-4">
                    {cart.recipes.map((r, i) => (
                      <div
                        key={`rec-${i}`}
                        className="flex items-center justify-between gap-4 rounded-2xl bg-emerald-50 border border-emerald-100 p-4 transition-colors hover:bg-emerald-100"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-emerald-900 truncate">
                            {r._previewName}
                          </p>
                          <p className="text-xs text-emerald-700 mt-1">
                            {Number(r.unitPrice ?? r.price ?? 0).toFixed(2)} EGP
                            each
                          </p>
                          <p className="text-xs font-semibold text-emerald-800 mt-1">
                            Total:{" "}
                            {(
                              Number(r.unitPrice ?? r.price ?? 0) *
                              Number(r.quantity || 0)
                            ).toFixed(2)}{" "}
                            EGP
                          </p>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                updateRecipeQuantity(
                                  r.recipeId,
                                  Math.max(0, r.quantity - 1),
                                )
                              }
                              className="w-8 h-8 flex items-center justify-center rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold hover:bg-emerald-100"
                            >
                              -
                            </button>
                            <div className="text-center w-8">
                              <p className="font-extrabold text-emerald-900">
                                {r.quantity}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                updateRecipeQuantity(r.recipeId, r.quantity + 1)
                              }
                              className="w-8 h-8 flex items-center justify-center rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold hover:bg-emerald-100"
                            >
                              +
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeRecipeFromCart(r.recipeId)}
                            className="p-2 text-emerald-700/50 hover:bg-white hover:text-emerald-700 rounded-full transition-all shadow-sm"
                            title="Remove completely"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Checkout Logic Sidebar */}
          <div className="space-y-6">
            <div className="rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-sm">
              <h2 className="text-lg font-extrabold text-slate-900 mb-6">
                Order Summary
              </h2>

              <div className="space-y-4 mb-6">
                {cart.herbs.length > 0 && (
                  <div className="pb-4 border-b border-slate-100">
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">
                      Herbs ({cart.herbs.length})
                    </p>
                    <div className="space-y-2 text-sm">
                      {cart.herbs.map((h, i) => {
                        const itemTotal = h.pricePerKilo
                          ? (
                              (h.pricePerKilo * h.quantityPerGram) /
                              1000
                            ).toFixed(2)
                          : "0.00";
                        return (
                          <div
                            key={`summary-${i}`}
                            className="flex justify-between text-slate-700"
                          >
                            <span className="font-medium truncate max-w-xs">
                              {h._previewName} ({h.quantityPerGram}g)
                            </span>
                            <span className="font-bold text-emerald-600 whitespace-nowrap ml-2">
                              {itemTotal} EGP
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {cart.recipes.length > 0 && (
                  <div className="pb-4 border-b border-slate-100">
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">
                      Recipes ({cart.recipes.length})
                    </p>
                    <div className="space-y-2 text-sm">
                      {cart.recipes.map((r, i) => (
                        <div
                          key={`recipe-summary-${i}`}
                          className="flex justify-between text-slate-700"
                        >
                          <span className="font-medium truncate max-w-xs">
                            {r._previewName} (x{r.quantity})
                          </span>
                          <span className="font-bold text-emerald-600 whitespace-nowrap ml-2">
                            {(
                              Number(r.unitPrice ?? r.price ?? 0) *
                              Number(r.quantity || 0)
                            ).toFixed(2)}{" "}
                            EGP
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-2">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-semibold text-slate-700">
                      Subtotal (Recipes)
                    </span>
                    <span className="text-lg font-bold text-emerald-600">
                      {(() => {
                        const recipesTotal = cart.recipes.reduce((sum, r) => {
                          return (
                            sum +
                            Number(r.unitPrice ?? r.price ?? 0) *
                              Number(r.quantity || 0)
                          );
                        }, 0);
                        return recipesTotal.toFixed(2);
                      })()}{" "}
                      EGP
                    </span>
                  </div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-semibold text-slate-700">
                      Subtotal (Herbs)
                    </span>
                    <span className="text-lg font-bold text-emerald-600">
                      {(() => {
                        const herbsTotal = cart.herbs.reduce((sum, h) => {
                          return (
                            sum +
                            (h.pricePerKilo
                              ? (h.pricePerKilo * h.quantityPerGram) / 1000
                              : 0)
                          );
                        }, 0);
                        return herbsTotal.toFixed(2);
                      })()}{" "}
                      EGP
                    </span>
                  </div>
                  <div className="flex justify-between items-center mb-3 pt-2 border-t border-slate-100">
                    <span className="text-sm font-semibold text-slate-800">
                      Subtotal (All Items)
                    </span>
                    <span className="text-xl font-extrabold text-emerald-700">
                      {(() => {
                        const herbsTotal = cart.herbs.reduce((sum, h) => {
                          return (
                            sum +
                            (h.pricePerKilo
                              ? (h.pricePerKilo * h.quantityPerGram) / 1000
                              : 0)
                          );
                        }, 0);

                        const recipesTotal = cart.recipes.reduce((sum, r) => {
                          return (
                            sum +
                            Number(r.unitPrice ?? r.price ?? 0) *
                              Number(r.quantity || 0)
                          );
                        }, 0);

                        return (herbsTotal + recipesTotal).toFixed(2);
                      })()}{" "}
                      EGP
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-slate-700">
                      Shipping
                    </span>
                    <span className="text-lg font-bold text-slate-600">
                      TBD
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-sm">
              <h2 className="text-lg font-extrabold text-slate-900 mb-6 flex items-center gap-2">
                Logistics & Verification
              </h2>

              {error && (
                <div className="mb-6 rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-600 border border-red-100">
                  {error}
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <label className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500">
                    <FaMapMarkerAlt />
                    Target Dispatch Address
                  </label>
                  <textarea
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    placeholder="24th Medical Quarter Ave, Suite B..."
                    className="w-full min-h-30 rounded-2xl border-2 border-slate-200/50 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 placeholder:font-medium placeholder:text-slate-400"
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500">
                    <FaCreditCard />
                    Settlement Provider
                  </label>
                  <div className="relative">
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full appearance-none rounded-2xl border-2 border-slate-200/50 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                      disabled={isSubmitting}
                    >
                      <option value="Online" disabled>
                        Online Processing
                      </option>
                      <option value="Cash">Cash</option>
                      <option value="CreditCard">Credit Card</option>
                      <option value="Wallet">Wallet</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={isSubmitting || !shippingAddress.trim()}
                  className="group relative flex w-full h-14 items-center justify-center gap-2 overflow-hidden rounded-2xl bg-emerald-600 px-6 font-bold text-white shadow-lg transition-all hover:bg-emerald-500 hover:shadow-emerald-500/20 disabled:pointer-events-none disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <FaSpinner className="animate-spin text-xl" />
                  ) : (
                    <>
                      <FaCheckCircle className="text-xl opacity-90 group-hover:scale-110 transition-transform" />
                      Finalize Dispensation
                    </>
                  )}
                </button>
                <div className="mt-4 text-center text-xs font-semibold text-slate-400 flex flex-col items-center gap-1">
                  <span>
                    Transactions are rigidly tracked by your unique
                    cryptographic token signature.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}

export default PatientCart;
