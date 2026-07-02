// Values accepted by PUT /api/SubOrders/{id}/status, mirroring the backend
// SubOrderStatus enum: Pending, AwaitingPayment, Preparing, Shipped, Delivered,
// Cancelled. There is no "Approved"/"Rejected" — a herbalist accepting a task
// moves it to Preparing, and rejecting it moves it to Cancelled.
export const SUB_ORDER_STATUS = {
  PENDING: "Pending",
  AWAITING_PAYMENT: "AwaitingPayment",
  PREPARING: "Preparing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

// Semantic aliases for the herbalist accept/reject actions.
export const SUB_ORDER_ACCEPT = SUB_ORDER_STATUS.PREPARING;
export const SUB_ORDER_REJECT = SUB_ORDER_STATUS.CANCELLED;
