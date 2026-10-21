const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const fetchAllOrders = async () => {
  const response = await fetch(`${API_URL}/api/admin/orders`, {
    method: "GET",
    credentials: "include",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch orders.");
  }

  return data.orders;
};