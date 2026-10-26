import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

const API_URL = process.env.EXPO_PUBLIC_API_URL;


type ProductReference = string | { _id: string };

type OrderItem = {
    product: ProductReference;
    name: string;
    image?: string;
    price: number;
    quantity: number;
};

type Order = {
    _id: string;
    createdAt: string;
    paymentStatus: string;
    orderStatus: string;
    items: OrderItem[];
    totalAmount: number;
};

type ReviewForm = {
    rating: number;
    comment: string;
    submitted?: boolean;
};

type ReviewedProduct = ReviewForm;

type ReviewMap = Record<string, ReviewForm>;

const Orders = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>("");
    const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);
    const [reviewForms, setReviewForms] = useState<ReviewMap>({});
    const [submittingReview, setSubmittingReview] = useState<string | null>(null);
    const [reviewedProducts, setReviewedProducts] = useState<
        Record<string, ReviewedProduct>
    >({});

    useEffect(() => {
        let ignore = false;

        const fetchMyOrders = async () => {
            try {
                // 1. Fetch customer orders
                const ordersResponse = await fetch(
                    `${API_URL}/api/customer/orders`,
                    {
                        credentials: "include",
                    }
                );

                const ordersData = await ordersResponse.json();

                console.log(555, ordersData)

                if (!ordersResponse.ok) {
                    throw new Error(
                        ordersData.message || "Failed to fetch orders."
                    );
                }

                if (ignore) return;

                setOrders(ordersData.orders || []);

                // 2. Fetch existing reviews
                const reviewsResponse = await fetch(
                    `${API_URL}/api/customer/review`,
                    {
                        credentials: "include",
                    }
                );

                const reviewsData = await reviewsResponse.json();

                if (!reviewsResponse.ok) {
                    throw new Error(
                        reviewsData.message || "Failed to fetch your reviews."
                    );
                }

                if (ignore) return;

                // 3. Create a map of reviewed products
                const reviewsMap: Record<string, ReviewForm> = {};

                (reviewsData.reviews || []).forEach(
                    (review: {
                        product: string | { _id: string };
                        rating: number;
                        comment?: string;
                    }) => {
                        const productId =
                            typeof review.product === "object"
                                ? review.product._id
                                : review.product;

                        reviewsMap[productId] = {
                            rating: review.rating,
                            comment: review.comment || "",
                            submitted: true,
                        };
                    }
                );

                setReviewedProducts(reviewsMap);
            } catch (error: unknown) {
                console.error("Failed to fetch orders or reviews:", error);

                if (!ignore) {
                    setError(
                        error instanceof Error
                            ? error.message
                            : "Failed to load orders."
                    );
                }
            } finally {
                if (!ignore) {
                    setLoading(false);
                }
            }
        };

        fetchMyOrders();

        return () => {
            ignore = true;
        };
    }, []); const handleCancelOrder = (orderId: string) => {
        Alert.alert(
            "Cancel Order?",
            "Are you sure you want to cancel this order?",
            [
                {
                    text: "Keep Order",
                    style: "cancel",
                },
                {
                    text: "Yes, cancel order",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            setCancellingOrderId(orderId);

                            const response = await fetch(
                                `${API_URL}/api/customer/${orderId}/cancel`,
                                {
                                    method: "PATCH",
                                    credentials: "include",
                                }
                            );

                            const data = await response.json();

                            if (!response.ok) {
                                throw new Error(
                                    data.message || "Failed to cancel order."
                                );
                            }

                            setOrders((prevOrders) =>
                                prevOrders.map((order) =>
                                    order._id === orderId ? data.order : order
                                )
                            );

                            Alert.alert(
                                "Order Cancelled!",
                                "Your order has been cancelled successfully."
                            );
                        } catch (error: unknown) {
                            console.error("Failed to cancel order:", error);

                            Alert.alert(
                                "Cancellation Failed",
                                error instanceof Error
                                    ? error.message
                                    : "Failed to cancel order."
                            );
                        } finally {
                            setCancellingOrderId(null);
                        }
                    },
                },
            ]
        );
    }; const updateReviewForm = (
        productId: string,
        field: "rating" | "comment",
        value: number | string
    ) => {
        setReviewForms((prev) => ({
            ...prev,
            [productId]: {
                rating:
                    field === "rating"
                        ? (value as number)
                        : prev[productId]?.rating ?? 0,

                comment:
                    field === "comment"
                        ? (value as string)
                        : prev[productId]?.comment ?? "",

                submitted: prev[productId]?.submitted,
            },
        }));
    };

    const handleSubmitReview = async (productId: string) => {
        const form = reviewForms[productId];

        if (!form?.rating) {
            Alert.alert(
                "Rating Required",
                "Please select a star rating before submitting."
            );
            return;
        }

        try {
            setSubmittingReview(productId);

            const response = await fetch(
                `${API_URL}/api/customer/product/${productId}/review`,
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

            // Update reviewed products
            setReviewedProducts((prev) => ({
                ...prev,
                [productId]: {
                    rating: form.rating,
                    comment: form.comment || "",
                    submitted: true,
                },
            }));

            // Update review form
            setReviewForms((prev) => ({
                ...prev,
                [productId]: {
                    ...prev[productId],
                    submitted: true,
                },
            }));

            Alert.alert(
                "Review Submitted!",
                "Thank you for sharing your experience."
            );
        } catch (error: unknown) {
            console.error("Failed to submit review:", error);

            const message =
                error instanceof Error
                    ? error.message
                    : "Failed to submit review.";

            Alert.alert("Review Failed", message);
        } finally {
            setSubmittingReview(null);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>My Orders</Text>

            <Text style={styles.subtitle}>
                View your purchases and track their delivery status.
            </Text>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#2563eb" />
                    <Text style={styles.message}>Loading your orders...</Text>
                </View>
            ) : orders.length === 0 ? (
                <View style={styles.emptyCard}>
                    <Text style={styles.emptyTitle}>No orders yet</Text>

                    <Text style={styles.message}>
                        Your orders will appear here after you place an order.
                    </Text>
                </View>
            ) : (

                <View>
                    {orders.map((order) => (
                        <View key={order._id} style={styles.orderCard}>
                            {/* Order information */}
                            <View style={styles.orderHeader}>
                                <View style={styles.orderInfo}>
                                    <Text style={styles.metaLabel}>Order ID</Text>
                                    <Text style={styles.orderId}>
                                        #{order._id.slice(-8).toUpperCase()}
                                    </Text>
                                </View>

                                <View style={styles.orderInfo}>
                                    <Text style={styles.metaLabel}>Order Date</Text>
                                    <Text style={styles.metaValue}>
                                        {new Date(order.createdAt).toLocaleDateString("en-IN")}
                                    </Text>
                                </View>

                                <View style={styles.orderInfo}>
                                    <Text style={styles.metaLabel}>Payment</Text>
                                    <Text style={styles.metaValue}>
                                        {order.paymentStatus}
                                    </Text>
                                </View>
                            </View>

                            {/* Order items */}
                            {order.items.map((item, index) => {
                                const productId =
                                    typeof item.product === "string"
                                        ? item.product
                                        : item.product?._id?.toString() ?? "";

                                const form = {
                                    rating:
                                        reviewedProducts[productId]?.rating ??
                                        reviewForms[productId]?.rating ??
                                        0,
                                    comment:
                                        reviewedProducts[productId]?.comment ??
                                        reviewForms[productId]?.comment ??
                                        "",
                                    submitted:
                                        reviewedProducts[productId]?.submitted === true ||
                                        reviewForms[productId]?.submitted === true,
                                };

                                const isDelivered = order.orderStatus === "delivered";

                                return (
                                    <View
                                        key={productId || `${order._id}-${index}`}
                                        style={styles.itemCard}
                                    >
                                        {/* Product details */}
                                        <View style={styles.productRow}>
                                            {item.image ? (
                                                <Image
                                                    source={{ uri: item.image }}
                                                    style={styles.productImage}
                                                    resizeMode="cover"
                                                />
                                            ) : (
                                                <View style={[styles.productImage, styles.imagePlaceholder]}>
                                                    <Text style={styles.placeholderText}>No image</Text>
                                                </View>
                                            )}

                                            <View style={styles.productDetails}>
                                                <Text style={styles.productName}>{item.name}</Text>

                                                <Text style={styles.itemMeta}>
                                                    Quantity: {item.quantity}
                                                </Text>

                                                <Text style={styles.itemPrice}>
                                                    ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                                                </Text>
                                            </View>
                                        </View>

                                        {/* Review section: delivered orders only */}
                                        {isDelivered && (
                                            <View style={styles.reviewPanel}>
                                                <Text style={styles.deliveredTitle}>
                                                    ✓ Order Delivered
                                                </Text>

                                                {form.submitted ? (
                                                    <View style={styles.reviewSubmitted}>
                                                        <Text style={styles.deliveredTitle}>
                                                            ✓ Thank you for your review!
                                                        </Text>

                                                        <View style={styles.starsRow}>
                                                            {[1, 2, 3, 4, 5].map((star) => (
                                                                <Text
                                                                    key={star}
                                                                    style={[
                                                                        styles.displayStar,
                                                                        star <= form.rating
                                                                            ? styles.starSelected
                                                                            : styles.starUnselected,
                                                                    ]}
                                                                >
                                                                    ★
                                                                </Text>
                                                            ))}
                                                        </View>

                                                        {!!form.comment && (
                                                            <Text style={styles.reviewComment}>
                                                                {form.comment}
                                                            </Text>
                                                        )}
                                                    </View>
                                                ) : (
                                                    <>
                                                        <Text style={styles.reviewHint}>
                                                            How was this product? Share your experience.
                                                        </Text>

                                                        {/* Star rating */}
                                                        <View style={styles.starsRow}>
                                                            {[1, 2, 3, 4, 5].map((star) => (
                                                                <Pressable
                                                                    key={star}
                                                                    onPress={() =>
                                                                        updateReviewForm(productId, "rating", star)
                                                                    }
                                                                    accessibilityRole="button"
                                                                    accessibilityLabel={`${star} star${star > 1 ? "s" : ""
                                                                        }`}
                                                                    hitSlop={6}
                                                                >
                                                                    <Text
                                                                        style={[
                                                                            styles.inputStar,
                                                                            star <= form.rating
                                                                                ? styles.starSelected
                                                                                : styles.starUnselected,
                                                                        ]}
                                                                    >
                                                                        ★
                                                                    </Text>
                                                                </Pressable>
                                                            ))}
                                                        </View>

                                                        {/* Review comment */}
                                                        <TextInput
                                                            value={form.comment}
                                                            onChangeText={(value) =>
                                                                updateReviewForm(productId, "comment", value)
                                                            }
                                                            placeholder="Write your review..."
                                                            placeholderTextColor="#9ca3af"
                                                            maxLength={1000}
                                                            multiline
                                                            textAlignVertical="top"
                                                            style={styles.reviewInput}
                                                        />

                                                        {/* Submit review */}
                                                        <Pressable
                                                            disabled={submittingReview === productId}
                                                            onPress={() => handleSubmitReview(productId)}
                                                            style={[
                                                                styles.submitButton,
                                                                submittingReview === productId &&
                                                                styles.disabledButton,
                                                            ]}
                                                        >
                                                            {submittingReview === productId ? (
                                                                <View style={styles.buttonLoading}>
                                                                    <ActivityIndicator
                                                                        size="small"
                                                                        color="#ffffff"
                                                                    />
                                                                    <Text style={styles.submitButtonText}>
                                                                        Submitting...
                                                                    </Text>
                                                                </View>
                                                            ) : (
                                                                <Text style={styles.submitButtonText}>
                                                                    Submit Review
                                                                </Text>
                                                            )}
                                                        </Pressable>
                                                    </>
                                                )}
                                            </View>
                                        )}
                                    </View>
                                );
                            })}

                            {/* Order status and total */}
                            <View style={styles.orderFooter}>
                                <View style={styles.statusSection}>
                                    <Text style={styles.metaLabel}>Order Status</Text>

                                    <Text
                                        style={[
                                            styles.statusBadge,
                                            order.orderStatus === "delivered"
                                                ? styles.deliveredBadge
                                                : styles.otherStatusBadge,
                                        ]}
                                    >
                                        {order.orderStatus.replace(/_/g, " ")}
                                    </Text>

                                    {[
                                        "confirmed",
                                        "packed",
                                        "shipped",
                                        "in_transit",
                                        "out_for_delivery",
                                    ].includes(order.orderStatus) && (
                                            <Pressable
                                                disabled={cancellingOrderId === order._id}
                                                onPress={() => handleCancelOrder(order._id)}
                                                style={[
                                                    styles.cancelButton,
                                                    cancellingOrderId === order._id &&
                                                    styles.disabledButton,
                                                ]}
                                            >
                                                {cancellingOrderId === order._id ? (
                                                    <View style={styles.buttonLoading}>
                                                        <ActivityIndicator size="small" color="#dc2626" />
                                                        <Text style={styles.cancelButtonText}>
                                                            Cancelling...
                                                        </Text>
                                                    </View>
                                                ) : (
                                                    <Text style={styles.cancelButtonText}>
                                                        Cancel Order
                                                    </Text>
                                                )}
                                            </Pressable>
                                        )}
                                </View>

                                <Text style={styles.totalText}>
                                    Total: ₹{order.totalAmount.toLocaleString("en-IN")}
                                </Text>
                            </View>
                        </View>
                    ))}
                </View>


            )}
        </ScrollView>
    );
};

