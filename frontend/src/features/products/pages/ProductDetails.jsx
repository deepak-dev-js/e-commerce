import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useCart } from "../../../context/useCart";
import { fetchCart, removeCartProduct } from "../../../services/cartService";

const ProductDetails = () => {
    const { id } = useParams();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [added, setAdded] = useState(false);

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

    useEffect(() => {
        const checkCart = async () => {
            try {
                const data = await fetchCart();

                const isAdded = data.cart.items.some(
                    (item) => item.product._id === id
                );

                setAdded(isAdded);
            } catch (error) {
                console.error("Failed to check cart:", error);
            }
        };

        checkCart();
    }, [id]);

    const { addToCart } = useCart();


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
                    disabled={product.stock <= 0 && !added}
                    className={`mt-6 rounded-lg px-6 py-3 font-medium text-white transition-colors disabled:cursor-not-allowed disabled:bg-gray-300 ${added
                            ? "bg-red-600 hover:bg-red-700"
                            : "bg-black hover:bg-gray-800"
                        }`}
                    onClick={added ? handleRemoveFromCart : handleAddToCart}
                >
                    {product.stock <= 0 && !added
                        ? "Out of Stock"
                        : added
                            ? "Remove from Cart"
                            : "Add to Cart"}
                </button>
            </div>
        </div>
    );
};

export default ProductDetails;