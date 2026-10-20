import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { addProductToCart, fetchCart, removeCartProduct } from "../../../services/cartService";

const ProductCard = ({ product }) => {
  const [added, setAdded] = useState(false);

  const handleAddToCart = async () => {
    try {
      console.log(product)
      await addProductToCart(product._id);
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

  useEffect(() => {
    const checkCart = async () => {
      try {
        const data = await fetchCart();

        const isAdded = data.cart.items.some(
          (item) => item.product._id === product._id
        );

        setAdded(isAdded);
      } catch (error) {
        console.error("Failed to check cart:", error);
      }
    };

    checkCart();
  }, [product._id]);
  return (

    <Link to={`/product/${product._id}`}>
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white transition-shadow duration-300 hover:shadow-lg">

        <img
          src={product.image}
          alt={product.name}
          className="h-56 w-full object-cover"
        />

        <div className="space-y-2 p-4">
          <div className="flex items-start justify-between gap-2">
            <h2 className="text-lg font-semibold text-gray-800">
              {product.name}
            </h2>

            {product.isFeatured && (
              <span className="shrink-0 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                Featured
              </span>
            )}
          </div>

          <p className="line-clamp-2 text-sm text-gray-500">
            {product.description}
          </p>

          <div className="flex justify-between text-sm text-gray-600">
            <span>Category: {product.category}</span>
            <span>Brand: {product.brand}</span>
          </div>

          <div className="flex items-center justify-between text-sm">
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

          <div className="flex items-center justify-between border-t border-gray-100 pt-3">
            <p className="text-xl font-bold text-gray-900">
              ₹{product.price}
            </p>

            <button
              type="button"
              disabled={product.stock <= 0 && !added}
              className={`rounded-lg px-4 py-2 font-medium text-white transition-colors disabled:cursor-not-allowed disabled:bg-gray-300 ${added
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