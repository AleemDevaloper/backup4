import { apiRequest } from "./client";

function appendIfPresent(formData, key, value) {
  if (value === undefined) return;

  if (value === null || value === "") {
    formData.append(key, "");
    return;
  }

  formData.append(key, value);
}

function toProjectFormData(data = {}) {
  const formData = new FormData();

  appendIfPresent(formData, "name", data.name);
  appendIfPresent(formData, "srNo", data.srNo);
  appendIfPresent(formData, "client", data.client);
  appendIfPresent(formData, "description", data.description);
  appendIfPresent(formData, "submissionTime", data.submissionTime);
  appendIfPresent(formData, "status", data.status);
  appendIfPresent(formData, "teamSize", data.teamSize);

  if (data.removeFile) {
    formData.append("removeFile", "1");
  }

  if (data.file instanceof File) {
    formData.append("file", data.file);
  }

  return formData;
}

export async function listProjects(params = {}) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, value);
    }
  });

  const res = await apiRequest(`/api/v1/projects${query.toString() ? `?${query.toString()}` : ""}`);
  return res.data || [];
}

export async function getProjectSummary() {
  const res = await apiRequest("/api/v1/projects/summary");
  return res.data || null;
}

export async function createProject(data) {
  const res = await apiRequest("/api/v1/projects", {
    method: "POST",
    body: toProjectFormData(data),
  });

  return res.data;
}

export async function updateProject(id, data) {
  const formData = toProjectFormData(data);
  formData.append("_method", "PATCH");

  const res = await apiRequest(`/api/v1/projects/${id}`, {
    method: "POST",
    body: formData,
  });

  return res.data;
}

function getDownloadFilenameFromHeaders(headers, fallback = "project-file") {
  const disposition = headers.get("content-disposition") || "";
  const utfMatch = disposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utfMatch?.[1]) {
    return decodeURIComponent(utfMatch[1]);
  }

  const asciiMatch = disposition.match(/filename="?([^";]+)"?/i);
  return asciiMatch?.[1] || fallback;
}

export async function downloadFile(id, fallbackName = "project-file") {
  const { blob, headers } = await apiRequest(`/api/v1/projects/download/${id}`, {
    responseType: "blob",
  });

  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = getDownloadFilenameFromHeaders(headers, fallbackName);
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

export async function deleteProject(id) {
  await apiRequest(`/api/v1/projects/${id}`, { method: "DELETE" });
}
