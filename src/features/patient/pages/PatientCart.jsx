import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@context/CartContext";
import { createOrder, getAllMyOrders } from "@api/orders";
import { getUserFromToken } from "@utils/auth";
import CartPageHeader from "./cart-page/CartPageHeader";
import EmptyCartState from "./cart-page/EmptyCartState";
import CartItemsCard from "./cart-page/CartItemsCard";
import OrderSummaryCard from "./cart-page/OrderSummaryCard";
import CheckoutPanel from "./cart-page/CheckoutPanel";
import { getHerbTotal, getRecipeTotal } from "./cart-page/cartUtils";

const normalizePossibleId = (value) => {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed ? trimmed : null;
  }

  return null;
};

const resolveOrderId = (orderResponse) => {
  const directId = normalizePossibleId(orderResponse);
  if (directId !== null) {
    return directId;
  }

  const candidates = [
    orderResponse?.orderId,
    orderResponse?.id,
    orderResponse?.order?.orderId,
    orderResponse?.order?.id,
    orderResponse?.data?.orderId,
    orderResponse?.data?.id,
    orderResponse?.data?.order?.orderId,
    orderResponse?.data?.order?.id,
    orderResponse?.data?.data?.orderId,
    orderResponse?.data?.data?.id,
    orderResponse?.data?.value?.orderId,
    orderResponse?.data?.value?.id,
    orderResponse?.result?.orderId,
    orderResponse?.result?.id,
    orderResponse?.result?.data?.orderId,
    orderResponse?.result?.data?.id,
  ];

  for (const candidate of candidates) {
    const normalized = normalizePossibleId(candidate);
    if (normalized !== null) {
      return normalized;
    }
  }

  return null;
};

const normalizeOrdersList = (ordersResponse) => {
  if (Array.isArray(ordersResponse)) {
    return ordersResponse;
  }
  if (Array.isArray(ordersResponse?.items)) {
    return ordersResponse.items;
  }
  if (Array.isArray(ordersResponse?.data)) {
    return ordersResponse.data;
  }
  return [];
};

const toOrderTime = (order) => {
  const raw = order?.orderDate || order?.createdAt;
  if (!raw) return null;
  const time = new Date(raw).getTime();
  return Number.isFinite(time) ? time : null;
};

