const API_URL = import.meta.env.VITE_API_URL;

const wishlistRequest = async (endpoint, method = "GET") => {
  const response = await fetch(`${API_URL}${endpoint}`, {
    method,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || "Wishlist request failed.");
  }

  return data.wishlist;
};

export const getWishlist = () => {
  return wishlistRequest("/api/customer/wishlist");
};

export const addToWishlist = (productId) => {
  return wishlistRequest(
    `/api/customer/wishlist/${productId}`,
    "POST",
  );
};

export const removeFromWishlist = (productId) => {
  return wishlistRequest(
    `/api/customer/wishlist/${productId}`,
    "DELETE",
  );
};