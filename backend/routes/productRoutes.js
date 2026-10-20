import express from "express";
import Product from "../models/Product.js";
import { getProductById } from "../controllers/productController.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    console.log("Fetching products from MongoDB Atlas...");

    const products = await Product.find();

    console.log("Products fetched:", products.length);
    console.log(products);

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("Error fetching products:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to fetch products",
    });
  }
});

router.get("/:id", getProductById);

export default router;