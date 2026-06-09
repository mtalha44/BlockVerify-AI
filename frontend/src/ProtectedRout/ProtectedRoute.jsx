import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import API from "../api/axios";

const ProtectedRoute = ({ children, allowedRoles, redirectTo = "/login" }) => {
  const allowedRolesKey = allowedRoles?.join("|") || "";
  const [authState, setAuthState] = useState({
    loading: true,
    user: null,
    authorized: false,
  });

  useEffect(() => {
    let isMounted = true;

    const verifyUser = async () => {
      try {
        const res = await API.get("/auth/me");
        const user = res.data.user;
        const roles = allowedRolesKey ? allowedRolesKey.split("|") : null;
        const hasAllowedRole = !roles || roles.includes(user.role);

        localStorage.setItem("user", JSON.stringify(user));

        if (isMounted) {
          setAuthState({
            loading: false,
            user,
            authorized: hasAllowedRole,
          });
        }
      } catch {
        localStorage.removeItem("user");

        if (isMounted) {
          setAuthState({
            loading: false,
            user: null,
            authorized: false,
          });
        }
      }
    };

    verifyUser();

    return () => {
      isMounted = false;
    };
  }, [allowedRolesKey]);

  if (authState.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-[#002677] font-semibold">
        Checking authentication...
      </div>
    );
  }

  if (!authState.user) {
    return <Navigate to={redirectTo} replace />;
  }

  if (!authState.authorized) {
    const fallback =
      authState.user.role === "university" ? "/university-dashboard" : "/user-dashboard";

    return <Navigate to={fallback} replace />;
  }

  return children;
};

export default ProtectedRoute;