const pickLatestOrderId = (orders) => {
  if (!Array.isArray(orders) || orders.length === 0) {
    return null;
  }

  const withTime = orders
    .map((order) => ({
      order,
      time: toOrderTime(order),
      id: normalizePossibleId(order?.orderId ?? order?.id),
    }))
    .filter((entry) => entry.id !== null);

  if (withTime.length === 0) {
    return null;
  }

  const anyHasTime = withTime.some((entry) => entry.time !== null);
  if (anyHasTime) {
    withTime.sort((a, b) => (b.time ?? -Infinity) - (a.time ?? -Infinity));
    return withTime[0].id;
  }

  const numericIds = withTime
    .map((entry) => entry.id)
    .filter((id) => typeof id === "number");
  if (numericIds.length > 0) {
    return Math.max(...numericIds);
  }

  return withTime[0].id;
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const buildShippingAddress = (profile, userDetails) =>
  [
    profile?.street,
    profile?.city,
    profile?.governorate,
    userDetails?.street,
    userDetails?.city,
    userDetails?.governorate,
  ]
    .filter(Boolean)
    .join(", ");

function PatientCart({ dashboardData }) {
  const {
    cart,
    removeHerbFromCart,
    removeRecipeFromCart,
    removeAiRecipeFromCart,
    updateHerbQuantity,
    updateRecipeQuantity,
    updateAiRecipeQuantity,
    clearCart,
    getCartCount,
  } = useCart();
  const navigate = useNavigate();

  const [shippingAddress, setShippingAddress] = useState("");
  const [contactName, setContactName] = useState(
    () => getUserFromToken()?.name || "",
  );
  const [contactPhone, setContactPhone] = useState(
    () => getUserFromToken()?.phone || "",
  );

  useEffect(() => {
    const profile = dashboardData?.profile;
    const userDetails = dashboardData?.userDetails;

    if (profile || userDetails) {
      const shippingAddressFromProfile = buildShippingAddress(
        profile,
        userDetails,
      );
      const contactPhoneFromProfile =
        profile?.phone || userDetails?.phone || getUserFromToken()?.phone || "";
      const contactNameFromProfile =
        userDetails?.fullName ||
        userDetails?.name ||
        getUserFromToken()?.name ||
        "";

      setShippingAddress((current) => {
        if (!current) {
          return shippingAddressFromProfile;
        }
        return current;
      });

      setContactName((current) => {
        if (!current) {
          return contactNameFromProfile;
        }
        return current;
      });

      setContactPhone((current) => {
        if (!current) {
          return contactPhoneFromProfile;
        }
        return current;
      });
    }
  }, [dashboardData?.profile, dashboardData?.userDetails]);
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
  const aiRecipesTotal = useMemo(
    () =>
      (cart.aiRecipes || []).reduce(
        (sum, recipe) => sum + getRecipeTotal(recipe),
        0,
      ),
    [cart.aiRecipes],
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

    const invalidAiRecipeSelections = (cart.aiRecipes || []).some(
      (item) =>
        !item.herbalistId ||
        Number(item.unitPrice ?? item.price) <= 0 ||
        Number(item.quantity) <= 0,
    );
    if (invalidAiRecipeSelections) {
      setError(
        "Please select a valid herbalist and price for each AI recipe before placing the order.",
      );
      return;
    }

    if (!shippingAddress.trim()) {
      setError("Please enter a shipping address.");
      return;
    }

    if (shippingAddress.trim().length < 10) {
      setError(
        "Please provide a detailed shipping address (at least 10 characters).",
      );
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const herbsArray = cart.herbs.map((herb) => ({
        herbId: Number(herb.herbId) || 0,
        herbalistId: Number(herb.herbalistId) || 0,
        quantityPerGram: Number(herb.quantityPerGram) || 0,
      }));

      const recipesArray = cart.recipes.map((recipe) => ({
        recipeId: Number(recipe.recipeId) || 0,
        quantity: Number(recipe.quantity) || 0,
      }));

      const aiRecipesArray = (cart.aiRecipes || []).map((item) => ({
        herbalistId: Number(item.herbalistId) || 0,
        aiRecipeId: Number(item.aiRecipeId) || 0,
        quantity: Number(item.quantity) || 0,
      }));

      const orderPayload = {
        shippingAddress: shippingAddress.trim(),
        paymentMethod: normalizedPaymentMethod,
      };

      if (herbsArray.length > 0) {
        orderPayload.herbs = herbsArray;
      }

      if (recipesArray.length > 0) {
        orderPayload.recipes = recipesArray;
      }

      if (aiRecipesArray.length > 0) {
        orderPayload.aiRecipes = aiRecipesArray;
      }

      const createdOrder = await createOrder(orderPayload);
      let orderId = resolveOrderId(createdOrder);

      // Some backends return 200 OK without an ID in the body.
      // For Cash, we can still proceed to Success (spec doesn't require showing the ID).
      if (orderId === null && normalizedPaymentMethod === "cash") {
        clearCart();
        navigate("/patient/dashboard/orders/success", {
          state: {
            message: "Your order has been successfully sent to the herbalist.",
          },
        });
        return;
      }

      // For wallet/credit card we need an ID for payment simulation, so try to infer
      // the newest order by reloading "my orders".
      if (orderId === null) {
        for (let attempt = 0; attempt < 3 && orderId === null; attempt += 1) {
          try {
            const myOrdersResponse = await getAllMyOrders();
            const myOrders = normalizeOrdersList(myOrdersResponse);
            orderId = pickLatestOrderId(myOrders);
          } catch {
            // ignore and retry
          }

          if (orderId === null) {
            await delay(350);
          }
        }
      }

      if (orderId === null) {
        throw new Error(
          "Order was created, but we couldn't retrieve its id. Please open Orders and continue from there.",
        );
      }

      // Case A: Cash -> Success page (initial status is Pending)
      if (normalizedPaymentMethod === "cash") {
        clearCart();
        navigate("/patient/dashboard/orders/success", {
          state: {
            orderId,
            message: "Your order has been successfully sent to the herbalist.",
          },
        });
        return;
      }

      // Case B: Wallet/Credit Card -> Payment Simulation Page
      if (
        normalizedPaymentMethod === "wallet" ||
        normalizedPaymentMethod === "creditcard"
      ) {
        clearCart();
        navigate(`/patient/dashboard/orders/${orderId}/payment`);
        return;
      }

      clearCart();
      navigate("/patient/dashboard/orders");
    } catch (err) {
      console.error("Order creation failed:", {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message,
      });
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Failed to place order. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl w-full flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <div className="space-y-6 sm:space-y-8">
        <CartPageHeader cartCount={cartCount} />

        {cartCount === 0 ? (
          <EmptyCartState />
        ) : (
          <form
            onSubmit={handleCheckout}
            className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(340px,0.65fr)] xl:gap-8"
          >
            <CartItemsCard
              herbs={cart.herbs}
              recipes={cart.recipes}
              aiRecipes={cart.aiRecipes || []}
              onRemoveHerb={removeHerbFromCart}
              onUpdateHerb={updateHerbQuantity}
              onRemoveRecipe={removeRecipeFromCart}
              onUpdateRecipe={updateRecipeQuantity}
              onRemoveAiRecipe={removeAiRecipeFromCart}
              onUpdateAiRecipe={updateAiRecipeQuantity}
            />

            <div className="space-y-5 xl:sticky xl:top-6 xl:self-start xl:space-y-6">
              <OrderSummaryCard
                herbs={cart.herbs}
                recipes={cart.recipes}
                aiRecipes={cart.aiRecipes || []}
                herbsTotal={herbsTotal}
                recipesTotal={recipesTotal}
                aiRecipesTotal={aiRecipesTotal}
              />

              <CheckoutPanel
                shippingAddress={shippingAddress}
                contactName={contactName}
                contactPhone={contactPhone}
                paymentMethod={paymentMethod}
                isSubmitting={isSubmitting}
                error={error}
                onAddressChange={setShippingAddress}
                onContactNameChange={setContactName}
                onContactPhoneChange={setContactPhone}
                onPaymentChange={setPaymentMethod}
              />
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default PatientCart;