export default Orders;


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f9fafb",
    },
    title: {
        fontSize: 26,
        fontWeight: "700",
        color: "#111827",
        marginTop: 20,
        marginHorizontal: 16,
    },
    subtitle: {
        fontSize: 14,
        color: "#6b7280",
        marginTop: 8,
        marginHorizontal: 16,
        marginBottom: 20,
    },
    center: {
        alignItems: "center",
        justifyContent: "center",
        padding: 30,
    },
    message: {
        fontSize: 14,
        color: "#6b7280",
        marginTop: 8,
        textAlign: "center",
    },
    emptyCard: {
        backgroundColor: "#ffffff",
        borderWidth: 1,
        borderColor: "#e5e7eb",
        borderRadius: 12,
        padding: 30,
        marginHorizontal: 16,
        alignItems: "center",
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#1f2937",
    },
    orderCard: {
        backgroundColor: "#ffffff",
        borderWidth: 1,
        borderColor: "#e5e7eb",
        borderRadius: 12,
        padding: 14,
        marginBottom: 20,
    },
    orderHeader: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        gap: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#f3f4f6",
        paddingBottom: 14,
        marginBottom: 14,
    },
    orderInfo: {
        flexGrow: 1,
        minWidth: "28%",
    },
    metaLabel: {
        fontSize: 12,
        color: "#6b7280",
        marginBottom: 4,
    },
    orderId: {
        fontSize: 14,
        fontWeight: "700",
        color: "#111827",
    },
    metaValue: {
        fontSize: 13,
        fontWeight: "500",
        color: "#1f2937",
    },
    itemCard: {
        borderWidth: 1,
        borderColor: "#f3f4f6",
        borderRadius: 10,
        padding: 12,
        marginBottom: 12,
    },
    productRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    productImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#e5e7eb",
        backgroundColor: "#f3f4f6",
    },
    imagePlaceholder: {
        justifyContent: "center",
        alignItems: "center",
    },
    placeholderText: {
        fontSize: 11,
        color: "#6b7280",
    },
    productDetails: {
        flex: 1,
    },
    productName: {
        fontSize: 15,
        fontWeight: "600",
        color: "#111827",
    },
    itemMeta: {
        marginTop: 5,
        fontSize: 13,
        color: "#6b7280",
    },
    itemPrice: {
        marginTop: 5,
        fontSize: 14,
        fontWeight: "600",
        color: "#1f2937",
    },
    reviewPanel: {
        marginTop: 16,
        padding: 14,
        borderRadius: 10,
        backgroundColor: "#f0fdf4",
    },
    deliveredTitle: {
        fontSize: 14,
        fontWeight: "700",
        color: "#166534",
    },
    reviewSubmitted: {
        marginTop: 12,
    },
    reviewHint: {
        marginTop: 6,
        fontSize: 13,
        color: "#15803d",
        lineHeight: 19,
    },
    starsRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        marginTop: 10,
    },
    displayStar: {
        fontSize: 25,
    },
    inputStar: {
        fontSize: 34,
    },
    starSelected: {
        color: "#facc15",
    },
    starUnselected: {
        color: "#d1d5db",
    },
    reviewComment: {
        marginTop: 8,
        fontSize: 14,
        lineHeight: 20,
        color: "#374151",
    },
    reviewInput: {
        marginTop: 12,
        minHeight: 90,
        borderWidth: 1,
        borderColor: "#d1d5db",
        borderRadius: 8,
        backgroundColor: "#ffffff",
        padding: 12,
        fontSize: 14,
        color: "#111827",
    },
    submitButton: {
        marginTop: 12,
        alignSelf: "flex-start",
        backgroundColor: "#2563eb",
        borderRadius: 8,
        paddingHorizontal: 20,
        paddingVertical: 11,
    },
    submitButtonText: {
        color: "#ffffff",
        fontSize: 14,
        fontWeight: "600",
    },
    disabledButton: {
        opacity: 0.6,
    },
    buttonLoading: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
    },
    orderFooter: {
        borderTopWidth: 1,
        borderTopColor: "#f3f4f6",
        marginTop: 8,
        paddingTop: 16,
        gap: 14,
    },
    statusSection: {
        alignItems: "flex-start",
    },
    statusBadge: {
        overflow: "hidden",
        marginTop: 4,
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 6,
        fontSize: 13,
        fontWeight: "600",
        textTransform: "capitalize",
    },
    deliveredBadge: {
        backgroundColor: "#f0fdf4",
        color: "#15803d",
    },
    otherStatusBadge: {
        backgroundColor: "#eff6ff",
        color: "#1d4ed8",
    },
    cancelButton: {
        marginTop: 12,
        borderWidth: 1,
        borderColor: "#fecaca",
        borderRadius: 8,
        paddingHorizontal: 14,
        paddingVertical: 10,
    },
    cancelButtonText: {
        color: "#dc2626",
        fontSize: 13,
        fontWeight: "600",
    },
    totalText: {
        fontSize: 18,
        fontWeight: "700",
        color: "#111827",
    },
});