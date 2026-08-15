import client from "./client";

export const cartApi = {
  get: () => client.get("/cart"),
  add: (productId, size) => client.post("/cart/add", { productId, size }),
  updateQty: (productId, size, change) =>
    client.put("/cart/update", { productId, size, change }),
  remove: (productId, size) =>
    client.delete("/cart/remove", { data: { productId, size } }),
};
