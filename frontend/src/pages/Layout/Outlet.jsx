import { Outlet } from "react-router-dom";
import Navbar from "../../components/Header/Navbar";
import AuthFooter from "../../components/Footer/AuthFooter";
import Footer from "../../components/Footer/Footer";

const Layout = () => {
  return (
    <>
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
};
export default Layout;

export const LayoutWithFooter = () => {
  return (
    <>
      <main>
        <Outlet />
      </main>
      <AuthFooter />
    </>
  );
};
