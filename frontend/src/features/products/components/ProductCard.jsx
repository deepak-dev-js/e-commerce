import { Link } from "react-router-dom";
import { useCart } from "../../../context/useCart.js";

const ProductCard = ({ product }) => {
  const { addToCart, removeFromCart, isInCart } = useCart();


  const handleAddToCart = () => {
    addToCart(product);
  };

  const handleRemoveFromCart = () => {
    removeFromCart(product._id);
  };

  const added = isInCart(product._id);

  return (

    <Link to={`/product/${product._id}`}>
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white transition-shadow duration-300 hover:shadow-lg">

        <img
          src={product.image}
          alt={product.name}
          className="h-36 w-full object-cover sm:h-56"
        />

        <div className="space-y-2 p-2 sm:space-y-3 sm:p-4">
          {/* Product name and Featured badge */}
          <div className="flex items-start justify-between gap-1 sm:gap-2">
            <h2 className="min-w-0 text-sm font-semibold leading-tight text-gray-800 sm:text-lg">
              {product.name}
            </h2>

            {product.isFeatured && (
              <span className="shrink-0 rounded-full bg-green-100 px-1.5 py-0.5 text-[10px] font-medium text-green-700 sm:px-2 sm:py-1 sm:text-xs">
                Featured
              </span>
            )}
          </div>

          {/* Category and Brand */}
          <div className="flex flex-wrap justify-between gap-x-2 gap-y-1 text-[11px] text-gray-600 sm:text-sm">
            <span className="min-w-0 break-words">
              Category: {product.category}
            </span>

            <span className="min-w-0 break-words">
              Brand: {product.brand}
            </span>
          </div>

          {/* Rating and Stock */}
          <div className="flex flex-wrap items-center justify-between gap-1 text-xs sm:text-sm">
            <span className="text-amber-500">
              ★ {product.rating} ({product.numReviews} reviews)
            </span>

            <span
              className={`font-medium ${product.stock > 0 ? "text-green-600" : "text-red-600"
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
              className={`w-full rounded-lg px-2 py-2 text-xs font-medium text-white transition-colors disabled:cursor-not-allowed disabled:bg-gray-300 sm:w-auto sm:px-4 sm:text-sm ${added
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-black hover:bg-gray-800"
                }`}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();

                if (added) {
                  handleRemoveFromCart();
                } else {
                  handleAddToCart();
                }
              }}
            >
              {product.stock <= 0 && !added
                ? "Out of Stock"
                : added
                  ? "Remove from Cart"
                  : "Add to Cart"}
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;