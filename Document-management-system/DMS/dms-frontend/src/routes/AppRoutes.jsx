import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useApp } from "../context/AppContext";
import Login from "../pages/auth/Login";
import AdminDashboard from "../pages/dashboards/AdminDashboard";
import CeoDashboard from "../pages/dashboards/CeoDashboard";
import ProjectMDashboard from "../pages/dashboards/ProjectMDashboard";
import UserDashboard from "../pages/dashboards/UserDashboard";
import ErrorPage from "../pages/error/ErrorPage";
import Loading from "../pages/loading/Loading";
import ProtectedRoute from "./ProtectedRoute";
import { getHomeRouteForRole } from "../utils/roles";

const AppRoutes = () => {
  const { authLoading, currentUser } = useApp();

  if (authLoading) {
    return <Loading />;
  }

  const homeRoute = currentUser ? getHomeRouteForRole(currentUser.role) : "/login";

  return (
    <Routes>
      <Route path="/" element={<Navigate to={homeRoute} replace />} />
      <Route path="/login" element={currentUser ? <Navigate to={homeRoute} replace /> : <Login />} />
      <Route
        path="/admin-dashboard"
        element={
          <ProtectedRoute allowedRoles={["Admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/project-manager-dashboard"
        element={
          <ProtectedRoute allowedRoles={["Project Manager"]}>
            <ProjectMDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/user"
        element={
          <ProtectedRoute allowedRoles={["Simple User"]}>
            <UserDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ceo"
        element={
          <ProtectedRoute allowedRoles={["CEO"]}>
            <CeoDashboard />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={currentUser ? <Navigate to={homeRoute} replace /> : <ErrorPage />} />
    </Routes>
  );
};

export default AppRoutes;
