import { useCallback, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";
import { useCart } from "../../../context/useCart.js";
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
  const { addToCart, isInCart } = useCart();
  const navigate = useNavigate();

  const [updatingWishlist, setUpdatingWishlist] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const showToast = useCallback((message) => {
    setToastMessage(message);
  }, []);

  const closeToast = useCallback(() => {
    setToastMessage("");
  }, []);

  const handleAddToCart = () => {
    addToCart(product);
  };

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

    // Save the previous state in case the API fails
    const previousState = isWishlisted;
    const nextState = !previousState;

    // Update the UI immediately
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
      // Roll back the UI if the API fails
      onWishlistChange(product._id, previousState);

      console.error("Wishlist update failed:", error);

      showToast(
        error instanceof Error
          ? error.message
          : "Could not update wishlist"
      );
    } finally {
      setUpdatingWishlist(false);
    }
  };

  const added = isInCart(product._id);

  return (
    <>
      <Link to={`/product/${product._id}`} className="block">
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white transition-shadow duration-300 hover:shadow-lg">
          {/* Product Image */}
          <div className="relative">
            <img
              src={product.image}
              alt={product.name}
              className="h-36 w-full object-cover sm:h-56"
            />

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

          <div className="space-y-2 p-2 sm:space-y-3 sm:p-4">
            {/* Product Name */}
            <div className="flex items-start justify-between gap-1 sm:gap-2">
              <h2 className="min-w-0 flex-1 truncate text-sm font-semibold leading-tight text-gray-800 sm:text-lg">
                {product.name}
              </h2>
            </div>

            {/* Category */}
            <div className="flex flex-wrap justify-between gap-x-2 gap-y-1 text-[11px] text-gray-600 sm:text-sm">
              <span className="min-w-0 break-words">
                Category: {product.category}
              </span>
            </div>

            {/* Rating and Stock */}
            <div className="flex flex-wrap items-center justify-between gap-1 text-xs sm:text-sm">
              <span className="text-amber-500">
                ★ {product.rating} ({product.numReviews} reviews)
              </span>

              <span
                className={`font-medium ${product.stock > 0
                  ? "text-green-600"
                  : "text-red-600"
                  }`}
              >
                {product.stock > 0 ? "In Stock" : "Out of Stock"}
              </span>
            </div>

            {/* Price and Cart Button */}
            <div className="flex flex-col gap-2 border-t border-gray-100 pt-2 sm:flex-row sm:items-center sm:justify-between sm:pt-3">
              <p className="text-lg font-bold text-gray-900 sm:text-xl">
                ₹{product.price}
              </p>

              <button
                type="button"
                disabled={product.stock <= 0 && !added}
                className={`w-full rounded-lg px-2 py-2 text-xs font-medium text-white transition-colors disabled:cursor-not-allowed disabled:bg-gray-300 sm:w-auto sm:px-4 sm:text-sm bg-black hover:bg-gray-800
                 `}
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  handleAddToCart();
                }}
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
      </Link>

      {/* Reusable Black Toast */}
      <Toast
        message={toastMessage}
        onClose={closeToast}
      />
    </>
  );
};

export default ProductCard;
