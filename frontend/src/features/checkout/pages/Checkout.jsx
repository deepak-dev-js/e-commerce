import { useState } from "react";
import { useCart } from "../../../context/useCart.js";
import ShippingAddress from "../components/ShippingAddress.jsx";
import CheckoutItems from "../components/CheckoutItems.jsx";
import OrderSummary from "../components/OrderSummary.jsx";

const Checkout = () => {
  const { cartItems } = useCart();

  const [shippingAddress, setShippingAddress] = useState({
    fullName: "",
    email: "",
    phone: "",
    addressLine: "",
    city: "",
    state: "",
    pincode: "",
  });

  if (cartItems.length === 0) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900">
          Your cart is empty
        </h1>

        <p className="mt-3 text-gray-600">
          Add products to your cart before proceeding to checkout.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-8 text-3xl font-bold text-gray-900">
        Checkout
      </h1>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <ShippingAddress
            shippingAddress={shippingAddress}
            setShippingAddress={setShippingAddress}
          />

          <CheckoutItems />
        </div>

        <OrderSummary shippingAddress={shippingAddress} />
      </div>
    </main>
  );
};

export default Checkout;