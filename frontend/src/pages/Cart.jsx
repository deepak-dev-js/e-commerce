import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ShoppingCart, Trash2 } from "lucide-react";
import { useCart } from "../context/useCart.js";

const Cart = () => {
    const navigate = useNavigate();

    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [authLoading, setAuthLoading] = useState(true);

    const {
        cartItems,
        updateQuantity,
        removeFromCart,
    } = useCart();

    // Check authentication
    useEffect(() => {
        let isMounted = true;

        const checkAuth = async () => {
            try {
                const response = await fetch(
                    `${import.meta.env.VITE_API_URL}/api/auth/me`,
                    {
                        credentials: "include",
                    }
                );

                if (isMounted) {
                    setIsAuthenticated(response.ok);
                }
            } catch (error) {
                console.error("Authentication check failed:", error);

                if (isMounted) {
                    setIsAuthenticated(false);
                }
            } finally {
                if (isMounted) {
                    setAuthLoading(false);
                }
            }
        };

        checkAuth();

        return () => {
            isMounted = false;
        };
    }, []);

    // Proceed to checkout
    const handleCheckout = () => {
        if (cartItems.length === 0 || authLoading) {
            return;
        }

        if (!isAuthenticated) {
            navigate("/login?redirect=/checkout");
            return;
        }

        navigate("/checkout");
    };

    // Update quantity using the unique cart item ID
    const handleQuantityChange = (cartItemId, quantity, stock) => {
        if (quantity < 1 || quantity > stock) {
            return;
        }

        updateQuantity(cartItemId, quantity);
    };

    // Remove an item from the cart
    const handleRemove = (cartItemId) => {
        removeFromCart(cartItemId);
    };

    // Calculate subtotal
    const totalPrice = cartItems.reduce((total, item) => {
        return total + Number(item.price || 0) * (item.quantity || 1);
    }, 0);

    // Format currency
    const formatPrice = (price) =>
        Number(price || 0).toLocaleString("en-IN");

    // Get variant attributes
    const getAttributes = (item) => {
        const attributes = item.attributes;

        if (!attributes) {
            return [];
        }

        if (attributes instanceof Map) {
            return Array.from(attributes.entries());
        }

        return Object.entries(attributes);
    };

    // Get selected variant image, with fallback
    const getProductImage = (item) => {
        if (item.images?.length > 0) {
            return item.images[0];
        }

        if (item.image) {
            return item.image;
        }

        return "";
    };

    return (
        <div className="my-4 min-h-screen bg-gray-50 px-4 sm:px-6 lg:px-12">
            {/* Back button */}
            <button
                type="button"
                onClick={() => navigate(-1)}
                className="mb-6 inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
            >
                <ArrowLeft size={18} />
                Back
            </button>

            <div className="mx-auto max-w-6xl">
                <h1 className="mb-2 text-3xl font-bold text-gray-900">
                    Shopping Cart
                </h1>

                <p className="mb-8 text-gray-500">
                    {cartItems.length}{" "}
                    {cartItems.length === 1 ? "item" : "items"} in your cart
                </p>

                {cartItems.length === 0 ? (
                    <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
                        <ShoppingCart
                            size={48}
                            className="mx-auto mb-4 text-gray-300"
                        />

                        <p className="mb-4 text-lg text-gray-500">
                            Your cart is empty.
                        </p>

                        <button
                            type="button"
                            onClick={() => navigate("/collection")}
                            className="rounded-lg bg-black px-6 py-3 font-medium text-white transition hover:bg-gray-800"
                        >
                            Continue Shopping
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                        {/* Cart items */}
                        <div className="space-y-4 lg:col-span-2">
                            {cartItems.map((item) => {
                                const quantity = item.quantity || 1;

                                const cartItemId =
                                    item.cartItemId || item._id;

                                const stock = Number(item.stock ?? 0);

                                const image = getProductImage(item);

                                const attributes = getAttributes(item);

                                return (
                                    <div
                                        key={cartItemId}
                                        className="flex flex-col gap-5 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition hover:shadow-md sm:flex-row sm:items-center sm:p-6"
                                    >
                                        {/* Product image */}
                                        {image ? (
                                            <img
                                                src={image}
                                                alt={item.name}
                                                className="h-40 w-full rounded-xl bg-gray-100 object-contain sm:h-32 sm:w-32"
                                            />
                                        ) : (
                                            <div className="flex h-40 w-full items-center justify-center rounded-xl bg-gray-100 text-sm text-gray-400 sm:h-32 sm:w-32">
                                                No image
                                            </div>
                                        )}

                                        <div className="flex flex-1 flex-col justify-between gap-4 sm:flex-row sm:items-center">
                                            <div>
                                                <h2 className="text-lg font-semibold text-gray-900">
                                                    {item.name}
                                                </h2>

                                                {/* Selected variant */}
                                                {attributes.length > 0 && (
                                                    <div className="mt-2 flex flex-wrap gap-2">
                                                        {attributes.map(
                                                            ([name, value]) => (
                                                                <span
                                                                    key={name}
                                                                    className="rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-600"
                                                                >
                                                                    {name}:{" "}
                                                                    {value}
                                                                </span>
                                                            )
                                                        )}
                                                    </div>
                                                )}

                                                <p className="mt-2 text-lg font-bold text-gray-900">
                                                    ₹{formatPrice(item.price)}
                                                </p>

                                                <p className="mt-1 text-xs text-gray-500">
                                                    {stock > 0
                                                        ? `${stock} available`
                                                        : "Stock unavailable"}
                                                </p>
                                            </div>

                                            <div className="flex flex-wrap items-center justify-between gap-4 sm:flex-col sm:items-end">
                                                {/* Quantity controls */}
                                                <div className="flex items-center rounded-lg border border-gray-200">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleQuantityChange(
                                                                cartItemId,
                                                                quantity - 1,
                                                                stock
                                                            )
                                                        }
                                                        disabled={quantity <= 1}
                                                        className="px-3 py-2 text-lg transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                                                        aria-label="Decrease quantity"
                                                    >
                                                        −
                                                    </button>

                                                    <span className="min-w-10 text-center font-medium">
                                                        {quantity}
                                                    </span>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleQuantityChange(
                                                                cartItemId,
                                                                quantity + 1,
                                                                stock
                                                            )
                                                        }
                                                        disabled={
                                                            quantity >= stock
                                                        }
                                                        className="px-3 py-2 text-lg transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                                                        aria-label="Increase quantity"
                                                    >
                                                        +
                                                    </button>
                                                </div>

                                                {/* Item subtotal */}
                                                <p className="font-semibold text-gray-900">
                                                    ₹
                                                    {formatPrice(
                                                        Number(item.price || 0) *
                                                            quantity
                                                    )}
                                                </p>

                                                {/* Remove item */}
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleRemove(cartItemId)
                                                    }
                                                    className="inline-flex items-center gap-1 text-sm font-medium text-red-500 transition hover:text-red-700"
                                                >
                                                    <Trash2 size={15} />
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Order summary */}
                        <div className="h-fit rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                            <h2 className="mb-6 text-xl font-bold text-gray-900">
                                Order Summary
                            </h2>

                            <div className="space-y-4 border-b border-gray-100 pb-5">
                                <div className="flex justify-between text-gray-600">
                                    <span>
                                        Subtotal ({cartItems.length} items)
                                    </span>

                                    <span>
                                        ₹{formatPrice(totalPrice)}
                                    </span>
                                </div>

                                <div className="flex justify-between text-gray-600">
                                    <span>Shipping</span>

                                    <span className="font-medium text-green-600">
                                        Free
                                    </span>
                                </div>
                            </div>

                            <div className="flex justify-between py-5 text-lg font-bold text-gray-900">
                                <span>Total</span>

                                <span>
                                    ₹{formatPrice(totalPrice)}
                                </span>
                            </div>

                            <button
                                type="button"
                                onClick={handleCheckout}
                                disabled={
                                    cartItems.length === 0 || authLoading
                                }
                                className="w-full rounded-xl bg-black py-3.5 font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {authLoading
                                    ? "Checking login..."
                                    : "Proceed to Checkout"}
                            </button>

                            <button
                                type="button"
                                onClick={() => navigate("/collection")}
                                className="mt-4 block w-full text-center text-sm font-medium text-gray-500 transition hover:text-black"
                            >
                                Continue Shopping
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Cart;
