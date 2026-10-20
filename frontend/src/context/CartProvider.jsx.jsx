import { useState } from "react";
import { CartContext } from "./CartContext.js";
import {
  addProductToCart,
} from "../services/cartService.js";

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  const addToCart = async (product) => {
    try {
      const data = await addProductToCart(product._id, 1);

      setCartItems(data.cart.items);
    } catch (error) {
      console.error("Failed to add product to cart:", error);
      throw error;
    }
  };

  const cartCount = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        setCartItems,
        addToCart,
        cartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};