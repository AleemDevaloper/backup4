import React from "react";
import { Navigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import AuthenticatedLayout from "../components/layout/AuthenticatedLayout";
import Loading from "../pages/loading/Loading";
import { getHomeRouteForRole, roleMatchesRoute } from "../utils/roles";

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { currentUser, authLoading } = useApp();

  if (authLoading) {
    return <Loading />;
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (!roleMatchesRoute(currentUser.role, allowedRoles)) {
    return <Navigate to={getHomeRouteForRole(currentUser.role)} replace />;
  }

  return <AuthenticatedLayout>{children}</AuthenticatedLayout>;
};

export default ProtectedRoute;
