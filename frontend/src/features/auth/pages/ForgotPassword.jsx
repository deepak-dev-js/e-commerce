import { useState } from "react";
import { Link } from "react-router-dom";
import { forgotPassword } from "../services/authService";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setIsSuccess(false);
      setMessage("Please enter your email address.");
      return;
    }

    setMessage("");
    setIsSuccess(false);
    setLoading(true);

    try {
      const responseMessage = await forgotPassword(normalizedEmail);

      setIsSuccess(true);
      setMessage(responseMessage);
    } catch (error) {
      console.error("Forgot password failed:", error);

      setIsSuccess(false);
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to process your request. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4 py-10">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-5 rounded-2xl p-8"
      >
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-blue-50">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.8}
              stroke="currentColor"
              className="h-10 w-10 text-blue-600"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 10.5V6.75a4.5 4.5 0 0 0-9 0v3.75m-.75 0h10.5c.621 0 1.125.504 1.125 1.125v7.5c0 .621-.504 1.125-1.125 1.125H6.75a1.125 1.125 0 0 1-1.125-1.125v-7.5c0-.621.504-1.125 1.125-1.125Z"
              />
            </svg>
          </div>

          <h1 className="text-3xl font-bold text-gray-900">
            Forgot Password?
          </h1>

          <p className="mt-3 text-sm leading-6 text-gray-500">
            Enter your email address and we'll send you instructions to reset
            your password.
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
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
            disabled={loading}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:opacity-60"
          />
        </div>

        {message && (
          <p
            role="alert"
            aria-live="polite"
            className={`rounded-lg p-3 text-center text-sm ${
              isSuccess
                ? "bg-green-50 text-green-700"
                : "bg-red-50 text-red-600"
            }`}
          >
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Sending..." : "Send Reset Link"}
        </button>

        <div className="pt-2 text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 rounded-lg p-2 text-sm font-semibold text-blue-600 hover:text-blue-700"
          >
            <span aria-hidden="true">←</span>
            Back to Login
          </Link>
        </div>
      </form>
    </div>
  );
}
