import client from "./client";

export const usersApi = {
  getMe: () => client.get("/users/me"),
  update: (data) => client.put("/users/update", data),
  changePassword: (data) => client.put("/users/change-password", data),
};
