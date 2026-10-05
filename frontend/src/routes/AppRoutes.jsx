import { Routes, Route } from "react-router-dom";

import HomePage from "../pages/HomePage";
import SpaceDetailsPage from "../pages/SpaceDetailsPage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import MemberDashboardPage from "../pages/MemberDashboardPage";
import AdminDashboardPage from "../pages/AdminDashboardPage";

import ProtectedRoute from "./ProtectedRoute";

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<HomePage />} />

      <Route path="/login" element={<LoginPage />} />

      <Route path="/register" element={<RegisterPage />} />

      <Route
        path="/spaces/:id"
        element={<SpaceDetailsPage />}
      />

      {/* Member-only route */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={["member"]}>
            <MemberDashboardPage />
          </ProtectedRoute>
        }
      />

      {/* Admin-only route */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminDashboardPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default AppRoutes;