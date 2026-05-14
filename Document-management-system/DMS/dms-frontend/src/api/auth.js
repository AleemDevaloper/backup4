import { apiRequest, setAuthToken } from "./client";

export async function register({ name, email, password, empId, role }) {
  const res = await apiRequest("/api/v1/auth/register", {
    method: "POST",
    body: {
      name,
      email,
      password,
      emp_id: empId,
      role,
    },
  });

  setAuthToken(res.token);
  return res.user;
}

export async function login({ email, password }) {
  const res = await apiRequest("/api/v1/auth/login", {
    method: "POST",
    body: { email, password },
  });

  setAuthToken(res.token);
  return res.user;
}

export async function me() {
  const res = await apiRequest("/api/v1/auth/me");
  return res.user;
}

export async function logout() {
  try {
    await apiRequest("/api/v1/auth/logout", { method: "POST" });
  } finally {
    setAuthToken(null);
  }
}

