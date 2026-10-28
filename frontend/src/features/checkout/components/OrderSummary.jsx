import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../../context/useCart.js";
import {
  createPaymentOrder,
  verifyPayment,
} from "../services/paymentService.js";

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");

    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;

    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);

    document.body.appendChild(script);
  });
};

const OrderSummary = ({ shippingAddress }) => {
  const { cartItems, setCartItems } = useCart();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const subtotal = cartItems.reduce(
    (total, item) => total + item.price * (item.quantity || 1),
    0
  );

  // This example offers free shipping.
  const shipping = 0;

  const total = subtotal + shipping;

  const handleCheckout = async () => {
    setErrorMessage("");

    if (cartItems.length === 0) {
      setErrorMessage("Your cart is empty.");
      return;
    }

    const addressForm = document.getElementById("shipping-address-form");

    if (!addressForm || !addressForm.reportValidity()) {
      return;
    }

    setLoading(true);

    try {
      const scriptLoaded = await loadRazorpayScript();

      if (!scriptLoaded) {
        throw new Error("Unable to load Razorpay Checkout. Please try again.");
      }

      // Send only product IDs and quantities.
      // The backend calculates prices from MongoDB.
      const orderData = await createPaymentOrder({
        items: cartItems.map((item) => ({
          productId: item._id,
          variantId: item.variantId,
          quantity: item.quantity || 1,
        })),
        shippingAddress,
      });

      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "ApnaShop",
        description: "Purchase Payment",
        order_id: orderData.orderId,

        handler: async (response) => {
          try {
            setLoading(true);

            const verification = await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verification.paymentStatus !== "paid") {
              throw new Error("Payment could not be verified.");
            }

            setCartItems([]);

            navigate(`/order-success/${verification.orderId}`, {
              replace: true,
            });
          } catch (error) {
            console.error("Payment verification failed:", error);

            setErrorMessage(
              "We could not confirm your payment. Please check your orders before trying again."
            );
          } finally {
            setLoading(false);
          }
        },

        modal: {
          ondismiss: () => {
            setLoading(false);
          },
        },

        prefill: {
          name: shippingAddress.fullName,
          email: shippingAddress.email,
          contact: shippingAddress.phone,
        },

        theme: {
          color: "#111827",
        },
      };

      const razorpay = new window.Razorpay(options);

      razorpay.on("payment.failed", (response) => {
        console.error("Razorpay payment failed:", response);

        setErrorMessage(
          response.error.description || "Payment failed. Please try again."
        );

        setLoading(false);
      });

      razorpay.open();
    } catch (error) {
      console.error("Checkout failed:", error);

      setErrorMessage(
        error.message || "Unable to start payment. Please try again."
      );

      setLoading(false);
    }
  };

  return (
    <section className="h-fit rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <h2 className="mb-6 text-xl font-semibold text-gray-900">
        Order Summary
      </h2>

      <div className="space-y-4">
        <div className="flex justify-between text-gray-600">
          <span>Subtotal</span>
          <span>₹{subtotal.toLocaleString("en-IN")}</span>
        </div>

        <div className="flex justify-between text-gray-600">
          <span>Shipping</span>
          <span>{shipping === 0 ? "Free" : `₹${shipping}`}</span>
        </div>

        <div className="border-t border-gray-200 pt-4">
          <div className="flex justify-between text-lg font-semibold text-gray-900">
            <span>Total</span>
            <span>₹{total.toLocaleString("en-IN")}</span>
          </div>
        </div>
      </div>

      {errorMessage && (
        <p
          role="alert"
          className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700"
        >
          {errorMessage}
        </p>
      )}

      <button
        type="button"
        onClick={handleCheckout}
        disabled={loading || cartItems.length === 0}
        className="mt-6 w-full rounded-xl bg-black px-5 py-3 font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Processing..." : "Continue to Payment"}
      </button>

      <p className="mt-4 text-center text-xs text-gray-500">
        Your payment will be processed securely through Razorpay.
      </p>
    </section>
  );
};

export default OrderSummary;