import { apiRequest } from "./client";

export async function listUsers() {
  const res = await apiRequest("/api/v1/users");
  return res.data || [];
}

export async function createUser(user) {
  const res = await apiRequest("/api/v1/users", {
    method: "POST",
    body: user,
  });
  return res.data;
}

export async function updateUser(id, user) {
  const res = await apiRequest(`/api/v1/users/${id}`, {
    method: "PATCH",
    body: user,
  });
  return res.data;
}

export async function deleteUser(id) {
  await apiRequest(`/api/v1/users/${id}`, { method: "DELETE" });
}

