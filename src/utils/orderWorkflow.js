export const ORDER_STATUSES = [
  "Pending",
  "Confirmed",
  "Preparing",
  "Ready",
  "Delivered",
  "Cancelled",
];

export const toFiniteNumber = (value, fallback = null) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const getExplicitStock = (item) => {
  const candidates = [
    item?.availableStock,
    item?.stockQuantity,
    item?.quantityInStock,
    item?.availableQuantity,
    item?.quantityAvailable,
    item?.remainingQuantity,
    item?.stock,
    item?.raw?.availableStock,
    item?.raw?.stockQuantity,
    item?.raw?.quantityInStock,
    item?.raw?.availableQuantity,
    item?.raw?.quantityAvailable,
    item?.raw?.remainingQuantity,
    item?.raw?.stock,
  ];

  for (const candidate of candidates) {
    const parsed = toFiniteNumber(candidate);
    if (parsed !== null) return parsed;
  }

  return null;
};

export const normalizeStatusLabel = (status, fallback = "Pending") => {
  if (!status) return fallback;
  const text = String(status).trim();
  if (!text) return fallback;
  return text.charAt(0).toUpperCase() + text.slice(1);
};

export const normalizeStatusPayload = (status) => ({
  status: normalizeStatusLabel(status),
});

export const getOrderId = (order) =>
  order?.subOrderId ??
  order?.suborderId ??
  order?.id ??
  order?.orderId ??
  order?.taskId ??
  null;

export const getOrderDate = (order) =>
  order?.orderDate ??
  order?.date ??
  order?.createdAt ??
  order?.createdOn ??
  order?.timestamp ??
  order?.orderTimestamp ??
  order?.order?.orderDate ??
  order?.order?.createdAt ??
  order?.parentOrder?.orderDate ??
  order?.parentOrder?.createdAt ??
  null;

export const getOrderTotal = (order) =>
  toFiniteNumber(
    order?.totalPrice ??
      order?.totalCost ??
      order?.total ??
      order?.amount ??
      order?.orderTotal ??
      order?.order?.totalPrice ??
      order?.order?.totalCost ??
      order?.order?.total ??
      order?.parentOrder?.totalPrice ??
      order?.parentOrder?.totalCost,
    0,
  );

export const getPaymentStatus = (order) => {
  const explicitStatus =
    order?.paymentStatus ??
    order?.payment?.status ??
    order?.order?.paymentStatus ??
    order?.order?.payment?.status ??
    order?.parentOrder?.paymentStatus;
  if (explicitStatus) return normalizeStatusLabel(explicitStatus);
  if (order?.isPaid === true || order?.order?.isPaid === true) return "Paid";
  if (
    ["cancelled", "canceled"].includes(
      String(order?.status || "").toLowerCase(),
    )
  ) {
    return "Cancelled";
  }
  const paymentMethod =
    order?.paymentMethod ??
    order?.order?.paymentMethod ??
    order?.parentOrder?.paymentMethod;
  if (String(paymentMethod || "").toLowerCase() === "cash") {
    return "Cash";
  }
  return "Pending";
};

export const getCustomerName = (order) =>
  order?.contactName ||
  order?.customerName ||
  order?.patientName ||
  order?.patientFullName ||
  order?.userName ||
  order?.userFullName ||
  order?.fullName ||
  order?.customerInformation?.name ||
  order?.customerInformation?.fullName ||
  order?.customer?.name ||
  order?.customer?.fullName ||
  order?.patient?.fullName ||
  order?.patient?.name ||
  order?.user?.fullName ||
  order?.user?.name ||
  order?.order?.contactName ||
  order?.order?.customerName ||
  order?.order?.patientName ||
  order?.order?.patientFullName ||
  order?.order?.userFullName ||
  order?.order?.customerInformation?.name ||
  order?.order?.customer?.name ||
  order?.order?.customer?.fullName ||
  order?.order?.patient?.fullName ||
  order?.order?.patient?.name ||
  order?.order?.user?.fullName ||
  order?.parentOrder?.contactName ||
  order?.parentOrder?.customerName ||
  order?.parentOrder?.patientName ||
  order?.parentOrder?.patientFullName ||
  order?.parentOrder?.patient?.fullName ||
  order?.parentOrder?.patient?.name ||
  order?.parentOrder?.user?.fullName ||
  order?.parentOrder?.user?.name ||
  "Customer";

