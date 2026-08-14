import client from "./client";

export const cartApi = {
  get: () => client.get("/cart"),
  add: (productId) => client.post("/cart/add", { productId }),
  updateQty: (productId, change) => client.put("/cart/update", { productId, change }),
  remove: (productId) => client.delete(`/cart/remove/${productId}`),
};
