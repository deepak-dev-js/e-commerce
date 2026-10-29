import { useCallback, useEffect, useState } from "react";
import { Bell, RefreshCw } from "lucide-react";
import { useRef } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
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

  const loadOrders = useCallback(async () => {
    const response = await fetch(`${API_URL}/api/admin/orders`, {
      method: "GET",
      credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch orders.");
    }

    return data.orders || [];
  }, []);

  useEffect(() => {
    let ignore = false;

    const getOrders = async () => {
      try {
        const fetchedOrders = await loadOrders();

        if (!ignore) {
          setOrders(fetchedOrders);
          setError("");
        }
      } catch (error) {
        console.error("Failed to fetch orders:", error);

        if (!ignore) {
          setError(error.message || "Failed to load orders.");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    getOrders();

    return () => {
      ignore = true;
    };
  }, [loadOrders]);

  const handleRefresh = async () => {
    try {
      setRefreshing(true);

      const fetchedOrders = await loadOrders();

      setOrders(fetchedOrders);
      setError("");
    } catch (error) {
      console.error("Failed to refresh orders:", error);
      alert(error.message || "Failed to refresh orders.");
    } finally {
      setRefreshing(false);
    }
  };

  const handleStatusChange = async (orderId, orderStatus) => {
    try {
      setUpdatingOrderId(orderId);

      const response = await fetch(
        `${API_URL}/api/admin/orders/${orderId}/status`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ orderStatus }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update order status.");
      }

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId
            ? { ...order, orderStatus: data.order.orderStatus }
            : order,
        ),
      );
    } catch (error) {
      console.error("Failed to update order status:", error);
      alert(error.message || "Failed to update order status.");
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleMarkAsRefunded = async (orderId) => {
    try {
      const response = await fetch(
        `${API_URL}/api/admin/orders/${orderId}/payment-status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            paymentStatus: "refunded",
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update refund status.");
      }

      setOrders((prevOrders) =>
        prevOrders.map((order) => (order._id === orderId ? data.order : order)),
      );
    } catch (error) {
      console.error("Failed to update refund status:", error);
    }
  };

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

  if (loading) {
    return <p className="p-6 text-gray-600">Loading orders...</p>;
  }

  if (error) {
    return (
      <div className="p-6">
        {" "}
        <p className="mb-4 text-red-600">{error}</p>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
          {refreshing ? "Refreshing..." : "Try Again"}
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      {" "}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {" "}
        <div>
          {" "}
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>{" "}
          <p className="mt-1 text-sm text-gray-500">
            Manage and track customer orders.{" "}
          </p>{" "}
        </div>
        {/* <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
          {refreshing ? "Refreshing..." : "Refresh"}
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
      <div className="mb-5 rounded-xl border border-gray-200 bg-white p-5">
        <p className="text-sm text-gray-500">Total Orders</p>
        <p className="mt-1 text-2xl font-bold text-gray-900">{orders.length}</p>
      </div>
      {orders.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-10 text-center">
          <h2 className="text-lg font-semibold text-gray-800">
            No orders found
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Customer orders will appear here.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="w-full min-w-[1000px] text-left text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-5 py-4 font-semibold">Order</th>
                <th className="px-5 py-4 font-semibold">Customer</th>
                <th className="px-5 py-4 font-semibold">Products</th>
                <th className="px-5 py-4 font-semibold">Total</th>
                <th className="px-5 py-4 font-semibold">Payment</th>
                <th className="px-5 py-4 font-semibold">Order Status</th>
                <th className="px-5 py-4 font-semibold">Date</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {orders.map((order) => (
                <tr key={order._id} className="align-top hover:bg-gray-50">
                  <td className="px-5 py-4">
                    <p className="font-medium text-gray-900">
                      #{order._id.slice(-8).toUpperCase()}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      ID: {order._id}
                    </p>
                  </td>

                  <td className="px-5 py-4">
                    <p className="font-medium text-gray-900">
                      {order.shippingAddress?.fullName ||
                        order.user?.name ||
                        "N/A"}
                    </p>
                    <p className="mt-1 text-gray-500">
                      {order.shippingAddress?.email ||
                        order.user?.email ||
                        "N/A"}
                    </p>
                    <p className="mt-1 text-gray-500">
                      {order.shippingAddress?.phone || "N/A"}
                    </p>
                  </td>

                  <td className="px-5 py-4">
                    <div className="space-y-3">
                      {order.items?.map((item, index) => (
                        <div
                          key={item.product?._id || item.product || index}
                          className="flex items-center gap-3"
                        >
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-14 w-14 rounded-lg border border-gray-200 object-cover"
                          />

                          <div>
                            <p className="max-w-48 font-medium text-gray-800">
                              {item.name}
                            </p>
                            <p className="mt-1 text-xs text-gray-500">
                              Qty: {item.quantity}
                            </p>
                            <p className="mt-1 text-gray-600">
                              ₹{item.price?.toLocaleString("en-IN")}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </td>

                  <td className="px-5 py-4 font-semibold text-gray-900">
                    ₹{order.totalAmount?.toLocaleString("en-IN")}
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                        order.paymentStatus === "paid"
                          ? "bg-green-100 text-green-700"
                          : order.paymentStatus === "refunded"
                            ? "bg-blue-100 text-blue-700"
                            : order.paymentStatus === "refund_processing"
                              ? "bg-yellow-100 text-yellow-700"
                              : order.paymentStatus === "failed" ||
                                  order.paymentStatus === "cancel"
                                ? "bg-red-100 text-red-700"
                                : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {order.paymentStatus === "refund_processing"
                        ? "Refund Processing"
                        : order.paymentStatus === "refunded"
                          ? "Refunded"
                          : order.paymentStatus === "paid"
                            ? "Paid"
                            : order.paymentStatus === "failed"
                              ? "Failed"
                              : order.paymentStatus === "cancel"
                                ? "Cancelled"
                                : order.paymentStatus}
                    </span>
                  </td>

                  <td>
                    {order.orderStatus === "cancelled" &&
                      order.paymentStatus === "refund_processing" && (
                        <button
                          onClick={() => handleMarkAsRefunded(order._id)}
                          className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
                        >
                          Mark as Refunded
                        </button>
                      )}
                  </td>

                  <td className="px-5 py-4">
                    <select
                      value={order.orderStatus}
                      disabled={updatingOrderId === order._id}
                      onChange={(e) =>
                        handleStatusChange(order._id, e.target.value)
                      }
                      className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm capitalize outline-none focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="awaiting_payment">Awaiting Payment</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="packed">Packed</option>
                      <option value="shipped">Shipped</option>
                      <option value="in_transit">In Transit</option>
                      <option value="out_for_delivery">Out for Delivery</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>

                    {updatingOrderId === order._id && (
                      <p className="mt-1 text-xs text-gray-500">Updating...</p>
                    )}
                  </td>

                  <td className="whitespace-nowrap px-5 py-4 text-gray-600">
                    {order.createdAt
                      ? new Date(order.createdAt).toLocaleDateString("en-IN")
                      : "N/A"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Orders;
