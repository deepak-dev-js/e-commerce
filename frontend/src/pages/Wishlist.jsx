import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Heart, ShoppingBag, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import {
  getWishlist,
  removeFromWishlist,
} from "../services/wishlistService";
import { useCart } from "../context/useCart";

const Wishlist = () => {
  const navigate = useNavigate();
  const { cartItems } = useCart();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingIds, setRemovingIds] = useState([]);

  // Fetch wishlist
  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const response = await getWishlist();

        const wishlistProducts = Array.isArray(response)
          ? response
          : response?.wishlist || response?.products || [];

        setProducts(wishlistProducts);
      } catch (error) {
        console.error("Failed to fetch wishlist:", error);
        toast.error("Failed to load wishlist.");
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, []);

  // Remove product from wishlist
  const handleRemove = async (productId) => {
    if (removingIds.includes(productId)) {
      return;
    }

    const previousProducts = products;

    setProducts((current) =>
      current.filter((product) => product._id !== productId),
    );

    setRemovingIds((current) => [...current, productId]);

    try {
      await removeFromWishlist(productId);
      toast.success("Removed from wishlist");
    } catch (error) {
      console.error("Failed to remove wishlist product:", error);

      setProducts(previousProducts);
      toast.error("Could not remove product. Please try again.");
    } finally {
      setRemovingIds((current) =>
        current.filter((id) => id !== productId),
      );
    }
  };

  // Get the minimum price among variants
  const getMinimumPrice = (product) => {
    const prices = (product.variants || [])
      .map((variant) => Number(variant.price))
      .filter((price) => Number.isFinite(price) && price >= 0);

    return prices.length ? Math.min(...prices) : null;
  };

  // Get the first available variant image
  const getProductImage = (product) => {
    return (
      product.variants?.find(
        (variant) => variant.images?.length > 0,
      )?.images[0] || ""
    );
  };

  // Check whether a variant is already in the cart
  const isProductInCart = (productId) => {
    return cartItems.some((item) => item._id === productId);
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-red-500" />
      </div>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Back button */}
      <div className="mb-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
        >
          <ArrowLeft size={18} />
          Back
        </button>
      </div>

      {/* Wishlist heading */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          My Wishlist
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          {products.length}{" "}
          {products.length === 1 ? "product" : "products"} saved
        </p>
      </div>

      {/* Empty wishlist */}
      {products.length === 0 ? (
        <div className="flex min-h-[45vh] flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 px-4 text-center">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
            <Heart size={36} className="text-gray-400" />
          </div>

          <h2 className="text-xl font-semibold text-gray-800">
            Your wishlist is empty
          </h2>

          <p className="mt-2 max-w-sm text-sm text-gray-500">
            Save your favourite products by clicking the heart icon.
            They will appear here.
          </p>

          <button
            type="button"
            onClick={() => navigate("/")}
            className="mt-6 rounded-lg bg-red-500 px-6 py-3 font-medium text-white transition hover:bg-red-600"
          >
            Continue Shopping
          </button>
        </div>
      ) : (
        /* Wishlist products */
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
          {products.map((product) => {
            const minimumPrice = getMinimumPrice(product);
            const productImage = getProductImage(product);
            const inCart = isProductInCart(product._id);

            return (
              <article
                key={product._id}
                className="group overflow-hidden rounded-xl border border-gray-200 bg-white transition hover:shadow-lg"
              >
                {/* Product image */}
                <div className="relative aspect-square overflow-hidden bg-gray-50">
                  <button
                    type="button"
                    onClick={() =>
                      navigate(`/product/${product._id}`)
                    }
                    className="h-full w-full"
                    aria-label={`View ${product.name}`}
                  >
                    {productImage ? (
                      <img
                        src={productImage}
                        alt={product.name}
                        loading="lazy"
                        className="h-full w-full object-contain p-3 transition duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-gray-400">
                        No image available
                      </div>
                    )}
                  </button>

                  {/* Remove from wishlist */}
                  <button
                    type="button"
                    onClick={() => handleRemove(product._id)}
                    disabled={removingIds.includes(product._id)}
                    aria-label="Remove from wishlist"
                    className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow transition hover:bg-red-50 disabled:opacity-50"
                  >
                    <Trash2 size={17} className="text-red-500" />
                  </button>
                </div>

                {/* Product details */}
                <div className="p-3 sm:p-4">
                  <button
                    type="button"
                    onClick={() =>
                      navigate(`/product/${product._id}`)
                    }
                    className="block w-full text-left"
                  >
                    <h2 className="truncate text-sm font-semibold text-gray-800 sm:text-base">
                      {product.name}
                    </h2>
                  </button>

                  <p className="mt-1 truncate text-xs text-gray-500">
                    {product.category || "General"}
                  </p>

                  {/* Minimum variant price */}
                  <p className="mt-2 text-lg font-bold text-gray-900">
                    {minimumPrice !== null
                      ? `From ₹${minimumPrice.toLocaleString("en-IN")}`
                      : "Price unavailable"}
                  </p>

                  {/* View product */}
                  <button
                    type="button"
                    onClick={() =>
                      navigate(`/product/${product._id}`)
                    }
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-gray-900 px-3 py-2.5 text-sm font-medium text-white transition hover:bg-gray-700"
                  >
                    <ShoppingBag size={17} />
                    {inCart ? "View Cart" : "View Product"}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Bottom navigation */}
      <div className="mt-10 flex flex-col justify-center gap-3 border-t border-gray-200 pt-6 sm:flex-row">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="rounded-lg border border-gray-300 px-6 py-3 font-medium text-gray-700 transition hover:bg-gray-100"
        >
          Continue Shopping
        </button>

        <button
          type="button"
          onClick={() => navigate("/cart")}
          className="flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-6 py-3 font-medium text-white transition hover:bg-gray-700"
        >
          <ShoppingBag size={18} />
          Go to Cart
        </button>
      </div>
    </main>
  );
};

export default Wishlist;