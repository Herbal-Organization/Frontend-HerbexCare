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
      return saved ? JSON.parse(saved) : { herbs: [], recipes: [] };
    } catch {
      return { herbs: [], recipes: [] };
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
        updatedHerbs[existingIdx].quantityPerGram += herbItem.quantityPerGram;
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

  const clearCart = () => {
    setCart({ herbs: [], recipes: [] });
  };

  const getCartCount = () => {
    return cart.herbs.length + cart.recipes.length;
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addHerbToCart,
        removeHerbFromCart,
        addRecipeToCart,
        removeRecipeFromCart,
        updateHerbQuantity,
        updateRecipeQuantity,
        clearCart,
        getCartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
