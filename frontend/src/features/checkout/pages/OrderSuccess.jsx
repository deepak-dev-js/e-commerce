import { Link, useParams } from "react-router-dom";

const OrderSuccess = () => {
  const { orderId } = useParams();

  return (
    <main className="mx-auto max-w-xl px-4 py-20 text-center">
      <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl text-green-700">
          ✓
        </div>

        <h1 className="mt-6 text-2xl font-bold text-gray-900">
          Payment Verified!
        </h1>

        <p className="mt-3 text-gray-600">
          Your payment has been verified successfully.
        </p>

        <p className="mt-4 break-all text-sm text-gray-500">
          Order ID: {orderId}
        </p>

        <Link
          to="/"
          className="mt-8 inline-block rounded-xl bg-black px-6 py-3 font-semibold text-white hover:bg-gray-800"
        >
          Continue Shopping
        </Link>
      </div>
    </main>
  );
};

export default OrderSuccess;