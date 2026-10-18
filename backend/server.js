import express from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// First API
app.get("/api/products", (req, res) => {
  const products = [
    {
      id: 1,
      name: "Laptop",
      price: 50000
    },
    {
      id: 2,
      name: "Mobile",
      price: 20000
    },
    {
      id: 3,
      name: "Headphones",
      price: 2000
    }
  ];

  res.json({
    success: true,
    products
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});