
import { useEffect } from "react";
import { useCart } from "../context/useCart.js";
import {
  fetchCart,
  updateCartQuantity,
  removeCartProduct,
} from "../services/cartService.js";

const Cart = () => {
  const { cartItems, setCartItems } = useCart();

  useEffect(() => {
    const loadCart = async () => {
      console.log("api call")
      try {
        const data = await fetchCart();
        setCartItems(data.cart.items);
      } catch (error) {
        console.error("Failed to fetch cart:", error);
      }
    };

    loadCart();
  }, [setCartItems]);

  const handleQuantityChange = async (productId, quantity) => {
    if (quantity < 1) return;

    try {
      const data = await updateCartQuantity(productId, quantity);
      setCartItems(data.cart.items);
    } catch (error) {
      console.error("Failed to update quantity:", error);
    }
  };

  const handleRemove = async (productId) => {
    try {
      const data = await removeCartProduct(productId);
      setCartItems(data.cart.items);
    } catch (error) {
      console.error("Failed to remove product from cart:", error);
    }
  };

  const totalPrice = cartItems.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  );

  return (
    <div>
      <h1>My Cart</h1>

      {cartItems.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          {cartItems.map((item) => (
            <div key={item.product._id}>
              <h3>{item.product.name}</h3>

              <p>Price: ₹{item.product.price}</p>

              <div>
                <button
                  onClick={() =>
                    handleQuantityChange(
                      item.product._id,
                      item.quantity - 1
                    )
                  }
                  disabled={item.quantity <= 1}
                >
                  −
                </button>

                <span> {item.quantity} </span>

                <button
                  onClick={() =>
                    handleQuantityChange(
                      item.product._id,
                      item.quantity + 1
                    )
                  }
                >
                  +
                </button>
              </div>

              <p>
                Subtotal: ₹{item.product.price * item.quantity}
              </p>

              <button
                onClick={() => handleRemove(item.product._id)}
              >
                Remove
              </button>
            </div>
          ))}

          <h2>Total: ₹{totalPrice}</h2>
        </>
      )}
    </div>
  );
};

export default Cart;

