const DEFAULT_BASE_URL = "http://127.0.0.1:8060";

export function getApiBaseUrl() {
  return (import.meta.env.VITE_API_BASE_URL || DEFAULT_BASE_URL).replace(/\/$/, "");
}

export function getAuthToken() {
  return localStorage.getItem("auth_token");
}

export function setAuthToken(token) {
  if (!token) {
    localStorage.removeItem("auth_token");
    return;
  }

  localStorage.setItem("auth_token", token);
}

function buildHeaders({ body, authToken, headers = {} }) {
  const finalHeaders = {
    Accept: "application/json",
    ...headers,
  };

  if (authToken) {
    finalHeaders.Authorization = `Bearer ${authToken}`;
  }

  if (!(body instanceof FormData) && body !== undefined && !finalHeaders["Content-Type"]) {
    finalHeaders["Content-Type"] = "application/json";
  }

  return finalHeaders;
}

export async function apiRequest(
  path,
  { method = "GET", body, token, headers = {}, responseType = "json" } = {}
) {
  const url = `${getApiBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`;
  const authToken = token ?? getAuthToken();
  const requestHeaders = buildHeaders({ body, authToken, headers });

  const res = await fetch(url, {
    method,
    headers: requestHeaders,
    body:
      body === undefined
        ? undefined
        : body instanceof FormData
        ? body
        : requestHeaders["Content-Type"] === "application/json"
        ? JSON.stringify(body)
        : body,
  });

  if (responseType === "blob") {
    if (!res.ok) {
      throw new Error(`Request failed (${res.status})`);
    }

    return {
      blob: await res.blob(),
      headers: res.headers,
      status: res.status,
    };
  }

  const contentType = res.headers.get("content-type") || "";
  const data = contentType.includes("application/json") ? await res.json() : null;

  if (!res.ok) {
    const message =
      data?.message ||
      data?.error ||
      (data?.errors ? Object.values(data.errors).flat()[0] : null) ||
      `Request failed (${res.status})`;

    const err = new Error(message);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}
