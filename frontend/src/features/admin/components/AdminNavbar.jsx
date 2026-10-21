
import { useNavigate } from "react-router-dom";

const AdminNavbar = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/logout`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Logout failed");
      }

      navigate("/", { replace: true });
      window.location.reload();
    } catch (error) {
      console.error("Admin logout failed:", error);
    }
  };

  return (
    <header className="flex items-center justify-between border-b bg-white px-8 py-4">
      <div>
        <h1 className="text-xl font-bold text-gray-800">
          ApnaShop Admin
        </h1>

        <p className="text-sm text-gray-500">
          Manage your store
        </p>
      </div>

      <button
        onClick={handleLogout}
        className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
      >
        Logout
      </button>
    </header>
  );
};

export default AdminNavbar;

