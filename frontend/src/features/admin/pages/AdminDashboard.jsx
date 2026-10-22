import { useCallback, useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const AdminDashboard = () => {
  const [stats, setStats] = useState([
    { title: "Total Products", value: "—" },
    { title: "Total Orders", value: "—" },
    { title: "Total Customers", value: "—" },
    { title: "Total Revenue", value: "—" },
  ]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboardStats = useCallback(async () => {
    const response = await fetch(
      `${API_URL}/api/admin/dashboard/stats`,
      {
        credentials: "include",
      }
    );


    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Failed to fetch dashboard statistics."
      );
    }

    return data.stats;


  }, []);

  const updateDashboardStats = useCallback((data) => {
    const {
      totalProducts,
      totalOrders,
      totalCustomers,
      totalRevenue,
    } = data;


    setStats([
      { title: "Total Products", value: totalProducts },
      { title: "Total Orders", value: totalOrders },
      { title: "Total Customers", value: totalCustomers },
      {
        title: "Total Revenue",
        value: `₹${Number(totalRevenue).toLocaleString("en-IN")}`,
      },
    ]);


  }, []);

  useEffect(() => {
    let ignore = false;


    const loadStats = async () => {
      try {
        const data = await loadDashboardStats();

        if (!ignore) {
          updateDashboardStats(data);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);

        if (!ignore) {
          setError(
            error.message || "Failed to load dashboard statistics."
          );
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadStats();

    return () => {
      ignore = true;
    };


  }, [loadDashboardStats, updateDashboardStats]);

  const handleRefresh = async () => {
    setLoading(true);
    setError("");


    try {
      const data = await loadDashboardStats();
      updateDashboardStats(data);
    } catch (error) {
      console.error("Failed to refresh dashboard stats:", error);

      setError(
        error.message || "Failed to load dashboard statistics."
      );
    } finally {
      setLoading(false);
    }


  };

  return (<div> <div className="flex items-center justify-between gap-4"> <div> <h1 className="text-3xl font-bold text-gray-900">
    Dashboard </h1>


    <p className="text-gray-500 mt-2">
      Welcome to your ApnaShop admin panel.
    </p>
  </div>

    <button
      type="button"
      onClick={handleRefresh}
      disabled={loading}
      className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <RefreshCw
        size={16}
        className={loading ? "animate-spin" : ""}
      />

      {loading ? "Refreshing..." : "Refresh"}
    </button>
  </div>

    {error && (
      <div className="mt-4 flex items-center justify-between gap-3 rounded-lg bg-red-50 p-3 text-sm text-red-600">
        <p>{error}</p>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={loading}
          className="shrink-0 font-semibold underline disabled:opacity-60"
        >
          Try again
        </button>
      </div>
    )}

    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mt-8">
      {stats.map((stat) => (
        <div
          key={stat.title}
          className="bg-white rounded-xl shadow-sm p-6"
        >
          <p className="text-gray-500">
            {stat.title}
          </p>

          <h2 className="text-3xl font-bold mt-3">
            {stat.value}
          </h2>
        </div>
      ))}
    </div>

    <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-semibold">
        Getting Started
      </h2>

      <p className="text-gray-600 mt-2">
        Start by adding products to your store.
      </p>
    </div>
  </div>

  );
};

export default AdminDashboard;
