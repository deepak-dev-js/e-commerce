import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Heart, ArrowLeft } from "lucide-react";
import { useCart } from "../../../context/useCart";
import { fetchCart, removeCartProduct } from "../../../services/cartService";
import {
    getWishlist,
    addToWishlist,
    removeFromWishlist,
} from "../../../services/wishlistService";
import Toast from "../../../components/Toast";

const ProductDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [added, setAdded] = useState(false);

    const [isAuthenticated, setIsAuthenticated] = useState(null);
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [wishlistLoading, setWishlistLoading] = useState(true);
    const [updatingWishlist, setUpdatingWishlist] = useState(false);
    const [toastMessage, setToastMessage] = useState("");

    const showToast = useCallback((message) => {
        setToastMessage(message);
    }, []);

    const closeToast = useCallback(() => {
        setToastMessage("");
    }, []);

    const { addToCart } = useCart();

    // Check authentication and load wishlist
    useEffect(() => {
        let isMounted = true;

        const loadWishlist = async () => {
            setWishlistLoading(true);

            try {
                const response = await fetch(
                    `${import.meta.env.VITE_API_URL}/api/auth/me`,
                    {
                        credentials: "include",
                    }
                );

                if (!response.ok) {
                    if (response.status === 401) {
                        if (isMounted) {
                            setIsAuthenticated(false);
                            setIsWishlisted(false);
                        }
                        return;
                    }

                    throw new Error(
                        `Authentication check failed: ${response.status}`
                    );
                }

                if (isMounted) {
                    setIsAuthenticated(true);
                }

                const wishlist = await getWishlist();

                if (isMounted) {
                    setIsWishlisted(
                        wishlist.some(
                            (item) => String(item._id) === String(id)
                        )
                    );
                }
            } catch (error) {
                console.error("Failed to load wishlist:", error);

                // Do not automatically mark the user logged out
                // for network errors or server errors.
                if (isMounted) {
                    setIsWishlisted(false);
                }
            } finally {
                if (isMounted) {
                    setWishlistLoading(false);
                }
            }
        };

        loadWishlist();

        window.addEventListener("auth-changed", loadWishlist);

        return () => {
            isMounted = false;
            window.removeEventListener("auth-changed", loadWishlist);
        };
    }, [id]);

    // Handle wishlist click
    const handleWishlist = async (event) => {
        event.preventDefault();
        event.stopPropagation();

        if (
            isAuthenticated === null ||
            wishlistLoading ||
            updatingWishlist
        ) {
            return;
        }

        // Redirect unauthenticated users to login
        if (!isAuthenticated) {
            navigate("/login", {
                state: {
                    redirect: location.pathname + location.search,
                    wishlistProductId: id,
                },
            });

            return;
        }

        // Store the previous state
        const previousState = isWishlisted;
        const nextState = !previousState;

        // Update UI immediately
        setIsWishlisted(nextState);
        setUpdatingWishlist(true);

        try {
            if (nextState) {
                await addToWishlist(product._id);
                showToast("Added to wishlist");
            } else {
                await removeFromWishlist(product._id);
                showToast("Removed from wishlist");
            }
        } catch (error) {
            // Revert UI if API fails
            setIsWishlisted(previousState);

            console.error("Failed to update wishlist:", error);
        } finally {
            setUpdatingWishlist(false);
        }
    };

    // Check cart
    useEffect(() => {
        const checkCart = async () => {
            try {
                const data = await fetchCart();

                const isAdded = data.cart.items.some(
                    (item) => String(item.product._id) === String(id)
                );

                setAdded(isAdded);
            } catch (error) {
                console.error("Failed to check cart:", error);
            }
        };

        checkCart();
    }, [id]);

    // Fetch product details
    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await fetch(
                    `${import.meta.env.VITE_API_URL}/api/products/${id}`
                );

                if (!response.ok) {
                    throw new Error("Failed to fetch product details");
                }

                const data = await response.json();

                setProduct(data.product);
            } catch (error) {
                console.error("Product details error:", error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    const handleAddToCart = async () => {
        try {
            await addToCart(product);
            setAdded(true);
        } catch (error) {
            console.error("Failed to add product to cart:", error);
        }
    };

    const handleRemoveFromCart = async () => {
        try {
            await removeCartProduct(product._id);
            setAdded(false);
        } catch (error) {
            console.error("Failed to remove product from cart:", error);
        }
    };

    if (loading) {
        return <p className="p-6 text-center">Loading product...</p>;
    }

    if (error) {
        return <p className="p-6 text-center text-red-600">{error}</p>;
    }

    if (!product) {
        return <p className="p-6 text-center">Product not found.</p>;
    }

    return (
        <div className="mx-auto max-w-6xl px-4 py-4">
            <button
                type="button"
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
            >
                <ArrowLeft size={18} />
                Back
            </button>
            <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-2">
                {/* Product image and wishlist heart */}

                <div className="relative">
                    <img
                        src={product.image}
                        alt={product.name}
                        className="h-96 w-full rounded-xl object-cover"
                    />

                    <button
                        type="button"
                        onClick={handleWishlist}
                        disabled={
                            isAuthenticated === null ||
                            wishlistLoading ||
                            updatingWishlist
                        }
                        aria-label={
                            isWishlisted
                                ? "Remove from wishlist"
                                : "Add to wishlist"
                        }
                        aria-pressed={isWishlisted}
                        className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-md transition-transform hover:scale-110 disabled:cursor-wait"
                    >
                        <Heart
                            size={23}
                            className={
                                isWishlisted
                                    ? "fill-red-500 text-red-500"
                                    : "text-gray-700"
                            }
                        />
                    </button>
                </div>

                {/* Product information */}
                <div className="flex flex-col">
                    {/* Product Name */}
                    <h1 className="text-2xl font-bold leading-snug text-gray-900 sm:text-3xl">
                        {product.name}
                    </h1>

                    {/* Rating and Reviews */}
                    <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                        <div className="flex items-center gap-1 rounded-md bg-green-50 px-2 py-1 font-semibold text-green-700">
                            <span>{product.rating ?? 0}</span>
                            <span>★</span>
                        </div>

                        <span className="text-gray-500">
                            {product.numReviews ?? 0} reviews
                        </span>

                        <span className="text-gray-300">|</span>

                        <span
                            className={`font-medium ${product.stock > 0
                                ? "text-green-600"
                                : "text-red-600"
                                }`}
                        >
                            {product.stock > 0 ? "In Stock" : "Out of Stock"}
                        </span>
                    </div>

                    {/* Price */}
                    <div className="mt-6 border-b border-gray-100 pb-6">
                        <p className="text-sm font-medium text-gray-500">
                            Price
                        </p>

                        <p className="mt-1 text-3xl font-bold tracking-tight text-gray-900">
                            ₹{Number(product.price).toLocaleString("en-IN")}
                        </p>

                        <p className="mt-1 text-sm text-green-700">
                            Inclusive of applicable taxes
                        </p>
                    </div>

                    {/* Description */}
                    <div className="mt-6">
                        <h2 className="text-base font-semibold text-gray-900">
                            Product Description
                        </h2>

                        <p className="mt-2 whitespace-pre-line text-sm leading-7 text-gray-600">
                            {product.description || "No description available."}
                        </p>
                    </div>

                    {/* Category */}
                    <div className="mt-5 flex items-start gap-3 text-sm">
                        <span className="w-24 shrink-0 text-gray-500">
                            Category
                        </span>

                        <span className="font-medium text-gray-800">
                            {product.category}
                        </span>
                    </div>

                    {/* Stock Information */}
                    {product.stock > 0 && product.stock <= 5 && (
                        <p className="mt-4 text-sm font-medium text-orange-600">
                            Only {product.stock} left in stock!
                        </p>
                    )}

                    {/* Cart Actions */}
                    <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                        <button
                            type="button"
                            disabled={product.stock <= 0 && !added}
                            onClick={
                                added
                                    ? handleRemoveFromCart
                                    : handleAddToCart
                            }
                            className={`flex min-h-12 flex-1 items-center justify-center rounded-xl px-6 py-3 font-semibold transition-colors disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-600 bg-black text-white hover:bg-gray-800
                               `}
                        >
                            {product.stock <= 0 && !added
                                ? "Out of Stock"
                                : added
                                    ? "Added"
                                    : "Add to Cart"}
                        </button>
                    </div>
                </div>


            </div>
            <Toast
                message={toastMessage}
                onClose={closeToast}
            />
        </div>

    );
};

export default ProductDetails;