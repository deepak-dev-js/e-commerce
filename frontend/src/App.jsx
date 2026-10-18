import MainLayout from "./layouts/MainLayout";

const App = () => {
  return <MainLayout />;
};

export default App;

// import { useEffect, useState } from "react";

// function App() {
//   const [products, setProducts] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     fetch("http://localhost:5000/api/products")
//       .then((response) => {
//         if (!response.ok) {
//           throw new Error("Failed to fetch products");
//         }

//         return response.json();
//       })
//       .then((data) => {
//         setProducts(data.products);
//       })
//       .catch((error) => {
//         setError(error.message);
//       })
//       .finally(() => {
//         setLoading(false);
//       });
//   }, []);

//   if (loading) {
//     return <h2>Loading products...</h2>;
//   }

//   if (error) {
//     return <h2>Error: {error}</h2>;
//   }

//   return (
//     <div>
//       <h1>My Shop</h1>

//       {products.map((product) => (
//         <div key={product.id}>
//           <h2>{product.name}</h2>
//           <p>Price: ₹{product.price}</p>
//         </div>
//       ))}
//     </div>
//   );
// }

// export default App;