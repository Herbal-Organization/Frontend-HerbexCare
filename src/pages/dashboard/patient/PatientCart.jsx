import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../../context/CartContext";
import { createOrder } from "../../../api/orders";
import { toast } from "react-hot-toast";
import CartPageHeader from "./cart-page/CartPageHeader";
import EmptyCartState from "./cart-page/EmptyCartState";
import CartItemsCard from "./cart-page/CartItemsCard";
import OrderSummaryCard from "./cart-page/OrderSummaryCard";
import CheckoutPanel from "./cart-page/CheckoutPanel";
import { getHerbTotal, getRecipeTotal } from "./cart-page/cartUtils";

const resolveOrderId = (orderResponse) => {
  if (!orderResponse) {
    return null;
  }

  if (typeof orderResponse === "string" || typeof orderResponse === "number") {
    return orderResponse;
  }

  return (
    orderResponse.orderId ??
    orderResponse.id ??
    orderResponse.data?.orderId ??
    orderResponse.data?.id ??
    orderResponse.result?.orderId ??
    orderResponse.result?.id ??
    null
  );
};

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
  const [paymentMethod, setPaymentMethod] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const cartCount = getCartCount();
  const herbsTotal = useMemo(
    () => cart.herbs.reduce((sum, herb) => sum + getHerbTotal(herb), 0),
    [cart.herbs],
  );
  const recipesTotal = useMemo(
    () => cart.recipes.reduce((sum, recipe) => sum + getRecipeTotal(recipe), 0),
    [cart.recipes],
  );

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    const normalizedPaymentMethod = paymentMethod.trim().toLowerCase();

    const invalidHerbSelections = cart.herbs.some(
      (herb) => !herb.herbalistId || Number(herb.pricePerKilo) <= 0,
    );
    if (invalidHerbSelections) {
      setError(
        "Please select a valid herbalist and price for each herb before placing the order.",
      );
      return;
    }

    if (!shippingAddress.trim()) {
      setError("Please enter a shipping address.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const orderPayload = {
        shippingAddress,
        paymentMethod: paymentMethod.trim(),
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

      const createdOrder = await createOrder(orderPayload);
      const orderId = resolveOrderId(createdOrder);

      if (!orderId) {
        throw new Error("Order was created but no order id was returned.");
      }

      toast.success("Order placed successfully!");
      clearCart();

      if (normalizedPaymentMethod === "cash") {
        navigate("/patient/dashboard/orders");
        return;
      }

      navigate(`/patient/dashboard/orders/${orderId}/payment`);
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
    <div className="mx-auto max-w-6xl px-3 py-6 sm:px-6 sm:py-10 lg:px-8">
      <CartPageHeader cartCount={cartCount} />

      {cartCount === 0 ? (
        <EmptyCartState />
      ) : (
        <form
          onSubmit={handleCheckout}
          className="grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)] lg:gap-8"
        >
          <CartItemsCard
            herbs={cart.herbs}
            recipes={cart.recipes}
            onRemoveHerb={removeHerbFromCart}
            onUpdateHerb={updateHerbQuantity}
            onRemoveRecipe={removeRecipeFromCart}
            onUpdateRecipe={updateRecipeQuantity}
          />

          <div className="space-y-5 lg:sticky lg:top-6 lg:self-start lg:space-y-6">
            <OrderSummaryCard
              herbs={cart.herbs}
              recipes={cart.recipes}
              herbsTotal={herbsTotal}
              recipesTotal={recipesTotal}
            />

            <CheckoutPanel
              shippingAddress={shippingAddress}
              paymentMethod={paymentMethod}
              isSubmitting={isSubmitting}
              error={error}
              onAddressChange={setShippingAddress}
              onPaymentChange={setPaymentMethod}
            />
          </div>
        </form>
      )}
    </div>
  );
}

export default PatientCart;
