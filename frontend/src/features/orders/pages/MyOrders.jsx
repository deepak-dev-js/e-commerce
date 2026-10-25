import { useEffect, useState } from "react";
import Swal from "sweetalert2";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const MyOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [reviewForms, setReviewForms] = useState({});
    const [submittingReview, setSubmittingReview] = useState(null);

    useEffect(() => {
        let ignore = false;

        const fetchMyOrders = async () => {
            try {
                const response = await fetch(`${API_URL}/api/customer/orders`, {
                    credentials: "include",
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || "Failed to fetch orders.");
                }

                if (!ignore) {
                    setOrders(data.orders || []);
                }
            } catch (error) {
                console.error("Failed to fetch my orders:", error);

                if (!ignore) {
                    setError(error.message || "Failed to load orders.");
                }
            } finally {
                if (!ignore) {
                    setLoading(false);
                }
            }
        };

        Promise.resolve().then(() => {
            if (!ignore) {
                fetchMyOrders();
            }
        });

        return () => {
            ignore = true;
        };
    }, []);

    const handleCancelOrder = async (orderId) => {
        const result = await Swal.fire({
            title: "Cancel Order?",
            text: "Are you sure you want to cancel this order?",
            icon: "warning",
            width: "350px",
            showCancelButton: true,
            confirmButtonText: "Yes, cancel order",
            cancelButtonText: "Keep Order",
        });

        if (!result.isConfirmed) return;

        try {
            Swal.fire({
                title: "Cancelling Order...",
                allowOutsideClick: false,
                showConfirmButton: false,
                didOpen: () => Swal.showLoading(),
            });

            const response = await fetch(
                `${API_URL}/api/customer/${orderId}/cancel`,
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
                confirmButtonColor: "#2563eb",
            });
        } catch (error) {
            console.error("Failed to cancel order:", error);

            await Swal.fire({
                title: "Cancellation Failed",
                text: error.message || "Failed to cancel order.",
                icon: "error",
                confirmButtonColor: "#2563eb",
            });
        }
    };

    const updateReviewForm = (productId, field, value) => {
        setReviewForms((prev) => ({
            ...prev,
            [productId]: {
                rating: prev[productId]?.rating || 0,
                comment: prev[productId]?.comment || "",
                ...prev[productId],
                [field]: value,
            },
        }));
    };

    const handleSubmitReview = async (productId) => {
        const form = reviewForms[productId];

        if (!form?.rating) {
            await Swal.fire({
                icon: "warning",
                title: "Rating Required",
                text: "Please select a star rating before submitting.",
            });
            return;
        }

        try {
            setSubmittingReview(productId);

            const response = await fetch(
                `${API_URL}/api/products/${productId}/reviews`,
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        rating: form.rating,
                        comment: form.comment,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to submit review.");
            }

            await Swal.fire({
                icon: "success",
                title: "Review Submitted!",
                text: "Thank you for sharing your experience.",
                confirmButtonColor: "#2563eb",
            });

            setReviewForms((prev) => ({
                ...prev,
                [productId]: {
                    ...prev[productId],
                    submitted: true,
                },
            }));
        } catch (error) {
            console.error("Failed to submit review:", error);

            await Swal.fire({
                icon: "error",
                title: "Review Failed",
                text: error.message || "Failed to submit review.",
            });
        } finally {
            setSubmittingReview(null);
        }
    };

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
                                    <p className="text-sm text-gray-500">
                                        Order ID
                                    </p>
                                    <p className="font-semibold text-gray-900">
                                        #{order._id.slice(-8).toUpperCase()}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-500">
                                        Order Date
                                    </p>
                                    <p className="font-medium text-gray-900">
                                        {new Date(
                                            order.createdAt
                                        ).toLocaleDateString("en-IN")}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-500">
                                        Payment
                                    </p>
                                    <p className="font-medium capitalize text-gray-900">
                                        {order.paymentStatus}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-5">
                                {order.items.map((item, index) => {
                                    const productId =
                                        typeof item.product === "object"
                                            ? item.product._id
                                            : item.product;

                                    const form = reviewForms[productId] || {
                                        rating: 0,
                                        comment: "",
                                    };

                                    const isDelivered =
                                        order.orderStatus === "delivered";

                                    return (
                                        <div
                                            key={productId || index}
                                            className="rounded-lg border border-gray-100 p-3 sm:p-4"
                                        >
                                            <div className="flex items-center gap-4">
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
                                                        ₹
                                                        {(
                                                            item.price *
                                                            item.quantity
                                                        ).toLocaleString("en-IN")}
                                                    </p>
                                                </div>
                                            </div>

                                            {isDelivered && (
                                                <div className="mt-4 rounded-lg bg-green-50 p-4">
                                                    <p className="font-semibold text-green-800">
                                                        ✓ Order Delivered
                                                    </p>

                                                    <p className="mt-1 text-sm text-green-700">
                                                        How was this product?
                                                        Share your experience.
                                                    </p>

                                                    {form.submitted ? (
                                                        <p className="mt-3 font-medium text-green-800">
                                                            ✓ Review submitted successfully!
                                                        </p>
                                                    ) : (
                                                        <>
                                                            <div
                                                                className="mt-3 flex gap-1"
                                                                role="group"
                                                                aria-label={`Rate ${item.name}`}
                                                            >
                                                                {[1, 2, 3, 4, 5].map(
                                                                    (star) => (
                                                                        <button
                                                                            key={star}
                                                                            type="button"
                                                                            onClick={() =>
                                                                                updateReviewForm(
                                                                                    productId,
                                                                                    "rating",
                                                                                    star
                                                                                )
                                                                            }
                                                                            className={`text-3xl ${star <=
                                                                                    form.rating
                                                                                    ? "text-yellow-400"
                                                                                    : "text-gray-300"
                                                                                }`}
                                                                            aria-label={`${star} star${star > 1 ? "s" : ""}`}
                                                                        >
                                                                            ★
                                                                        </button>
                                                                    )
                                                                )}
                                                            </div>

                                                            <textarea
                                                                value={
                                                                    form.comment
                                                                }
                                                                onChange={(e) =>
                                                                    updateReviewForm(
                                                                        productId,
                                                                        "comment",
                                                                        e.target.value
                                                                    )
                                                                }
                                                                placeholder="Write your review..."
                                                                maxLength={1000}
                                                                rows={3}
                                                                className="mt-3 w-full rounded-lg border border-gray-300 bg-white p-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                                            />

                                                            <button
                                                                type="button"
                                                                disabled={
                                                                    submittingReview ===
                                                                    productId
                                                                }
                                                                onClick={() =>
                                                                    handleSubmitReview(
                                                                        productId
                                                                    )
                                                                }
                                                                className="mt-3 rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                                                            >
                                                                {submittingReview ===
                                                                    productId
                                                                    ? "Submitting..."
                                                                    : "Submit Review"}
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4">
                                <div>
                                    <p className="text-sm text-gray-500">
                                        Order Status
                                    </p>

                                    <span
                                        className={`mt-1 inline-block rounded-full px-3 py-1 text-sm font-medium capitalize ${order.orderStatus === "delivered"
                                                ? "bg-green-50 text-green-700"
                                                : "bg-blue-50 text-blue-700"
                                            }`}
                                    >
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
                                                onClick={() =>
                                                    handleCancelOrder(order._id)
                                                }
                                                className="ml-4 rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                                            >
                                                Cancel Order
                                            </button>
                                        )}
                                </div>

                                <p className="text-lg font-bold text-gray-900">
                                    Total: ₹
                                    {order.totalAmount.toLocaleString("en-IN")}
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