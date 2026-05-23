import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  BrowserRouter,
} from "react-router-dom";
import LoginPage from "./pages/UserVerifyPages/LoginPage";
import SignupPage from "./pages/UserVerifyPages/SignupPage";
import UniLoginPage from "./pages/UserVerifyPages/UniLoginPage";
import Footer from "./components/Footer/AuthFooter";
import Navbar from "./components/Header/Navbar";
import FeaturesSection from "./components/HomePageSections/FeatureSection";
import TrustAndStats from "./components/HomePageSections/TrustedUni";
import HomePage from "./pages/HomePage/HomePage";
import Layout, { LayoutWithFooter } from "./pages/Layout/Outlet";
import CertificateUpload from "./pages/UploadCertificate/UploadPage";
import ForgotPassword from "./pages/ForgetPasswordPages/ForgetPassword";
import UniversityEnrollment from "./components/forms/UniAuthForm";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<LayoutWithFooter />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/institution-signin" element={<UniLoginPage />} />
          <Route path="/UniversityEnrollment" element={<UniversityEnrollment />} />
        </Route>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="/uploadpage" element={<CertificateUpload />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
