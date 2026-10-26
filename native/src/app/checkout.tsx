import { useState } from "react";
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    Pressable,
    View,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
// @ts-ignore react-native-razorpay does not provide TypeScript declarations.
import RazorpayCheckout from "react-native-razorpay";
import { useCart } from "@/context/CartContext";
import { createPaymentOrder, verifyPayment } from "@/services/paymentService";

type ShippingAddressType = {
    fullName: string;
    email: string;
    phone: string;
    addressLine: string;
};

export default function CheckoutScreen() {
    const router = useRouter();
    const { cartItems } = useCart();
    const [loading, setLoading] = useState(false);

    const [shippingAddress, setShippingAddress] =
        useState<ShippingAddressType>({
            fullName: "",
            email: "",
            phone: "",
            addressLine: "",
        });

    const subtotal = cartItems.reduce(
        (total, item) =>
            total + item.price * (item.quantity || 1),
        0
    );

    const shipping: number = 0;
    const total = subtotal + shipping;

    const handleChange = (
        name: keyof ShippingAddressType,
        value: string
    ) => {
        setShippingAddress((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleContinueToPayment = () => {
        const { fullName, email, phone, addressLine } =
            shippingAddress;

        if (
            !fullName.trim() ||
            !email.trim() ||
            !phone.trim() ||
            !addressLine.trim()
        ) {
            Alert.alert(
                "Missing Information",
                "Please fill in all shipping address fields."
            );
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            Alert.alert(
                "Invalid Email",
                "Please enter a valid email address."
            );
            return;
        }

        if (!/^[0-9]{10}$/.test(phone)) {
            Alert.alert(
                "Invalid Phone Number",
                "Please enter a valid 10-digit mobile number."
            );
            return;
        }

        if (cartItems.length === 0) {
            Alert.alert(
                "Empty Cart",
                "Add products to your cart before checking out."
            );
            return;
        }

        // Payment integration will be connected here.
        Alert.alert(
            "Checkout",
            "Shipping details are valid. Connect the native Razorpay payment flow next."
        );
    };

    if (cartItems.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Ionicons
                    name="cart-outline"
                    size={60}
                    color="#9ca3af"
                />

                <Text style={styles.emptyTitle}>
                    Your cart is empty
                </Text>

                <Text style={styles.emptyDescription}>
                    Add products to your cart before proceeding to checkout.
                </Text>

                <Pressable
                    style={styles.shopButton}
                    onPress={() => router.replace("/")}
                >
                    <Text style={styles.shopButtonText}>
                        Continue Shopping
                    </Text>
                </Pressable>
            </View>
        );
    }

    const handleCheckout = async () => {
        if (cartItems.length === 0) {
            Alert.alert("Empty Cart", "Your cart is empty.");
            return;
        }

        const { fullName, email, phone, addressLine } =
            shippingAddress;

        if (
            !fullName.trim() ||
            !email.trim() ||
            !phone.trim() ||
            !addressLine.trim()
        ) {
            Alert.alert(
                "Missing Information",
                "Please complete your shipping address."
            );
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            Alert.alert("Invalid Email", "Enter a valid email address.");
            return;
        }

        if (!/^[0-9]{10}$/.test(phone)) {
            Alert.alert(
                "Invalid Phone Number",
                "Enter a valid 10-digit mobile number."
            );
            return;
        }

        setLoading(true);

        console.log("cartItems: ",cartItems)

        try {
            // 1. Create the payment order on your backend.
            const orderData = await createPaymentOrder({
                items: cartItems.map((item: any) => ({
                    productId: item.productId,
                    quantity: item.quantity || 1,
                })),
                shippingAddress,
            });

            console.log("orderData: ",orderData)

            // 2. Open native Razorpay Checkout.
            const paymentResponse = await RazorpayCheckout.open({
                key: orderData.keyId,
                amount: orderData.amount,
                currency: orderData.currency,
                name: "ApnaShop",
                description: "Purchase Payment",
                order_id: orderData.orderId,
                prefill: {
                    name: shippingAddress.fullName,
                    email: shippingAddress.email,
                    contact: shippingAddress.phone,
                },
                theme: {
                    color: "#111827",
                },
            });

            // 3. Verify the payment with your backend.
            const verification = await verifyPayment({
                razorpay_order_id: paymentResponse.razorpay_order_id,
                razorpay_payment_id: paymentResponse.razorpay_payment_id,
                razorpay_signature: paymentResponse.razorpay_signature,
            });

            if (verification.paymentStatus !== "paid") {
                throw new Error("Payment could not be verified.");
            }

            // 4. Navigate to the success screen.
            router.replace(
                `/order-success/${verification.orderId}` as never
            );
        } catch (error: unknown) {
            console.error("Checkout failed:", error);

            const message =
                error instanceof Error
                    ? error.message
                    : "Unable to complete payment. Please try again.";

            Alert.alert("Checkout Failed", message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
        >
            <Text style={styles.pageTitle}>Checkout</Text>

            {/* Shipping Address */}
            <View style={styles.card}>
                <View style={styles.sectionHeading}>
                    <Ionicons
                        name="location-outline"
                        size={22}
                        color="#111827"
                    />

                    <Text style={styles.sectionTitle}>
                        Shipping Address
                    </Text>
                </View>

                <Text style={styles.label}>Full Name</Text>

                <TextInput
                    style={styles.input}
                    placeholder="Enter your full name"
                    value={shippingAddress.fullName}
                    onChangeText={(value) =>
                        handleChange("fullName", value)
                    }
                    autoComplete="name"
                    autoCapitalize="words"
                />

                <Text style={styles.label}>Email Address</Text>

                <TextInput
                    style={styles.input}
                    placeholder="Enter your email"
                    value={shippingAddress.email}
                    onChangeText={(value) =>
                        handleChange("email", value)
                    }
                    keyboardType="email-address"
                    autoComplete="email"
                    autoCapitalize="none"
                />

                <Text style={styles.label}>Phone Number</Text>

                <TextInput
                    style={styles.input}
                    placeholder="10-digit mobile number"
                    value={shippingAddress.phone}
                    onChangeText={(value) =>
                        handleChange(
                            "phone",
                            value.replace(/\D/g, "").slice(0, 10)
                        )
                    }
                    keyboardType="phone-pad"
                    maxLength={10}
                />

                <Text style={styles.label}>Street Address</Text>

                <TextInput
                    style={[styles.input, styles.addressInput]}
                    placeholder="House number, street, area"
                    value={shippingAddress.addressLine}
                    onChangeText={(value) =>
                        handleChange("addressLine", value)
                    }
                    multiline
                    textAlignVertical="top"
                    autoComplete="street-address"
                />
            </View>

            {/* Order Items */}
            <View style={styles.card}>
                <Text style={styles.sectionTitle}>
                    Order Items ({cartItems.length})
                </Text>

                {cartItems.map((item: any) => {
                    const quantity = item.quantity || 1;

                    return (
                        <View
                            key={item._id}
                            style={styles.orderItem}
                        >
                            <View style={styles.productDetails}>
                                <Text style={styles.productName}>
                                    {item.name}
                                </Text>

                                <Text style={styles.quantity}>
                                    Quantity: {quantity}
                                </Text>
                            </View>

                            <Text style={styles.itemPrice}>
                                ₹
                                {(item.price * quantity).toLocaleString(
                                    "en-IN"
                                )}
                            </Text>
                        </View>
                    );
                })}
            </View>

            {/* Order Summary */}
            <View style={styles.card}>
                <Text style={styles.sectionTitle}>
                    Order Summary
                </Text>

                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>
                        Subtotal
                    </Text>

                    <Text style={styles.summaryValue}>
                        ₹{subtotal.toLocaleString("en-IN")}
                    </Text>
                </View>

                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>
                        Shipping
                    </Text>

                    <Text style={styles.summaryValue}>
                        {shipping === 0
                            ? "Free"
                            : `₹${shipping.toLocaleString("en-IN")}`}
                    </Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.summaryRow}>
                    <Text style={styles.totalLabel}>Total</Text>

                    <Text style={styles.totalValue}>
                        ₹{total.toLocaleString("en-IN")}
                    </Text>
                </View>


                <Pressable
                    style={[
                        styles.checkoutButton,
                        loading && { opacity: 0.6 },
                    ]}
                    onPress={handleCheckout}
                    disabled={loading}
                >
                    <Text style={styles.checkoutButtonText}>
                        {loading ? "Processing..." : "Continue to Payment"}
                    </Text>

                    {!loading && (
                        <Ionicons
                            name="arrow-forward"
                            size={20}
                            color="#ffffff"
                        />
                    )}
                </Pressable>



                <Text style={styles.paymentNote}>
                    Your payment will be processed securely through
                    Razorpay.
                </Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f9fafb",
    },
    content: {
        padding: 16,
        paddingBottom: 32,
    },
    pageTitle: {
        fontSize: 28,
        fontWeight: "700",
        color: "#111827",
        marginBottom: 20,
    },
    card: {
        backgroundColor: "#ffffff",
        borderRadius: 16,
        padding: 18,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: "#f3f4f6",
    },
    sectionHeading: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 19,
        fontWeight: "700",
        color: "#111827",
        marginBottom: 18,
    },
    label: {
        fontSize: 14,
        fontWeight: "600",
        color: "#374151",
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: "#d1d5db",
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 15,
        color: "#111827",
        marginBottom: 16,
        backgroundColor: "#ffffff",
    },
    addressInput: {
        minHeight: 90,
    },
    orderItem: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: "#f3f4f6",
    },
    productDetails: {
        flex: 1,
    },
    productName: {
        fontSize: 15,
        fontWeight: "600",
        color: "#111827",
    },
    quantity: {
        fontSize: 13,
        color: "#6b7280",
        marginTop: 6,
    },
    itemPrice: {
        fontSize: 15,
        fontWeight: "700",
        color: "#111827",
    },
    summaryRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },
    summaryLabel: {
        fontSize: 15,
        color: "#6b7280",
    },
    summaryValue: {
        fontSize: 15,
        color: "#374151",
        fontWeight: "500",
    },
    divider: {
        borderTopWidth: 1,
        borderTopColor: "#e5e7eb",
        marginVertical: 6,
    },
    totalLabel: {
        fontSize: 17,
        fontWeight: "700",
        color: "#111827",
    },
    totalValue: {
        fontSize: 20,
        fontWeight: "700",
        color: "#111827",
    },
    checkoutButton: {
        backgroundColor: "#111827",
        borderRadius: 12,
        paddingVertical: 15,
        paddingHorizontal: 16,
        marginTop: 12,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 10,
    },
    checkoutButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#ffffff",
    },
    paymentNote: {
        fontSize: 12,
        color: "#6b7280",
        textAlign: "center",
        lineHeight: 18,
        marginTop: 14,
    },
    emptyContainer: {
        flex: 1,
        backgroundColor: "#ffffff",
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
    },
    emptyTitle: {
        fontSize: 23,
        fontWeight: "700",
        color: "#111827",
        marginTop: 16,
    },
    emptyDescription: {
        fontSize: 15,
        color: "#6b7280",
        textAlign: "center",
        marginTop: 8,
        lineHeight: 22,
    },
    shopButton: {
        backgroundColor: "#111827",
        paddingHorizontal: 24,
        paddingVertical: 13,
        borderRadius: 10,
        marginTop: 24,
    },
    shopButtonText: {
        color: "#ffffff",
        fontSize: 15,
        fontWeight: "600",
    },
});