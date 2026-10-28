import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
    Heart,
    ArrowLeft,
    ChevronLeft,
    ChevronRight,
    ShoppingCart,
} from "lucide-react";

import { useCart } from "../../../context/useCart";
import {
    getWishlist,
    addToWishlist,
    removeFromWishlist,
} from "../../../services/wishlistService";
import Toast from "../../../components/Toast";


const getDefaultAttributes = (options = []) => {
    return options.reduce((attributes, option) => {
        attributes[option.name] = option.values?.[0] ?? "";
        return attributes;
    }, {});
};

const ProductDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [selectedAttributes, setSelectedAttributes] = useState({});
    const [activeImageIndex, setActiveImageIndex] = useState(0);

    const [isAuthenticated, setIsAuthenticated] = useState(null);
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [wishlistLoading, setWishlistLoading] = useState(true);
    const [updatingWishlist, setUpdatingWishlist] = useState(false);

    const [toastMessage, setToastMessage] = useState("");

    const {
        cartItems,
        addToCart,
        removeFromCart,
    } = useCart();

    const showToast = useCallback((message) => {
        setToastMessage(message);
    }, []);

    const closeToast = useCallback(() => {
        setToastMessage("");
    }, []);

    // --------------------------------------------------
    // Fetch product details
    // --------------------------------------------------

    useEffect(() => {
        let isMounted = true;

        const fetchProduct = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await fetch(
                    `${import.meta.env.VITE_API_URL}/api/products/${id}`
                );

                if (!response.ok) {
                    throw new Error(
                        response.status === 404
                            ? "Product not found."
                            : "Failed to fetch product details."
                    );
                }

                const data = await response.json();

               if (isMounted) {
    setProduct(data.product);

    setSelectedAttributes(
        getDefaultAttributes(data.product.options ?? [])
    );

    setActiveImageIndex(0);
}
            } catch (error) {
                console.error("Product details error:", error);

                if (isMounted) {
                    setError(error.message);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchProduct();

        return () => {
            isMounted = false;
        };
    }, [id]);

    // --------------------------------------------------
    // Check authentication and load wishlist
    // --------------------------------------------------

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

    // --------------------------------------------------
    // Handle wishlist
    // --------------------------------------------------

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

        if (!isAuthenticated) {
            navigate("/login", {
                state: {
                    redirect: location.pathname + location.search,
                    wishlistProductId: id,
                },
            });

            return;
        }

        if (!product) {
            return;
        }

        const previousState = isWishlisted;
        const nextState = !previousState;

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
            setIsWishlisted(previousState);

            console.error("Failed to update wishlist:", error);
            showToast("Failed to update wishlist");
        } finally {
            setUpdatingWishlist(false);
        }
    };

    // --------------------------------------------------
    // Product options and variants
    // --------------------------------------------------

    const options = product?.options ?? [];
    const variants = product?.variants ?? [];

    const getAttributeValue = (variant, optionName) => {
        const attributes = variant?.attributes;

        if (attributes instanceof Map) {
            return attributes.get(optionName);
        }

        return attributes?.[optionName];
    };

    const selectedVariant = useMemo(() => {
        if (!product || variants.length === 0) {
            return null;
        }

        // Products without options can use their first variant.
        if (options.length === 0) {
            return variants[0];
        }

        // Require every option to be selected.
        const allOptionsSelected = options.every(
            (option) =>
                selectedAttributes[option.name] !== undefined &&
                selectedAttributes[option.name] !== ""
        );

        if (!allOptionsSelected) {
            return null;
        }

        return (
            variants.find((variant) =>
                options.every(
                    (option) =>
                        String(
                            getAttributeValue(variant, option.name) ?? ""
                        ) === String(selectedAttributes[option.name])
                )
            ) ?? null
        );
    }, [product, variants, options, selectedAttributes]);

    // --------------------------------------------------
    // Select option buttons
    // --------------------------------------------------

    const handleOptionSelect = (optionName, value) => {
        setSelectedAttributes((previous) => ({
            ...previous,
            [optionName]: value,
        }));

        setActiveImageIndex(0);
    };

    // --------------------------------------------------
    // Product image gallery
    // --------------------------------------------------

    const galleryVariant = selectedVariant ?? variants.find(
        (variant) => variant.images?.length > 0
    );

    const galleryImages = galleryVariant?.images ?? [];

    const nextImage = () => {
        if (galleryImages.length > 1) {
            setActiveImageIndex((previous) =>
                (previous + 1) % galleryImages.length
            );
        }
    };

    const previousImage = () => {
        if (galleryImages.length > 1) {
            setActiveImageIndex((previous) =>
                (previous - 1 + galleryImages.length) %
                galleryImages.length
            );
        }
    };

    // --------------------------------------------------
    // Price and stock
    // --------------------------------------------------

    const prices = variants
        .map((variant) => Number(variant.price))
        .filter((price) => Number.isFinite(price) && price >= 0);

    const minimumPrice = prices.length > 0
        ? Math.min(...prices)
        : null;

    const currentPrice = selectedVariant
        ? Number(selectedVariant.price)
        : minimumPrice;

    const currentStock = selectedVariant
        ? Number(selectedVariant.stock ?? 0)
        : null;

    const hasAvailableStock = variants.some(
        (variant) => Number(variant.stock ?? 0) > 0
    );

    // --------------------------------------------------
    // Cart item identification
    // --------------------------------------------------

    const cartItemId = selectedVariant
        ? `${product?._id}_${selectedVariant._id}`
        : null;

    const added = Boolean(
        cartItemId &&
        cartItems?.some(
            (item) => item.cartItemId === cartItemId
        )
    );

    // --------------------------------------------------
    // Add selected variant to cart
    // --------------------------------------------------

    const handleAddToCart = () => {
        if (!product) {
            return;
        }

        if (options.length > 0 && !selectedVariant) {
            showToast("Please select all product options first");
            return;
        }

        if (!selectedVariant) {
            showToast("No product variant is available");
            return;
        }

        if (Number(selectedVariant.stock) <= 0) {
            showToast("This variant is out of stock");
            return;
        }

        if (added) {
            removeFromCart(cartItemId);
            showToast("Removed from cart");
            return;
        }

        addToCart(product, selectedVariant);
        showToast("Added to cart");
    };

    // --------------------------------------------------
    // Loading and error states
    // --------------------------------------------------

    if (loading) {
        return (
            <div className="p-10 text-center text-gray-600">
                Loading product...
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-10 text-center">
                <p className="text-red-600">{error}</p>

                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="mt-4 rounded-lg bg-black px-5 py-2 text-white"
                >
                    Go Back
                </button>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="p-10 text-center">
                Product not found.
            </div>
        );
    }

    // --------------------------------------------------
    // Product details UI
    // --------------------------------------------------

    return (
        <div className="mx-auto max-w-6xl px-4 py-6">
            {/* Back button */}

            <button
                type="button"
                onClick={() => navigate(-1)}
                className="mb-6 inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
            >
                <ArrowLeft size={18} />
                Back
            </button>

            <div className="grid gap-8 md:grid-cols-2">
                {/* ------------------------------------- */}
                {/* Product image gallery */}
                {/* ------------------------------------- */}

                <div>
                    <div className="relative overflow-hidden rounded-xl border border-gray-100 bg-white">
                        {galleryImages.length > 0 ? (
                            <img
                                src={galleryImages[activeImageIndex]}
                                alt={`${product.name} ${
                                    selectedVariant
                                        ? Object.values(
                                            selectedAttributes
                                        ).join(" ")
                                        : ""
                                }`}
                                className="h-[350px] w-full object-contain p-4 sm:h-[450px]"
                            />
                        ) : (
                            <div className="flex h-[350px] items-center justify-center text-gray-400 sm:h-[450px]">
                                No product image available
                            </div>
                        )}

                        {/* Wishlist heart */}

                        <button
                            type="button"
                            onClick={handleWishlist}
                            disabled={
                                wishlistLoading ||
                                updatingWishlist ||
                                isAuthenticated === null
                            }
                            aria-label={
                                isWishlisted
                                    ? "Remove from wishlist"
                                    : "Add to wishlist"
                            }
                            className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm transition hover:bg-gray-50 disabled:opacity-50"
                        >
                            <Heart
                                size={22}
                                className={
                                    isWishlisted
                                        ? "fill-red-500 text-red-500"
                                        : "text-gray-600"
                                }
                            />
                        </button>

                        {/* Image slider arrows */}

                        {galleryImages.length > 1 && (
                            <>
                                <button
                                    type="button"
                                    onClick={previousImage}
                                    aria-label="Previous product image"
                                    className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm hover:bg-gray-100"
                                >
                                    <ChevronLeft size={22} />
                                </button>

                                <button
                                    type="button"
                                    onClick={nextImage}
                                    aria-label="Next product image"
                                    className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm hover:bg-gray-100"
                                >
                                    <ChevronRight size={22} />
                                </button>

                                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/70 px-3 py-1 text-xs text-white">
                                    {activeImageIndex + 1} / {galleryImages.length}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Image thumbnails */}

                    {galleryImages.length > 1 && (
                        <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
                            {galleryImages.map((image, index) => (
                                <button
                                    key={`${image}-${index}`}
                                    type="button"
                                    onClick={() => setActiveImageIndex(index)}
                                    aria-label={`View product image ${index + 1}`}
                                    className={`shrink-0 overflow-hidden rounded-lg border-2 ${
                                        activeImageIndex === index
                                            ? "border-black"
                                            : "border-gray-200"
                                    }`}
                                >
                                    <img
                                        src={image}
                                        alt={`${product.name} view ${index + 1}`}
                                        className="h-16 w-16 object-contain"
                                    />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* ------------------------------------- */}
                {/* Product information */}
                {/* ------------------------------------- */}

                <div>
                    {/* Product name */}

                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                        {product.name}
                    </h1>

                    {/* Brand */}

                    {product.brand && (
                        <p className="mt-2 text-sm text-gray-500">
                            Brand:{" "}
                            <span className="font-medium text-gray-800">
                                {product.brand}
                            </span>
                        </p>
                    )}

                    {/* Rating */}

                    <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                        <span className="rounded bg-green-700 px-2 py-1 font-semibold text-white">
                            {Number(product.rating ?? 0).toFixed(1)} ★
                        </span>

                        <span className="text-gray-500">
                            {product.numReviews ?? 0} reviews
                        </span>

                        <span className="text-gray-300">|</span>

                        <span className="text-gray-500">
                            {Number(product.purchaseCount ?? 0)} purchases
                        </span>
                    </div>

                    {/* Price */}

                    <div className="mt-6 border-b border-gray-100 pb-5">
                        <p className="text-sm font-medium text-gray-500">
                            Price
                        </p>

                        <p className="mt-1 text-3xl font-bold text-gray-900">
                            {currentPrice !== null
                                ? `₹${currentPrice.toLocaleString("en-IN")}`
                                : "Price unavailable"}
                        </p>

                        {!selectedVariant &&
                            options.length > 0 &&
                            minimumPrice !== null && (
                                <p className="mt-1 text-sm text-gray-500">
                                    Starting price. Select options to see
                                    the exact price.
                                </p>
                            )}

                        <p className="mt-2 text-sm text-green-700">
                            Inclusive of applicable taxes
                        </p>
                    </div>

                    {/* --------------------------------- */}
                    {/* Option buttons: Size, Color, etc. */}
                    {/* --------------------------------- */}

                    {options.map((option) => (
                        <div
                            key={option.name}
                            className="mt-6"
                        >
                            <h2 className="mb-3 text-sm font-semibold text-gray-900">
                                {option.name}:{" "}
                                <span className="font-normal text-gray-600">
                                    {selectedAttributes[option.name] ||
                                        "Select an option"}
                                </span>
                            </h2>

                            <div className="flex flex-wrap gap-2">
                                {option.values.map((value) => {
                                    const isSelected =
                                        selectedAttributes[option.name] ===
                                        value;

                                    return (
                                        <button
                                            key={value}
                                            type="button"
                                            onClick={() =>
                                                handleOptionSelect(
                                                    option.name,
                                                    value
                                                )
                                            }
                                            aria-pressed={isSelected}
                                            className={`min-h-11 min-w-12 rounded-lg border px-4 py-2 text-sm font-medium transition ${
                                                isSelected
                                                    ? "border-black bg-gray-100 text-black ring-1 ring-black"
                                                    : "border-gray-300 bg-white text-gray-700 hover:border-gray-500"
                                            }`}
                                        >
                                            {value}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}

                    {/* --------------------------------- */}
                    {/* Selected variant stock */}
                    {/* --------------------------------- */}

                    <div className="mt-6">
                        {options.length > 0 && !selectedVariant ? (
                            <p className="text-sm text-gray-500">
                                Select all options to check availability.
                            </p>
                        ) : selectedVariant && currentStock > 0 ? (
                            <div>
                                <p className="text-sm font-medium text-green-700">
                                    In Stock
                                </p>

                                {currentStock <= 5 && (
                                    <p className="mt-1 text-sm font-medium text-orange-600">
                                        Only {currentStock} left in stock!
                                    </p>
                                )}
                            </div>
                        ) : selectedVariant && currentStock <= 0 ? (
                            <p className="text-sm font-medium text-red-600">
                                Out of Stock
                            </p>
                        ) : !hasAvailableStock ? (
                            <p className="text-sm font-medium text-red-600">
                                Currently unavailable
                            </p>
                        ) : null}
                    </div>

                    {/* --------------------------------- */}
                    {/* Product description */}
                    {/* --------------------------------- */}

                    <div className="mt-6">
                        <h2 className="text-base font-semibold text-gray-900">
                            Product Description
                        </h2>

                        <p className="mt-2 whitespace-pre-line text-sm leading-7 text-gray-600">
                            {product.description ||
                                "No description available."}
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

                    {/* --------------------------------- */}
                    {/* Add to Cart */}
                    {/* --------------------------------- */}

                    <div className="mt-8">
                        <button
                            type="button"
                            disabled={
                                !selectedVariant ||
                                currentStock <= 0
                            }
                            onClick={handleAddToCart}
                            className={`flex min-h-12 w-full items-center justify-center gap-2 rounded-xl px-6 py-3 font-semibold transition ${
                                added
                                    ? "bg-green-700 text-white hover:bg-green-800"
                                    : "bg-black text-white hover:bg-gray-800"
                            } disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500`}
                        >
                            <ShoppingCart size={19} />

                            {options.length > 0 && !selectedVariant
                                ? "Select Options First"
                                : selectedVariant && currentStock <= 0
                                    ? "Out of Stock"
                                    : added
                                        ? "Remove from Cart"
                                        : "Add to Cart"}
                        </button>

                        {added && (
                            <button
                                type="button"
                                onClick={() => navigate("/cart")}
                                className="mt-3 w-full rounded-xl border border-gray-300 px-6 py-3 font-semibold text-gray-800 transition hover:bg-gray-50"
                            >
                                View Cart
                            </button>
                        )}
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