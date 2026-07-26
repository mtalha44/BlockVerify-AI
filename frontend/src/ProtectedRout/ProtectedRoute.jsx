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
        // First check if user exists in localStorage
        const localUser = localStorage.getItem("user");
        let user = null;

        if (localUser) {
          try {
            user = JSON.parse(localUser);
            console.log("ProtectedRoute - User from localStorage:", user);
          } catch (e) {
            console.error("Error parsing user from localStorage:", e);
          }
        }

        // If we have a user in localStorage, use it
        if (user) {
          const roles = allowedRolesKey ? allowedRolesKey.split("|") : null;
          const hasAllowedRole = !roles || roles.includes(user.role);

          if (isMounted) {
            setAuthState({
              loading: false,
              user,
              authorized: hasAllowedRole,
            });
          }
          return;
        }

        // If no user in localStorage, try to get from API
        try {
          const res = await API.get("/auth/me");
          user = res.data.user;
          console.log("ProtectedRoute - User from API:", user);

          localStorage.setItem("user", JSON.stringify(user));

          const roles = allowedRolesKey ? allowedRolesKey.split("|") : null;
          const hasAllowedRole = !roles || roles.includes(user.role);

          if (isMounted) {
            setAuthState({
              loading: false,
              user,
              authorized: hasAllowedRole,
            });
          }
        } catch (apiError) {
          console.error("API auth verification failed:", apiError);
          // If API fails but we have local user, use it
          if (user) {
            const roles = allowedRolesKey ? allowedRolesKey.split("|") : null;
            const hasAllowedRole = !roles || roles.includes(user.role);

            if (isMounted) {
              setAuthState({
                loading: false,
                user,
                authorized: hasAllowedRole,
              });
            }
          } else {
            throw apiError;
          }
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
