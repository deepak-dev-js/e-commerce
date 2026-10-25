import { useEffect, useState } from "react";
import api from "../../../api/axios";
import ProductCard from "./ProductCard";
import allowedCategories from "../../../../constants/allowedCategories.js";


function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [category, setCategory] = useState("all");

  const filteredProducts = products.filter((product) => {
    if (category === "all") {
      return true;
    }

    return product.category === category;
  });


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

        <p className="mt-2 text-gray-500 mb-4">
          Discover products you'll love.
        </p>

        <select
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-black sm:w-auto"

        >

          <option value="all">All Categories</option>

          {allowedCategories.map((item) => (<option key={item} value={item}>
            {item} </option>
          ))} </select>

      </div>

      <div className="grid grid-cols-2 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredProducts.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </section>
  );
}

export default ProductList;