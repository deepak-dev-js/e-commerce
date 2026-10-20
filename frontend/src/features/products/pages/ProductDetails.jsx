import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const ProductDetails = () => {
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-2">
      <img
        src={product.image}
        alt={product.name}
        className="h-96 w-full rounded-xl object-cover"
      />

      <div>
        <h1 className="text-3xl font-bold">{product.name}</h1>

        <p className="mt-4 text-gray-600">{product.description}</p>

        <p className="mt-4 text-2xl font-bold">₹{product.price}</p>

        <p className="mt-3">Category: {product.category}</p>
        <p className="mt-2">Brand: {product.brand}</p>

        <p className="mt-2">
          Rating: {product.rating} ({product.numReviews} reviews)
        </p>

        <p className="mt-2">
          {product.stock > 0
            ? `In Stock: ${product.stock}`
            : "Out of Stock"}
        </p>

        <button
          type="button"
          disabled={product.stock <= 0}
          className="mt-6 rounded-lg bg-black px-6 py-3 font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export default ProductDetails;