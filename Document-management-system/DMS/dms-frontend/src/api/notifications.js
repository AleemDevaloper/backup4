import { apiRequest } from "./client";

export async function listNotifications(role) {
  const safeRole = encodeURIComponent(role || "");
  const path = safeRole ? `/api/v1/notifications/${safeRole}` : "/api/v1/notifications";
  return apiRequest(path);
}
