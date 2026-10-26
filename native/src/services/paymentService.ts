const API_URL = process.env.EXPO_PUBLIC_API_URL;

if (!API_URL) {
  console.warn("EXPO_PUBLIC_API_URL is not configured.");
}

export const createPaymentOrder = async (orderData: {
  items: {
    productId: string;
    quantity: number;
  }[];
  shippingAddress: {
    fullName: string;
    email: string;
    phone: string;
    addressLine: string;
  };
}) => {
  if (!API_URL) {
    throw new Error("Payment API URL is not configured.");
  }

  const response = await fetch(
    `${API_URL}/api/customer/create-payment`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(orderData),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to create payment order."
    );
  }

  return data;
};

export const verifyPayment = async (paymentData: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}) => {
  if (!API_URL) {
    throw new Error("Payment API URL is not configured.");
  }

  const response = await fetch(
    `${API_URL}/api/customer/verify-payment`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(paymentData),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Payment verification failed."
    );
  }

  return data;
};
