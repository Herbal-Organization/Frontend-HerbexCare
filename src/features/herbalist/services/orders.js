import { getHerbById } from "@api/herbs";
import { getRecipeById } from "@api/recipes";

const normalizeOrder = (order) => {
  const details = order.order || order.parentOrder || {};
  const items = [
    ...(order.herbs || []),
    ...(order.recipes || []),
    ...(order.aiRecipes || []),
    ...(order.aiChatRecipes || []),
  ];

  return {
    id: order.subOrderId,
    herbalistName: order.herbalistName,
    subTotal: order.subTotal,
    status: order.status,
    trackingNumber: order.trackingNumber,
    items,
    customer: {
      name: details.patientName,
      contact: details.patientContact,
      address: details.shippingAddress,
    },
    date: details.orderDate,
    paymentStatus: details.paymentStatus,
  };
};

export const normalizeOrders = (orders) => {
  if (!Array.isArray(orders)) {
    return [];
  }
  return orders.map(normalizeOrder);
};

export const enrichOrderItems = async (items) => {
  const enrichedItems = await Promise.all(
    items.map(async (item) => {
      if (item.herbId) {
        try {
          const herbDetails = await getHerbById(item.herbId);
          return { ...item, ...herbDetails };
        } catch (error) {
          console.error(
            `Failed to fetch details for herb ${item.herbId}`,
            error,
          );
          return item;
        }
      }
      if (item.recipeId) {
        try {
          const recipeDetails = await getRecipeById(item.recipeId);
          return { ...item, ...recipeDetails };
        } catch (error) {
          console.error(
            `Failed to fetch details for recipe ${item.recipeId}`,
            error,
          );
          return item;
        }
      }
      return item;
    }),
  );
  return enrichedItems;
};
