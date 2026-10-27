import { useNavigate } from "react-router-dom";
import { useCart } from "../context/useCart.js";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";

const Cart = () => {
  const navigate = useNavigate();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/auth/me`,
          {
            credentials: "include",
          }
        );

        setIsAuthenticated(response.ok);
      } catch (error) {
        console.error("Authentication check failed:", error);
        setIsAuthenticated(false);
      } finally {
        setAuthLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleCheckout = () => {
    if (cartItems.length === 0) return;

    if (authLoading) return;

    if (!isAuthenticated) {
      navigate("/login?redirect=/checkout");
      return;
    }

    navigate("/checkout");
  };


  const { cartItems, updateQuantity, removeFromCart } = useCart();

  const handleQuantityChange = (productId, quantity) => {
    if (quantity < 1) return;

    updateQuantity(productId, quantity);
  };

  const handleRemove = (productId) => {
    removeFromCart(productId);
  };

  const totalPrice = cartItems.reduce(
    (total, item) => total + item.price * (item.quantity || 1),
    0,
  );

  return (
    <div className="min-h-screen bg-gray-50 px-4 my-4 sm:px-6 lg:px-12">
       <button
                type="button"
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
            >
                <ArrowLeft size={18} />
                Back
            </button>
      {" "}
      <div className="mx-auto max-w-6xl">
        {" "}
        <h1 className="mb-2 text-3xl font-bold text-gray-900">
          {" "}
          Shopping Cart{" "}
        </h1>{" "}
        <p className="mb-8 text-gray-500">
          {" "}
          {cartItems.length} {cartItems.length === 1 ? "item" : "items"} in your
          cart{" "}
        </p>{" "}
        {cartItems.length === 0 ? (
          <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
            {" "}
            <p className="mb-4 text-lg text-gray-500">
              {" "}
              Your cart is empty.{" "}
            </p>{" "}
            <a
              href="/collection"
              className="inline-block rounded-lg bg-black px-6 py-3 font-medium text-white transition hover:bg-gray-800"
            >
              {" "}
              Continue Shopping{" "}
            </a>{" "}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {" "}
            {/* Cart Items */}{" "}
            <div className="space-y-4 lg:col-span-2">
              {" "}
              {cartItems.map((item) => {
                const quantity = item.quantity || 1;

                return (
                  <div
                    key={item._id}
                    className="flex flex-col gap-5 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition hover:shadow-md sm:flex-row sm:items-center sm:p-6"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-40 w-full rounded-xl bg-gray-100 object-cover sm:h-32 sm:w-32"
                    />

                    <div className="flex flex-1 flex-col justify-between gap-4 sm:flex-row sm:items-center">
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900">
                          {item.name}
                        </h2>

                        <p className="mt-2 text-lg font-bold text-gray-900">
                          ₹{item.price.toLocaleString("en-IN")}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-4 sm:flex-col sm:items-end">
                        <div className="flex items-center rounded-lg border border-gray-200">
                          <button
                            onClick={() =>
                              handleQuantityChange(item._id, quantity - 1)
                            }
                            disabled={quantity <= 1}
                            className="px-3 py-2 text-lg transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                            aria-label="Decrease quantity"
                          >
                            −
                          </button>

                          <span className="min-w-10 text-center font-medium">
                            {quantity}
                          </span>

                          <button
                            onClick={() =>
                              handleQuantityChange(item._id, quantity + 1)
                            }
                            disabled={quantity >= item.stock}
                            className="px-3 py-2 text-lg transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>

                        <p className="font-semibold text-gray-900">
                          ₹{(item.price * quantity).toLocaleString("en-IN")}
                        </p>

                        <button
                          onClick={() => handleRemove(item._id)}
                          className="text-sm font-medium text-red-500 transition hover:text-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>{" "}
            {/* Order Summary */}{" "}
            <div className="h-fit rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              {" "}
              <h2 className="mb-6 text-xl font-bold text-gray-900">
                {" "}
                Order Summary{" "}
              </h2>{" "}
              <div className="space-y-4 border-b border-gray-100 pb-5">
                {" "}
                <div className="flex justify-between text-gray-600">
                  {" "}
                  <span>Subtotal</span>{" "}
                  <span>₹{totalPrice.toLocaleString("en-IN")}</span>{" "}
                </div>{" "}
                <div className="flex justify-between text-gray-600">
                  {" "}
                  <span>Shipping</span>{" "}
                  <span className="font-medium text-green-600">Free</span>{" "}
                </div>{" "}
              </div>{" "}
              <div className="flex justify-between py-5 text-lg font-bold text-gray-900">
                {" "}
                <span>Total</span>{" "}
                <span>₹{totalPrice.toLocaleString("en-IN")}</span>{" "}
              </div>{" "}
              <button
                onClick={handleCheckout}
                disabled={cartItems.length === 0}
                className="w-full rounded-xl bg-black py-3.5 font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Proceed to Checkout
              </button>
              <a
                href="/collection"
                className="mt-4 block text-center text-sm font-medium text-gray-500 transition hover:text-black"
              >
                {" "}
                Continue Shopping{" "}
              </a>{" "}
            </div>{" "}
          </div>
        )}{" "}
      </div>{" "}
    </div>
  );
};

export default Cart;
