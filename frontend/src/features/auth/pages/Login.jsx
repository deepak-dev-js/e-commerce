
import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import {
  loginUser,
  resendVerificationOtp,
} from "../services/authService";
import { assets } from "../../../assets/assets";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showVerifyLink, setShowVerifyLink] = useState(false);


  const redirectByRole = (user) => {
    if (user?.role === "admin") {
      navigate("/admin", { replace: true });
    } else {
      navigate("/", { replace: true });
    }
  };

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };


  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");
    setShowVerifyLink(false);
    setLoading(true);

    try {
      const data = await loginUser(formData);

      if (data.success) {
        const redirect = searchParams.get("redirect");

        if (redirect === "/checkout") {
          navigate("/checkout", { replace: true });
        } else {
          redirectByRole(data.user);
        }
      }
    } catch (error) {
      console.error("Login failed:", error);

      if (error.code === "EMAIL_NOT_VERIFIED") {
        setShowVerifyLink(true);
        setMessage("Please verify your email before logging in.");
      } else {
        setMessage(error.message || "Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmail = async () => {
    const email = formData.email.trim().toLowerCase();

    if (!email) {
      setMessage("Please enter your email address first.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      await resendVerificationOtp(email);

      navigate("/verify-email", {
        state: { email },
      });
    } catch (error) {
      console.error("Resend OTP failed:", error);
      setMessage(error.message || "Unable to send verification OTP.");
    } finally {
      setLoading(false);
    }
  };


  const handleGoogleSuccess = async (credentialResponse) => {
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/google`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            credential: credentialResponse.credential,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Google login failed");
      }

      redirectByRole(data.user);
    } catch (error) {
      console.error("Google login failed:", error);
      setMessage(error.message || "Google login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen justify-center bg-white px-4 py-10">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-5 rounded-2xl p-8"
      >
        <div className="text-center">
          <img
            className="mx-auto h-32 w-32 md:h-40 md:w-40"
            src={assets.logo}
            alt="Logo"
          />

          <h1 className="text-3xl font-bold text-gray-900">
            Welcome Back
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Login to continue shopping
          </p>
        </div>

        <div>
          <label
            htmlFor="email"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Email Address
          </label>

          <input
            type="email"
            id="email"
            name="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            autoComplete="email"
            required
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Password
          </label>

          <input
            type="password"
            id="password"
            name="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            autoComplete="current-password"
            required
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div className="flex justify-end -mt-2">
          <Link
            to="/forgot-password"
            className="text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            Forgot Password?
          </Link>
        </div>

        {message && (
          <div
            role="alert"
            className="rounded-lg bg-red-50 p-3 text-center text-sm text-red-600"
          >
            <p>{message}</p>

            {showVerifyLink && (
              <button
                type="button"
                onClick={handleVerifyEmail}
                disabled={loading}
                className="mt-2 font-semibold text-blue-600 underline hover:text-blue-700 disabled:opacity-60"
              >
                {loading
                  ? "Sending verification code..."
                  : "Click here to verify your email"}
              </button>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-gray-200" />
          <span className="text-sm text-gray-500">OR</span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => {
              setMessage(
                "Google login was unsuccessful. Please try again."
              );
            }}
            useOneTap={false}
          />
        </div>

        <p className="text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="font-semibold text-blue-600 hover:text-blue-700"
          >
            Create Account
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Login;

