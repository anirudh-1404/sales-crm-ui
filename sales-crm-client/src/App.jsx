import React from "react";
import "./index.css"
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Login from "./pages/auth/Login";
import ForgotPassword from "./pages/auth/ForgotPassword";
import Emailverification from "./pages/auth/Emailverification";
import Resetpassword from "./pages/auth/Resetpassword";
import Successpage from "./pages/auth/Successpage";

import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

// Admin dashboard
import DashboardLayout from "./components/DashboardLayout";
import DealsDashboard from "./pages/dashboard/DealsDashboard";
import CompaniesDashboard from "./pages/dashboard/CompaniesDashboard";
import ContactsDashboard from "./pages/dashboard/ContactsDashboard";
import UsersDashboard from "./pages/dashboard/UsersDashboard";

// Sales Manager dashboard
import SalesManagerLayout from "./components/SalesManagerLayout";
import ManagerDashboard from "./pages/manager/ManagerDashboard";
import ManagerTeam from "./pages/manager/ManagerTeam";
import ManagerDeals from "./pages/manager/ManagerDeals";
import ManagerCompanies from "./pages/manager/ManagerCompanies";
import ManagerContacts from "./pages/manager/ManagerContacts";

// Sales Rep dashboard
import SalesRepLayout from "./components/SalesRepLayout";
import RepDashboard from "./pages/rep/RepDashboard";
import RepDeals from "./pages/rep/RepDeals";
import RepCompanies from "./pages/rep/RepCompanies";
import RepContacts from "./pages/rep/RepContacts";

const RootRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user) return <Navigate to="/login" replace />;

  if (user.role === "admin") return <Navigate to="/dashboard" replace />;
  if (user.role === "sales_manager") return <Navigate to="/manager" replace />;
  if (user.role === "sales_rep") return <Navigate to="/rep" replace />;

  return <Navigate to="/login" replace />;
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <RootRedirect /> },
      { path: "login", element: <Login /> },
      { path: "forgot-password", element: <ForgotPassword /> },
      { path: "email-verification", element: <Emailverification /> },
      { path: "reset-password", element: <Resetpassword /> },
      { path: "success", element: <Successpage /> },
    ]
  },
  {
    // Admin dashboard
    path: "/dashboard",
    element: (
      <ProtectedRoute allowedRoles={["admin"]}>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/dashboard/deals" replace /> },
      { path: "deals", element: <DealsDashboard /> },
      { path: "companies", element: <CompaniesDashboard /> },
      { path: "contacts", element: <ContactsDashboard /> },
      { path: "users", element: <UsersDashboard /> },
    ]
  },
  {
    // Sales Manager dashboard
    path: "/manager",
    element: (
      <ProtectedRoute allowedRoles={["sales_manager", "admin"]}>
        <SalesManagerLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/manager/dashboard" replace /> },
      { path: "dashboard", element: <ManagerDashboard /> },
      { path: "team", element: <ManagerTeam /> },
      { path: "deals", element: <ManagerDeals /> },
      { path: "companies", element: <ManagerCompanies /> },
      { path: "contacts", element: <ManagerContacts /> },
    ]
  },
  {
    // Sales Rep dashboard
    path: "/rep",
    element: (
      <ProtectedRoute allowedRoles={["sales_rep", "sales_manager", "admin"]}>
        <SalesRepLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/rep/dashboard" replace /> },
      { path: "dashboard", element: <RepDashboard /> },
      { path: "deals", element: <RepDeals /> },
      { path: "companies", element: <RepCompanies /> },
      { path: "contacts", element: <RepContacts /> },
    ]
  },
]);

const App = () => {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  )
}

export default App;