import { useCallback, useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { socket } from "../../../socket";
import { useRef } from "react";

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

  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const notificationRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);


  const loadDashboardStats = useCallback(async () => {
    const response = await fetch(`${API_URL}/api/admin/dashboard/stats`, {
      credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch dashboard statistics.");
    }

    return data.stats;
  }, []);

  const loadNotifications = useCallback(async () => {
    const response = await fetch(`${API_URL}/api/admin/notifications`, {
      credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch notifications.");
    }

    return data;
  }, []);

  const markNotificationsAsRead = useCallback(async () => {
    const response = await fetch(`${API_URL}/api/admin/notifications/read`, {
      method: "PATCH",
      credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to mark notifications as read.");
    }

    setNotifications((previous) =>
      previous.map((notification) => ({
        ...notification,
        isRead: true,
      })),
    );

    setUnreadCount(0);
  }, []);

  const updateDashboardStats = useCallback((data) => {
    const { totalProducts, totalOrders, totalCustomers, totalRevenue } = data;

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
    socket.connect();

    const handleNewOrder = (order) => {
      setNotifications((previous) => [
        {
          _id: order.orderId,
          type: "new_order",
          message: order.message || "New order received",
          orderId: order.orderId,
          totalAmount: order.totalAmount,
          isRead: false,
          createdAt: new Date().toISOString(),
        },
        ...previous,
      ]);

      setUnreadCount((previous) => previous + 1);
    };

    socket.on("new_order", handleNewOrder);

    return () => {
      socket.off("new_order", handleNewOrder);
      socket.disconnect();
    };
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
          setError(error.message || "Failed to load dashboard statistics.");
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

  useEffect(() => {
    let ignore = false;

    loadNotifications()
      .then((data) => {
        if (!ignore) {
          setNotifications(data.notifications);
          setUnreadCount(data.unreadCount);
        }
      })
      .catch((error) => {
        console.error("Failed to load notifications:", error);
      });

    return () => {
      ignore = true;
    };
  }, [loadNotifications]);

  const handleRefresh = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await loadDashboardStats();
      updateDashboardStats(data);
    } catch (error) {
      console.error("Failed to refresh dashboard stats:", error);

      setError(error.message || "Failed to load dashboard statistics.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {" "}
      <div className="flex items-center justify-between gap-4">
        {" "}
        <div>
          {" "}
          <h1 className="text-3xl font-bold text-gray-900">Dashboard </h1>
          <p className="text-gray-500 mt-2">
            Welcome to your ApnaShop admin panel.
          </p>
        </div>
        {/* <button
          type="button"
          onClick={handleRefresh}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />

          {loading ? "Refreshing..." : "Refresh"}
        </button> */}

        <button
          type="button"
          onClick={async () => {
            const shouldOpen = !showNotifications;

            setShowNotifications(shouldOpen);

            if (shouldOpen && unreadCount > 0) {
              try {
                await markNotificationsAsRead();
              } catch (error) {
                console.error("Failed to mark notifications as read:", error);
              }
            }
          }}
          className="relative rounded-full p-2 hover:bg-gray-100"
          aria-label={`Notifications: ${unreadCount} unread`}
        >
          <Bell size={24} />

          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-xs font-bold text-white">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>
        {showNotifications && (
          <div ref={notificationRef} className="absolute right-0 top-12 z-50 w-80 rounded-xl border border-gray-200 bg-white p-4 shadow-lg">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">
                Notifications
              </h3>

              <span className="text-sm text-gray-500">
                {unreadCount} unread
              </span>
            </div>

            {notifications.length === 0 ? (
              <p className="py-4 text-center text-sm text-gray-500">
                No notifications yet.
              </p>
            ) : (
              <div className="max-h-80 space-y-2 overflow-y-auto">
                {notifications.map((notification) => (
                  <div
                    key={notification._id}
                    className={`rounded-lg p-3 ${notification.isRead ? "bg-white" : "bg-blue-50"
                      }`}
                  >

                    <p className="text-sm font-medium text-gray-900">
                      {notification.message}
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      {new Date(notification.createdAt).toLocaleString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })}
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      Order ID: {notification.orderId}
                    </p>

                    <p className="mt-1 text-sm font-semibold text-gray-800">
                      ₹{Number(notification.totalAmount).toLocaleString("en-IN")}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
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
          <div key={stat.title} className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-gray-500">{stat.title}</p>

            <h2 className="text-3xl font-bold mt-3">{stat.value}</h2>
          </div>
        ))}
      </div>
      <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-semibold">Getting Started</h2>

        <p className="text-gray-600 mt-2">
          Start by adding products to your store.
        </p>
      </div>
    </div>
  );
};

export default AdminDashboard;
