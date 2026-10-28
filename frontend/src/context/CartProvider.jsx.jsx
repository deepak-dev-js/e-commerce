import { useEffect, useState } from "react";
import { CartContext } from "./CartContext.js";

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const items = JSON.parse(localStorage.getItem("cartItems")) || [];

      return items.map((item) => ({
        ...item,
        cartItemId:
          item.cartItemId ||
          `${item._id}_${item.variantId || "default"}`,
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

  const addToCart = (product, variant = null) => {
    const variantId = variant?._id || product.variantId || null;

    const cartItemId = `${product._id}_${variantId || "default"}`;

    const variantDetails = variant
      ? {
          variantId: variant._id,
          sku: variant.sku,
          price: variant.price,
          stock: variant.stock,
          attributes: variant.attributes,
          image: variant.images?.[0] || "",
        }
      : {
          variantId,
          sku: product.sku || "",
          price: product.price,
          stock: product.stock,
          attributes: product.attributes || {},
          image: product.image || "",
        };

    setCartItems((prevItems) => {
      const existingItem = prevItems.find(
        (item) => item.cartItemId === cartItemId,
      );

      if (existingItem) {
        if (existingItem.quantity >= Number(existingItem.stock)) {
          return prevItems;
        }

        return prevItems.map((item) =>
          item.cartItemId === cartItemId
            ? {
                ...item,
                quantity: Math.min(
                  item.quantity + 1,
                  Number(item.stock),
                ),
              }
            : item,
        );
      }

      if (Number(variantDetails.stock) <= 0) {
        return prevItems;
      }

      return [
        ...prevItems,
        {
          ...product,
          ...variantDetails,
          cartItemId,
          quantity: 1,
        },
      ];
    });
  };

  const updateQuantity = (cartItemId, quantity) => {
    if (!Number.isInteger(quantity) || quantity < 1) return;

    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.cartItemId === cartItemId
          ? {
              ...item,
              quantity: Math.min(quantity, Number(item.stock)),
            }
          : item,
      ),
    );
  };

  const removeFromCart = (cartItemId) => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => item.cartItemId !== cartItemId),
    );
  };

  const isInCart = (cartItemId) =>
    cartItems.some((item) => item.cartItemId === cartItemId);

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