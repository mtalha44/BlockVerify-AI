import React from "react";
import {
  Routes,
  Route,
  BrowserRouter,
} from "react-router-dom";
import LoginPage from "./pages/UserVerifyPages/LoginPage";
import SignupPage from "./pages/UserVerifyPages/SignupPage";
import UniLoginPage from "./pages/UserVerifyPages/UniLoginPage";
import HomePage from "./pages/HomePage/HomePage";
import Layout, { LayoutWithFooter, LayoutWithoutNavbar } from "./pages/Layout/Outlet";
import CertificateUpload from "./pages/UploadCertificate/UploadPage";
import ForgotPassword from "./pages/ForgetPasswordPages/ForgetPassword";
import UniversityEnrollment from "./components/forms/UniAuthForm";
import UniversityActivation from "./pages/UserVerifyPages/UniActivation";
import ResetPassword from "./pages/ForgetPasswordPages/ResetPassword";
import UniversityDashboard from "./dashboard/UniDashboard";
import UserDashboard from "./dashboard/UserDashboard";
import ProtectedRoute from "./ProtectedRout/ProtectedRoute";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<LayoutWithFooter />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/institution-signin" element={<UniLoginPage />} />
          
          <Route
            path="/UniversityEnrollment"
            element={<UniversityEnrollment />}
          />
          <Route path="/reset-password/:token?" element={<ResetPassword />} />
          // In App.jsx, update the activation route:
          <Route
            path="/UniversityActivation/:token?"
            element={<UniversityActivation />}
          />
        </Route>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="/uploadpage" element={<CertificateUpload />} />
        </Route>
        <Route element={<LayoutWithoutNavbar />}>
          <Route
            path="/user-dashboard"
            element={
              <ProtectedRoute allowedRoles={["user", "admin"]}>
                <UserDashboard />
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
