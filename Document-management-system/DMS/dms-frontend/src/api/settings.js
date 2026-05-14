import { apiRequest } from "./client";

export async function getStorageSettings() {
  const res = await apiRequest("/api/v1/settings/storage");
  return res.data;
}

export async function updateStorageSettings(storagePath) {
  const res = await apiRequest("/api/v1/settings/storage", {
    method: "PATCH",
    body: { storagePath },
  });

  return res.data;
}
