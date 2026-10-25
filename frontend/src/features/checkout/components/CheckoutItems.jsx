import { useCart } from "../../../context/useCart.js";

const CheckoutItems = () => {
  const { cartItems } = useCart();

  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <h2 className="mb-6 text-xl font-semibold text-gray-900">
        Order Items ({cartItems.length})
      </h2>

      {cartItems.length === 0 ? (
        <p className="text-gray-500">Your cart is empty.</p>
      ) : (
        <div className="space-y-5">
          {cartItems.map((item) => {
            const quantity = item.quantity || 1;

            return (
              <div
                key={item._id}
                className="flex gap-4 border-b border-gray-100 pb-5 last:border-0 last:pb-0"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-20 w-20 rounded-xl bg-gray-50 object-contain"
                />

                <div className="min-w-0 flex-1">
                  <h3 className="font-medium text-gray-900">{item.name}</h3>


                  <p className="mt-2 text-sm text-gray-600">
                    Quantity: {quantity}
                  </p>
                </div>

                <p className="font-semibold text-gray-900">
                  ₹{(item.price * quantity).toLocaleString("en-IN")}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default CheckoutItems;