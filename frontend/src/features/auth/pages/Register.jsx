import { useState } from "react";
import { registerUser } from "../services/authService";
import { Link, useNavigate } from "react-router-dom";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const data = await registerUser(formData);
      setMessage(data.message);
      navigate("/home");

      setFormData({
        name: "",
        email: "",
        password: "",
      });
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-5 rounded-2xl bg-white p-8 shadow-xl"
      >
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Create Account
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Sign up to start shopping with us
          </p>
        </div>

        <div>
          <label
            htmlFor="name"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Full Name
          </label>

          <input
            type="text"
            id="name"
            name="name"
            placeholder="Enter your full name"
            value={formData.name}
            onChange={handleChange}
            autoComplete="name"
            required
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
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
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
            placeholder="Minimum 8 characters"
            value={formData.password}
            onChange={handleChange}
            autoComplete="new-password"
            minLength={8}
            required
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Registering..." : "Create Account"}
        </button>

        {message && (
          <p
            role="status"
            aria-live="polite"
            className="rounded-lg bg-gray-50 p-3 text-center text-sm text-gray-700"
          >
            {message}
          </p>
        )}
      </form>
      <p className="mt-4 text-center text-sm text-gray-600">
        Already have an account?{" "}
        <Link
          to="/login"
          className="font-semibold text-blue-600 hover:text-blue-700"
        >
          Login
        </Link>
      </p>
    </>


  );
};

export default Register;