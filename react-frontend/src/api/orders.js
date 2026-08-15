import client from "./client";

export const ordersApi = {
  createRazorpayOrder: (shipping) => client.post("/orders/create-order", { shipping }),
  verifyPayment: (payload) => client.post("/orders/verify-payment", payload),
  checkout: (shipping) =>
    client.post("/orders/checkout", { shipping, paymentMethod: "cod" }),
  getMyOrders: () => client.get("/orders/my"),
  getById: (id) => client.get(`/orders/${id}`),
  adminGetAll: () => client.get("/orders/admin/all"),
  adminGetById: (id) => client.get(`/orders/admin/order/${id}`),
  adminUpdateStatus: (id, status) => client.put(`/orders/admin/${id}`, { status }),
};
