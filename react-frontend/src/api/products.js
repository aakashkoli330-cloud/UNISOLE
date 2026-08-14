import client from "./client";

export const productsApi = {
  getAll: () => client.get("/products"),
  getById: (id) => client.get(`/products/${id}`),
  getByCategory: (category) => client.get(`/products/category/${category}`),
  search: (query) => client.get("/products/search", { params: { q: query } }),
  create: (formData) => client.post("/products", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  }),
  update: (id, formData) => client.put(`/products/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  }),
  remove: (id) => client.delete(`/products/${id}`),
};
