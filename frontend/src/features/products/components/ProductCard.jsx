import { toast } from "react-toastify";

const ProductCard = ({ product }) => {
  return (
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
            disabled={product.stock <= 0}
            onClick={() => toast.success(`${product.name} added to cart!`)}
            className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;