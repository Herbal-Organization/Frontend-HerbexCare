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
