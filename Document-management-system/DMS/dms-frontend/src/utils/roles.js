export function normalizeRole(role) {
  const value = String(role || "")
    .trim()
    .toLowerCase()
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ");

  if (["admin", "admin dashboard", "admindashboard"].includes(value)) return "Admin";
  if (["ceo"].includes(value)) return "CEO";
  if (["project manager", "projectmanager"].includes(value)) return "Project Manager";
  if (["simple user", "simpleuser", "user"].includes(value)) return "Simple User";

  return role || "";
}

export function getHomeRouteForRole(role) {
  switch (normalizeRole(role)) {
    case "Project Manager":
      return "/project-manager-dashboard";
    case "CEO":
      return "/ceo";
    case "Simple User":
      return "/user";
    case "Admin":
    default:
      return "/admin-dashboard";
  }
}

export function roleMatchesRoute(role, allowedRoles = []) {
  if (!allowedRoles.length) return true;
  return allowedRoles.map(normalizeRole).includes(normalizeRole(role));
}
