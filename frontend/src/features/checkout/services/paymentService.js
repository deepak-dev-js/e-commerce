const API_URL = import.meta.env.VITE_API_URL;

export const createPaymentOrder = async (orderData) => {
  const response = await fetch(`${API_URL}/api/payment/create-order`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(orderData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to create payment order.");
  }

  return data;
};

export const verifyPayment = async (paymentData) => {
  const response = await fetch(`${API_URL}/api/payment/verify`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(paymentData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Payment verification failed.");
  }

  return data;
};