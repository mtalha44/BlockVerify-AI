import React from "react";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import LoginPage from "./pages/UserVerifyPages/LoginPage";
import SignupPage from "./pages/UserVerifyPages/SignupPage";
import UniLoginPage from "./pages/UserVerifyPages/UniLoginPage";
import HomePage from "./pages/HomePage/HomePage";
import Layout, {
  LayoutWithFooter,
  LayoutWithoutNavbar,
} from "./pages/Layout/Outlet";
import ContactPage from "./pages/ContactPage/ContactPage";
import CertificateUpload from "./pages/UploadCertificate/UploadPage";
import ForgotPassword from "./pages/ForgetPasswordPages/ForgetPassword";
import UniversityEnrollment from "./components/forms/UniAuthForm";
import UniversityActivation from "./pages/UserVerifyPages/UniActivation";
import ResetPassword from "./pages/ForgetPasswordPages/ResetPassword";
import UniversityDashboard from "./dashboard/UniversityDashboard";
import UserDashboard from "./dashboard/userDashboard/UserDashboard";
import ProtectedRoute from "./ProtectedRout/ProtectedRoute";
import AdminDashboard from "./dashboard/AdminDashboard/AdminDashboard";
import TeamPage from "./pages/TeamsPage/TeamPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes with footer */}
        <Route element={<LayoutWithFooter />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/institution-signin" element={<UniLoginPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/team" element={<TeamPage />} />
          <Route
            path="/UniversityEnrollment"
            element={<UniversityEnrollment />}
          />
          <Route path="/reset-password/:token?" element={<ResetPassword />} />
          <Route
            path="/UniversityActivation/:token?"
            element={<UniversityActivation />}
          />
        </Route>

        {/* Home and upload routes */}
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
        </Route>

        {/* Protected routes without navbar */}
        <Route element={<LayoutWithoutNavbar />}>
          <Route
            path="/user-dashboard"
            element={
              <ProtectedRoute
                allowedRoles={["user", "admin"]}
                redirectTo="/login"
              >
                <UserDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/upload"
            element={
              <ProtectedRoute
                allowedRoles={["user", "university", "admin"]}
                redirectTo="/login"
              >
                <CertificateUpload />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["admin"]} redirectTo="/login">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/university-dashboard"
            element={
              <ProtectedRoute
                allowedRoles={["university", "admin"]}
                redirectTo="/institution-signin"
              >
                <UniversityDashboard />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