export const getCustomerContact = (order) =>
  order?.contactPhone ||
  order?.customerPhone ||
  order?.phoneNumber ||
  order?.phone ||
  order?.customerInformation?.phone ||
  order?.customer?.phone ||
  order?.patient?.phone ||
  order?.patient?.phoneNumber ||
  order?.customerEmail ||
  order?.email ||
  order?.customerInformation?.email ||
  order?.customer?.email ||
  order?.patient?.email ||
  order?.order?.contactPhone ||
  order?.order?.customerPhone ||
  order?.order?.phoneNumber ||
  order?.order?.customerInformation?.phone ||
  order?.order?.patient?.phone ||
  order?.order?.patient?.phoneNumber ||
  order?.order?.customerEmail ||
  order?.order?.email ||
  order?.order?.customerInformation?.email ||
  order?.order?.patient?.email ||
  order?.parentOrder?.contactPhone ||
  order?.parentOrder?.customerPhone ||
  order?.parentOrder?.phoneNumber ||
  order?.parentOrder?.patient?.phone ||
  order?.parentOrder?.patient?.email ||
  "";

export const getShippingAddress = (order) =>
  order?.shippingAddress ||
  order?.address ||
  order?.shippingDetails?.address ||
  order?.order?.shippingAddress ||
  order?.order?.address ||
  order?.order?.shippingDetails?.address ||
  order?.parentOrder?.shippingAddress ||
  order?.parentOrder?.address ||
  "";

export const getOrderItems = (order) => {
  const directItems = order?.items || order?.orderItems || order?.details;
  const herbItems = order?.herbs || order?.herbOrders;
  const recipeItems = order?.recipes || order?.recipeOrders;
  const nestedItems =
    order?.order?.items || order?.order?.orderItems || order?.order?.details;
  const nestedHerbs = order?.order?.herbs || order?.order?.herbOrders;
  const items = [];

  if (Array.isArray(directItems)) items.push(...directItems);
  if (Array.isArray(herbItems)) {
    items.push(...herbItems.map((item) => ({ ...item, itemType: "Herb" })));
  }
  if (Array.isArray(recipeItems)) {
    items.push(...recipeItems.map((item) => ({ ...item, itemType: "Recipe" })));
  }
  if (Array.isArray(nestedItems)) items.push(...nestedItems);
  if (Array.isArray(nestedHerbs)) {
    items.push(...nestedHerbs.map((item) => ({ ...item, itemType: "Herb" })));
  }
  if (
    !items.length &&
    (order?.herbName || order?.itemName || order?.recipeName)
  ) {
    items.push(order);
  }

  return items;
};

export const getItemName = (item) =>
  item?.herbName ||
  item?.herb?.herbName ||
  item?.herb?.name ||
  item?.recipeName ||
  item?.recipe?.recipeName ||
  item?.recipe?.name ||
  item?.itemName ||
  item?.name ||
  `Item #${item?.herbId || item?.recipeId || item?.id || ""}`.trim();

export const getItemQuantityLabel = (item) => {
  const grams = toFiniteNumber(item?.quantityPerGram ?? item?.grams);
  if (grams !== null) return `${grams}g`;
  const quantity = toFiniteNumber(item?.quantity);
  if (quantity !== null) return `x${quantity}`;
  return "-";
};

export const getItemUnitPrice = (item) =>
  toFiniteNumber(
    item?.unitPrice ??
      item?.price ??
      item?.itemPrice ??
      item?.pricePerKilo ??
      item?.pricePerKg,
    0,
  );

export const getItemSubtotal = (item) => {
  const explicit = toFiniteNumber(
    item?.subtotal ?? item?.totalPrice ?? item?.total,
  );
  if (explicit !== null) return explicit;

  const grams = toFiniteNumber(item?.quantityPerGram ?? item?.grams);
  const pricePerKilo = toFiniteNumber(item?.pricePerKilo ?? item?.pricePerKg);
  if (grams !== null && pricePerKilo !== null) {
    return (grams * pricePerKilo) / 1000;
  }

  return getItemUnitPrice(item) * toFiniteNumber(item?.quantity, 0);
};
