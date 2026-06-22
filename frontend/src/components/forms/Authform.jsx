import { useState } from 'react';
import { Lock, Mail, User, Eye, EyeOff } from 'lucide-react';
import API from '../../api/axios';
import { useNavigate } from 'react-router-dom';

const AuthForm = ({ type }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    institution: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setLoading(true);

    try {
      if (type === "signup") {
        if (formData.password !== formData.confirmPassword) {
          setErrorMessage("Passwords do not match");
          setLoading(false);
          return;
        }

        if (formData.password.length < 8) {
          setErrorMessage("Password must be at least 8 characters");
          setLoading(false);
          return;
        }

        const res = await API.post("/auth/signup", {
          fullName: formData.fullName,
          institution: formData.institution,
          email: formData.email,
          password: formData.password,
        });

        localStorage.setItem("user", JSON.stringify(res.data.user));
        navigate("/user-dashboard", { replace: true });
      }

      if (type === "login") {
        const res = await API.post("/auth/login", {
          email: formData.email,
          password: formData.password,
        });

        localStorage.setItem("user", JSON.stringify(res.data.user));

        const userRole = res.data.user.role;

        if (userRole === "admin") {
          navigate("/admin", { replace: true });
        } else if (userRole === "university") {
          navigate("/university-dashboard", { replace: true });
        } else {
          navigate("/user-dashboard", { replace: true });
        }

        setFormData({
          fullName: "",
          institution: "",
          email: "",
          password: "",
          confirmPassword: "",
        });
      }
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error.message ||
        "Something went wrong";
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div>
            <h2 className="text-3xl font-semibold text-color-primary mb-2">
              {type === "login" ? "Welcome Back" : "Create Account"}
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              {type === "login" ?
                "Sign in to your BlockVerify-AI account"
              : "Register for a BlockVerify-AI account"}
            </p>
          </div>
        </div>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        {type === "signup" && (
          <div>
            <label className="block text-sm font-medium text-color-primary mb-2">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 size-5" />
              <input
                type="text"
                name="fullName"
                className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                placeholder="John Smith"
                required
                value={formData.fullName}
                onChange={handleChange}
              />
            </div>
          </div>
        )}

        {type === "signup" && (
          <div>
            <label className="block text-sm font-medium text-color-primary mb-2">
              Institution/Organization
            </label>
            <input
              type="text"
              name="institution"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              placeholder="University of Technology"
              required
              value={formData.institution}
              onChange={handleChange}
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-color-primary mb-2">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 size-5" />
            <input
              type="email"
              name="email"
              className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              placeholder="user@example.com"
              required
              value={formData.email}
              onChange={handleChange}
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-color-primary">
              Password
            </label>
            {type === "login" && (
              <a
                href="/forgot-password"
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Forgot password?
              </a>
            )}
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 size-5" />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              placeholder="••••••••"
              required
              value={formData.password}
              onChange={handleChange}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ?
                <EyeOff className="size-5" />
              : <Eye className="size-5" />}
            </button>
          </div>
          {type === "signup" && (
            <p className="text-xs text-gray-500 mt-2">
              Must be at least 8 characters with a number and special character
            </p>
          )}
        </div>

        {type === "signup" && (
          <div>
            <label className="block text-sm font-medium text-color-primary mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 size-5" />
              <input
                type="password"
                name="confirmPassword"
                className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                placeholder="••••••••"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>
          </div>
        )}

        {type === "signup" && (
          <div className="mt-4">
            <p className="text-sm text-gray-500 ">
              To create an account as an university administrator, click
            </p>
            <span>
              <a
                href="/UniversityEnrollment"
                className="text-color-primary underline"
              >
                University Admin Signup
              </a>
            </span>
          </div>
        )}

        {type === "login" && (
          <div className="flex items-center">
            <input
              type="checkbox"
              id="rememberMe"
              name="rememberMe"
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label
              htmlFor="rememberMe"
              className="ml-2 block text-sm text-color-primary"
            >
              Remember me for 30 days
            </label>
          </div>
        )}

        {errorMessage && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full custom-btn font-medium py-3 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Please wait..." : (type === "login" ? "Sign In" : "Create Account")}
        </button>

        {type === "login" ?
          <p className="text-center text-sm text-gray-600">
            Don't have an account?{" "}
            <a
              href="/signup"
              className="font-medium text-color-primary hover:text-blue-500"
            >
              Sign up
            </a>
          </p>
        : <p className="text-center text-sm text-gray-600">
            Already have an account?{" "}
            <a href="/login" className="btn-primary">
              Sign in
            </a>
          </p>
        }
      </form>

      {type === "signup" && (
        <p className="text-xs text-gray-500 text-center mt-6">
          By creating an account, you agree to our{" "}
          <a href="/terms" className="text-blue-600 hover:text-blue-800">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="/privacy" className="text-blue-600 hover:text-blue-800">
            Privacy Policy
          </a>
        </p>
      )}
    </div>
  );
};

export default AuthForm;
