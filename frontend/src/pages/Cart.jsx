import { useCart } from "../context/useCart";

const Cart = () => {
  const { cartItems } = useCart();

  return (
    <div>
      <h1>My Cart</h1>

      {cartItems.map((item) => (
        <div key={item._id}>
          <h3>{item.name}</h3>
          <p>Price: ₹{item.price}</p>
          <p>Quantity: {item.quantity}</p>
        </div>
      ))}
    </div>
  );
};

export default Cart;