import { useState } from "react";

function ProductCard() {
  const [cartCount, setCartCount] = useState(0);

  function handleAddToCart() {
    setCartCount(cartCount + 2);
  }

  return (
    <div>
      <h2>Wireless Headphones</h2>

      <p>Price: ₹1,499</p>

      <p>Cart Count: {cartCount}</p>

      <button onClick={handleAddToCart}>
        Add to Cart
      </button>
    </div>
  );
}

export default ProductCard;