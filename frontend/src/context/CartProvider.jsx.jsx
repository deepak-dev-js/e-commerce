import { useEffect, useState } from "react";
import { CartContext } from "./CartContext.js";

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const items = JSON.parse(localStorage.getItem("cartItems")) || [];

      return items.map((item) => ({
        ...item,
        quantity: item.quantity || 1,
      }));
    } catch (error) {
      console.error("Failed to load cart:", error);
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product) => {
    setCartItems((prevItems) => {
      const alreadyExists = prevItems.some(
        (item) => item._id === product._id
      );

      if (alreadyExists) return prevItems;

      return [...prevItems, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity < 1) return;

    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item._id === productId ? { ...item, quantity } : item
      )
    );
  };

  const removeFromCart = (productId) => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => item._id !== productId)
    );
  };

  const isInCart = (productId) =>
    cartItems.some((item) => item._id === productId);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        setCartItems,
        addToCart,
        updateQuantity,
        removeFromCart,
        isInCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};