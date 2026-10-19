import { Link } from "react-router-dom";
import LoginForm from "../components/LoginForm";

const Login = () => {
  return (
    <main className="mx-auto max-w-md px-6 py-12">
      <h1 className="mb-6 text-3xl font-bold">Log in</h1>
      <LoginForm />
      <p className="mt-4 text-center text-sm text-gray-600">
        Don't have an account?{" "}
        <Link
          to="/register"
          className="font-semibold text-blue-600 hover:text-blue-700"
        >
          Register
        </Link>
      </p>
    </main>
  );
};

export default Login;
