import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch(`${API_URL}/api/admin/orders`, {
          method: "GET",
          credentials: "include",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch orders.");
        }

        setOrders(data.orders || []);
      } catch (error) {
        console.error("Failed to fetch orders:", error);
        setError(error.message || "Failed to load orders.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return <p className="p-6 text-gray-600">Loading orders...</p>;
  }

  if (error) {
    return <p className="p-6 text-red-600">{error}</p>;
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage and track customer orders.
        </p>
      </div>

      <div className="mb-5 rounded-xl border border-gray-200 bg-white p-5">
        <p className="text-sm text-gray-500">Total Orders</p>
        <p className="mt-1 text-2xl font-bold text-gray-900">
          {orders.length}
        </p>
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
                      {order.shippingAddress?.fullName || order.user?.name || "N/A"}
                    </p>
                    <p className="mt-1 text-gray-500">
                      {order.shippingAddress?.email || order.user?.email || "N/A"}
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
                          : order.paymentStatus === "failed"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {order.paymentStatus}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <span className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-medium capitalize text-blue-700">
                      {order.orderStatus}
                    </span>
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
