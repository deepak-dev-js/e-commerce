import { useEffect, useState } from "react";
import api from "../../../api/axios";
import ProductCard from "./ProductCard";

function ProductList() {
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
     <section className="px-4 py-10 sm:px-6 lg:px-12">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900">
          Latest Collection
        </h1>

        <p className="mt-2 text-gray-500">
          Discover products you'll love.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}

export default ProductList;