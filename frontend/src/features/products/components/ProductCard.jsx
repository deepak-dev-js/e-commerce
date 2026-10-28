import { useCallback, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";
import {
  addToWishlist,
  removeFromWishlist,
} from "../../../services/wishlistService.js";
import Toast from "../../../components/Toast.jsx";

const ProductCard = ({
  product,
  isWishlisted,
  wishlistLoading,
  isAuthenticated,
  onWishlistChange,
}) => {
  const navigate = useNavigate();

  const [updatingWishlist, setUpdatingWishlist] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const showToast = useCallback((message) => {
    setToastMessage(message);
  }, []);

  const closeToast = useCallback(() => {
    setToastMessage("");
  }, []);

  const variants = product.variants || [];

  const minimumPrice = variants.reduce((minimum, variant) => {
    const price = Number(variant.price);

    if (!Number.isFinite(price) || price < 0) {
      return minimum;
    }

    return minimum === null ? price : Math.min(minimum, price);
  }, null);

  const productImage =
    variants.find((variant) => variant.images?.length > 0)?.images[0] || "";

  const hasStock = variants.some(
    (variant) => Number(variant.stock) > 0,
  );

  const handleWishlist = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (
      wishlistLoading ||
      updatingWishlist ||
      isAuthenticated === null
    ) {
      return;
    }

    if (!isAuthenticated) {
      navigate("/login", {
        state: {
          redirect: window.location.pathname + window.location.search,
          wishlistProductId: product._id,
        },
      });

      return;
    }

    const previousState = isWishlisted;
    const nextState = !previousState;

    onWishlistChange(product._id, nextState);
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
      onWishlistChange(product._id, previousState);

      console.error("Wishlist update failed:", error);

      showToast(
        error instanceof Error
          ? error.message
          : "Could not update wishlist",
      );
    } finally {
      setUpdatingWishlist(false);
    }
  };

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white transition-shadow duration-300 hover:shadow-lg">
        <Link to={`/product/${product._id}`} className="block">
          {/* Product Image */}
          <div className="relative">
            {productImage ? (
              <img
                src={productImage}
                alt={product.name}
                loading="lazy"
                className="h-36 w-full object-cover sm:h-56"
              />
            ) : (
              <div className="flex h-36 w-full items-center justify-center bg-gray-100 text-sm text-gray-500 sm:h-56">
                No image available
              </div>
            )}

            {/* Wishlist Heart */}
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
              className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-md transition-transform hover:scale-110 disabled:cursor-wait"
            >
              <Heart
                size={20}
                className={
                  isWishlisted
                    ? "fill-red-500 text-red-500"
                    : "text-gray-700"
                }
              />
            </button>
          </div>

          {/* Product Details */}
          <div className="space-y-2 p-2 sm:space-y-3 sm:p-4">
            <h2 className="truncate text-sm font-semibold leading-tight text-gray-800 sm:text-lg">
              {product.name}
            </h2>

            <p className="text-xs text-gray-600 sm:text-sm">
              Category: {product.category}
            </p>

            {/* Rating */}
            <div className="flex flex-wrap items-center gap-1 text-xs sm:text-sm">
              <span className="text-amber-500">
                ★ {Number(product.rating || 0).toFixed(1)}
              </span>

              <span className="text-gray-500">
                ({product.numReviews || 0} reviews)
              </span>
            </div>

            {/* Price */}
            <div className="text-lg font-bold text-gray-900 sm:text-xl">
              {minimumPrice !== null
                ? `From ₹${minimumPrice.toLocaleString("en-IN")}`
                : "Price unavailable"}
            </div>
          </div>
        </Link>

        {/* Stock Status and View Product Button */}
        <div className="flex flex-col gap-2 border-t border-gray-100 p-2 sm:flex-row sm:items-center sm:justify-between sm:p-4">
          <span
            className={`text-xs font-medium sm:text-sm ${
              hasStock ? "text-green-600" : "text-red-600"
            }`}
          >
            {hasStock ? "In Stock" : "Out of Stock"}
          </span>

          <Link
            to={`/product/${product._id}`}
            className="w-full rounded-lg bg-black px-3 py-2 text-center text-xs font-medium text-white transition-colors hover:bg-gray-800 sm:w-auto sm:px-4 sm:text-sm"
          >
            View Product
          </Link>
        </div>
      </div>

      <Toast message={toastMessage} onClose={closeToast} />
    </>
  );
};

export default ProductCard;