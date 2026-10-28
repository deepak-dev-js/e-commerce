import { getToken } from "@/services/authService";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export interface WishlistProduct {
  _id: string;
  name: string;
  description?: string;
  category: string;
  brand: string;

  options: {
    name: string;
    values: string[];
  }[];

  variants: {
    _id: string;
    sku: string;
    price: number;
    stock: number;
    images: string[];
    attributes: Record<string, string>;
  }[];

  rating: number;
  numReviews: number;
  purchaseCount: number;
}

interface WishlistResponse {
  success: boolean;
  message?: string;
  wishlist: WishlistProduct[];
}

const wishlistRequest = async (
  endpoint: string,
  method: "GET" | "POST" | "DELETE" = "GET",
): Promise<WishlistResponse> => {
  if (!API_URL) {
    throw new Error("EXPO_PUBLIC_API_URL is not configured.");
  }

  const token = await getToken();

  if (!token) {
    throw new Error("Please log in to access your wishlist.");
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  const data: WishlistResponse = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || "Wishlist request failed.");
  }

  return data;
};

// Fetch the logged-in user's wishlist.
export const getWishlist = async (): Promise<WishlistProduct[]> => {
  const data = await wishlistRequest("/api/customer/wishlist");

  return data.wishlist;
};

// Add a product to the wishlist.
export const addToWishlist = async (
  productId: string,
): Promise<WishlistProduct[]> => {
  const data = await wishlistRequest(
    `/api/customer/wishlist/${productId}`,
    "POST",
  );

  return data.wishlist;
};

// Remove a product from the wishlist.
export const removeFromWishlist = async (
  productId: string,
): Promise<WishlistProduct[]> => {
  const data = await wishlistRequest(
    `/api/customer/wishlist/${productId}`,
    "DELETE",
  );

  return data.wishlist;
};