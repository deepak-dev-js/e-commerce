const API_URL = import.meta.env.VITE_API_URL;

export const fetchCart = async () => {
  const response = await fetch(`${API_URL}/api/cart`, {
    credentials: "include",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch cart");
  }

  return data;
};

export const addProductToCart = async (productId, quantity = 1) => {
  const response = await fetch(`${API_URL}/api/cart`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ productId, quantity }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to add product");
  }

  return data;
};

export const updateCartQuantity = async (productId, quantity) => {
  const response = await fetch(
    `${API_URL}/api/cart/${productId}`,
    {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ quantity }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to update cart quantity");
  }

  return data;
};

export const removeCartProduct = async (productId) => {
  const response = await fetch(
    `${API_URL}/api/cart/${productId}`,
    {
      method: "DELETE",
      credentials: "include",
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to remove product");
  }

  return data;
};