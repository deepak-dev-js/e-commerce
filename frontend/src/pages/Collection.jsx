import { useEffect, useState } from "react";
import api from "../api/axios";

function Collection() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/api/products")
      .then((response) => {
        setProducts(response.data.products);
      })
      .catch((error) => {
        setError(error.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <h2>Loading products...</h2>;
  }

  if (error) {
    return <h2>Error: {error}</h2>;
  }

  return (
    <div>
      <h1>My Shop</h1>

      {products.map((product) => (
        <div key={product.id}>
          <h2>{product.name}</h2>
          <img src={product.image} alt={product.name} width="200" />
          <p>{product.description}</p>
          <p>Category: {product.category}</p>
          <p>Brand: {product.brand}</p>
          <p>Stock: {product.stock}</p>
          <p>Rating: {product.rating} ({product.numReviews} reviews)</p>
          <p>Featured: {product.isFeatured ? "Yes" : "No"}</p>
          <p>Price: ₹{product.price}</p>
        </div>
      ))}
    </div>
  );
}

export default Collection;