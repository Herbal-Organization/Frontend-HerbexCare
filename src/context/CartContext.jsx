import { createContext, useContext, useState, useEffect } from "react";
import { toast } from "react-hot-toast";

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

export const CartProvider = ({ children }) => {
  // Initialize state from localStorage if available
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem("herbal_patient_cart");
      if (!saved) return { herbs: [], recipes: [], aiRecipes: [] };
      const parsed = JSON.parse(saved);
      return {
        herbs: Array.isArray(parsed?.herbs) ? parsed.herbs : [],
        recipes: Array.isArray(parsed?.recipes) ? parsed.recipes : [],
        aiRecipes: Array.isArray(parsed?.aiRecipes) ? parsed.aiRecipes : [],
      };
    } catch {
      return { herbs: [], recipes: [], aiRecipes: [] };
    }
  });

  // Sync back to local storage automatically
  useEffect(() => {
    localStorage.setItem("herbal_patient_cart", JSON.stringify(cart));
  }, [cart]);

  const addHerbToCart = (herbItem) => {
    const isExisting = cart.herbs.some(
      (h) =>
        h.herbId === herbItem.herbId && h.herbalistId === herbItem.herbalistId,
    );

    if (isExisting) {
      toast.success(`Updated quantity of ${herbItem._previewName} in cart!`);
    } else {
      toast.success(
        `Added ${herbItem.quantityPerGram}g of ${herbItem._previewName} to cart!`,
      );
    }

    setCart((prev) => {
      const existingIdx = prev.herbs.findIndex(
        (h) =>
          h.herbId === herbItem.herbId &&
          h.herbalistId === herbItem.herbalistId,
      );

      if (existingIdx !== -1) {
        const updatedHerbs = [...prev.herbs];
        const nextQuantity =
          Number(updatedHerbs[existingIdx].quantityPerGram || 0) +
          Number(herbItem.quantityPerGram || 0);
        updatedHerbs[existingIdx] = {
          ...updatedHerbs[existingIdx],
          ...herbItem,
          quantityPerGram: nextQuantity,
          totalPrice:
            (Number(herbItem.pricePerKilo || updatedHerbs[existingIdx].pricePerKilo || 0) *
              nextQuantity) /
            1000,
        };
        return { ...prev, herbs: updatedHerbs };
      }

      return {
        ...prev,
        herbs: [...prev.herbs, herbItem],
      };
    });
  };

  const removeHerbFromCart = (herbId, herbalistId) => {
    setCart((prev) => ({
      ...prev,
      herbs: prev.herbs.filter(
        (h) => !(h.herbId === herbId && h.herbalistId === herbalistId),
      ),
    }));
    toast.success("Item removed from cart");
  };

  const addRecipeToCart = (recipeItem) => {
    const isExisting = cart.recipes.some(
      (r) => r.recipeId === recipeItem.recipeId,
    );

    if (isExisting) {
      toast.success(`Updated quantity of ${recipeItem._previewName} in cart!`);
    } else {
      toast.success(`Added ${recipeItem._previewName} to cart!`);
    }

    setCart((prev) => {
      const existingIdx = prev.recipes.findIndex(
        (r) => r.recipeId === recipeItem.recipeId,
      );
      if (existingIdx >= 0) {
        const updatedRecipes = [...prev.recipes];
        const nextQuantity =
          updatedRecipes[existingIdx].quantity + recipeItem.quantity;
        const unitPrice = Number(
          recipeItem.unitPrice ??
            updatedRecipes[existingIdx].unitPrice ??
            updatedRecipes[existingIdx].price ??
            0,
        );
        updatedRecipes[existingIdx] = {
          ...updatedRecipes[existingIdx],
          ...recipeItem,
          unitPrice,
          quantity: nextQuantity,
          totalPrice: unitPrice * nextQuantity,
        };
        return { ...prev, recipes: updatedRecipes };
      }

      const unitPrice = Number(recipeItem.unitPrice ?? recipeItem.price ?? 0);

      return {
        ...prev,
        recipes: [
          ...prev.recipes,
          {
            ...recipeItem,
            unitPrice,
            totalPrice: unitPrice * Number(recipeItem.quantity || 0),
          },
        ],
      };
    });
  };

  const removeRecipeFromCart = (recipeId) => {
    setCart((prev) => ({
      ...prev,
      recipes: prev.recipes.filter((r) => r.recipeId !== recipeId),
    }));
    toast.success("Recipe removed from cart");
  };

  const updateHerbQuantity = (herbId, herbalistId, newQuantity) => {
    if (newQuantity <= 0) return removeHerbFromCart(herbId, herbalistId);
    setCart((prev) => ({
      ...prev,
      herbs: prev.herbs.map((h) =>
        h.herbId === herbId && h.herbalistId === herbalistId
          ? { ...h, quantityPerGram: newQuantity }
          : h,
      ),
    }));
  };

  const updateRecipeQuantity = (recipeId, newQuantity) => {
    if (newQuantity <= 0) return removeRecipeFromCart(recipeId);
    setCart((prev) => ({
      ...prev,
      recipes: prev.recipes.map((r) =>
        r.recipeId === recipeId
          ? {
              ...r,
              quantity: newQuantity,
              totalPrice:
                Number(r.unitPrice ?? r.price ?? 0) * Number(newQuantity || 0),
            }
          : r,
      ),
    }));
  };

  const addAiRecipeToCart = (aiRecipeItem) => {
    const isExisting = cart.aiRecipes.some(
      (item) =>
        Number(item.aiRecipeId) === Number(aiRecipeItem.aiRecipeId) &&
        Number(item.herbalistId) === Number(aiRecipeItem.herbalistId),
    );

    if (isExisting) {
      toast.success(`Updated quantity of ${aiRecipeItem._previewName} in cart!`);
    } else {
      toast.success(`Added ${aiRecipeItem._previewName} to cart!`);
    }

    setCart((prev) => {
      const existingIdx = prev.aiRecipes.findIndex(
        (item) =>
          Number(item.aiRecipeId) === Number(aiRecipeItem.aiRecipeId) &&
          Number(item.herbalistId) === Number(aiRecipeItem.herbalistId),
      );

      if (existingIdx >= 0) {
        const updatedAiRecipes = [...prev.aiRecipes];
        const nextQuantity =
          Number(updatedAiRecipes[existingIdx].quantity || 0) +
          Number(aiRecipeItem.quantity || 0);
        const unitPrice = Number(
          aiRecipeItem.unitPrice ??
            updatedAiRecipes[existingIdx].unitPrice ??
            aiRecipeItem.price ??
            updatedAiRecipes[existingIdx].price ??
            0,
        );

        updatedAiRecipes[existingIdx] = {
          ...updatedAiRecipes[existingIdx],
          ...aiRecipeItem,
          unitPrice,
          quantity: nextQuantity,
          totalPrice: unitPrice * nextQuantity,
        };

        return { ...prev, aiRecipes: updatedAiRecipes };
      }

      const unitPrice = Number(aiRecipeItem.unitPrice ?? aiRecipeItem.price ?? 0);

      return {
        ...prev,
        aiRecipes: [
          ...prev.aiRecipes,
          {
            ...aiRecipeItem,
            unitPrice,
            totalPrice: unitPrice * Number(aiRecipeItem.quantity || 0),
          },
        ],
      };
    });
  };

  const removeAiRecipeFromCart = (aiRecipeId, herbalistId) => {
    setCart((prev) => ({
      ...prev,
      aiRecipes: prev.aiRecipes.filter(
        (item) =>
          !(
            Number(item.aiRecipeId) === Number(aiRecipeId) &&
            Number(item.herbalistId) === Number(herbalistId)
          ),
      ),
    }));
    toast.success("AI recipe removed from cart");
  };

  const updateAiRecipeQuantity = (aiRecipeId, herbalistId, newQuantity) => {
    if (newQuantity <= 0) {
      return removeAiRecipeFromCart(aiRecipeId, herbalistId);
    }

    setCart((prev) => ({
      ...prev,
      aiRecipes: prev.aiRecipes.map((item) => {
        if (
          Number(item.aiRecipeId) !== Number(aiRecipeId) ||
          Number(item.herbalistId) !== Number(herbalistId)
        ) {
          return item;
        }

        const unitPrice = Number(item.unitPrice ?? item.price ?? 0);
        return {
          ...item,
          quantity: newQuantity,
          totalPrice: unitPrice * Number(newQuantity || 0),
        };
      }),
    }));
  };

  const clearCart = () => {
    setCart({ herbs: [], recipes: [], aiRecipes: [] });
  };

  const getCartCount = () => {
    return cart.herbs.length + cart.recipes.length + cart.aiRecipes.length;
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addHerbToCart,
        removeHerbFromCart,
        addRecipeToCart,
        removeRecipeFromCart,
        addAiRecipeToCart,
        removeAiRecipeFromCart,
        updateHerbQuantity,
        updateRecipeQuantity,
        updateAiRecipeQuantity,
        clearCart,
        getCartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
