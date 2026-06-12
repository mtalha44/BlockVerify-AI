// frontend/src/ProtectedRout/ProtectedRoute.jsx
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

        // Calculate hasAllowedRole AFTER getting user
        const roles = allowedRolesKey ? allowedRolesKey.split("|") : null;
        const hasAllowedRole = !roles || roles.includes(user.role);

        // Debug logs
        console.log("ProtectedRoute - User:", user);
        console.log("ProtectedRoute - User Role:", user.role);
        console.log("ProtectedRoute - Allowed Roles:", allowedRoles);
        console.log("ProtectedRoute - Has allowed role?", hasAllowedRole);

        localStorage.setItem("user", JSON.stringify(user));

        if (isMounted) {
          setAuthState({
            loading: false,
            user,
            authorized: hasAllowedRole,
          });
        }
      } catch (error) {
        console.error("Auth verification failed:", error);
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
    console.log("No user, redirecting to:", redirectTo);
    return <Navigate to={redirectTo} replace />;
  }

  if (!authState.authorized) {
    console.log(
      "User not authorized. Role:",
      authState.user.role,
      "Allowed:",
      allowedRoles,
    );
    const fallback =
      authState.user.role === "university" ?
        "/university-dashboard"
      : "/user-dashboard";

    return <Navigate to={fallback} replace />;
  }

  console.log("Access granted for role:", authState.user.role);
  return children;
};

export default ProtectedRoute;
