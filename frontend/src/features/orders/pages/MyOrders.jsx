import { useEffect, useState } from "react";
import Swal from "sweetalert2";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const MyOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [cancellingOrderId, setCancellingOrderId] = useState(null);

    const handleCancelOrder = async (orderId) => {
        const result = await Swal.fire({
            title: "Cancel Order?",
            text: "Are you sure you want to cancel this order?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, cancel order",
            cancelButtonText: "Keep Order",
            confirmButtonColor: "#dc2626",
            cancelButtonColor: "#6b7280",
            reverseButtons: true,
            focusCancel: true,
        });

        if (!result.isConfirmed) return;

        try {
            setCancellingOrderId(orderId);

            Swal.fire({
                title: "Cancelling Order...",
                text: "Please wait.",
                allowOutsideClick: false,
                allowEscapeKey: false,
                showConfirmButton: false,
                didOpen: () => {
                    Swal.showLoading();
                },
            });

            const response = await fetch(
                `${API_URL}/api/orders/${orderId}/cancel`,
                {
                    method: "PATCH",
                    credentials: "include",
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to cancel order.");
            }

            setOrders((prevOrders) =>
                prevOrders.map((order) =>
                    order._id === orderId ? data.order : order
                )
            );

            await Swal.fire({
                title: "Order Cancelled!",
                text: "Your order has been cancelled successfully.",
                icon: "success",
                confirmButtonText: "OK",
                confirmButtonColor: "#2563eb",
            });
        } catch (error) {
            console.error("Failed to cancel order:", error);

            await Swal.fire({
                title: "Cancellation Failed",
                text: error.message || "Failed to cancel order.",
                icon: "error",
                confirmButtonText: "OK",
                confirmButtonColor: "#2563eb",
            });
        } finally {
            setCancellingOrderId(null);
        }
    };


    useEffect(() => {
        const fetchMyOrders = async () => {
            try {
                const response = await fetch(`${API_URL}/api/orders/my-orders`, {
                    credentials: "include",
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || "Failed to fetch orders.");
                }

                setOrders(data.orders || []);
            } catch (error) {
                console.error("Failed to fetch my orders:", error);
                setError(error.message || "Failed to load orders.");
            } finally {
                setLoading(false);
            }
        };

        fetchMyOrders();
    }, []);

    if (loading) {
        return <p className="p-6 text-gray-600">Loading your orders...</p>;
    }

    if (error) {
        return <p className="p-6 text-red-600">{error}</p>;
    }

    return (
        <main className="mx-auto max-w-5xl px-4 py-8">
            <h1 className="mb-2 text-2xl font-bold text-gray-900">
                My Orders
            </h1>

            <p className="mb-6 text-gray-500">
                View your purchases and track their delivery status.
            </p>

            {orders.length === 0 ? (
                <div className="rounded-xl border border-gray-200 p-10 text-center">
                    <h2 className="text-lg font-semibold text-gray-800">
                        No orders yet
                    </h2>

                    <p className="mt-2 text-gray-500">
                        Your orders will appear here after you place an order.
                    </p>
                </div>
            ) : (
                <div className="space-y-5">
                    {orders.map((order) => (
                        <section
                            key={order._id}
                            className="rounded-xl border border-gray-200 bg-white p-4 sm:p-6"
                        >
                            <div className="mb-4 flex flex-wrap justify-between gap-3 border-b border-gray-100 pb-4">
                                <div>
                                    <p className="text-sm text-gray-500">Order ID</p>
                                    <p className="font-semibold text-gray-900">
                                        #{order._id.slice(-8).toUpperCase()}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-500">Order Date</p>
                                    <p className="font-medium text-gray-900">
                                        {new Date(order.createdAt).toLocaleDateString("en-IN")}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-500">Payment</p>
                                    <p className="font-medium capitalize text-gray-900">
                                        {order.paymentStatus}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {order.items.map((item, index) => (
                                    <div
                                        key={item.product || index}
                                        className="flex items-center gap-4"
                                    >
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="h-20 w-20 rounded-lg border border-gray-200 object-cover"
                                        />

                                        <div className="min-w-0 flex-1">
                                            <h3 className="font-semibold text-gray-900">
                                                {item.name}
                                            </h3>

                                            <p className="mt-1 text-sm text-gray-500">
                                                Quantity: {item.quantity}
                                            </p>

                                            <p className="mt-1 font-medium text-gray-800">
                                                ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4">
                                <div>
                                    <p className="text-sm text-gray-500">Order Status</p>

                                    <span className="mt-1 inline-block rounded-full bg-blue-50 px-3 py-1 text-sm font-medium capitalize text-blue-700">
                                        {order.orderStatus.replaceAll("_", " ")}
                                    </span>

                                    {[
                                        "confirmed",
                                        "packed",
                                        "shipped",
                                        "in_transit",
                                        "out_for_delivery",
                                    ].includes(order.orderStatus) && (
                                            <button
                                                onClick={() => handleCancelOrder(order._id)}
                                                disabled={cancellingOrderId === order._id}
                                                className="ml-4 inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                {cancellingOrderId === order._id && (
                                                    <svg
                                                        className="h-4 w-4 animate-spin"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <circle
                                                            className="opacity-25"
                                                            cx="12"
                                                            cy="12"
                                                            r="10"
                                                            stroke="currentColor"
                                                            strokeWidth="4"
                                                        />

                                                        <path
                                                            className="opacity-75"
                                                            fill="currentColor"
                                                            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                                                        />
                                                    </svg>
                                                )}

                                                {cancellingOrderId === order._id
                                                    ? "Cancelling..."
                                                    : "Cancel Order"}
                                            </button>
                                        )}
                                </div>

                                <p className="text-lg font-bold text-gray-900">
                                    Total: ₹{order.totalAmount.toLocaleString("en-IN")}
                                </p>
                            </div>
                        </section>
                    ))}
                </div>
            )}
        </main>
    );
};

export default MyOrders;

