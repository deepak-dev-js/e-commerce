import express from "express";
import Product from "../models/Product.js";
import { getProductById } from "../controllers/productController.js";

const router = express.Router();

// GET: Fetch all products
router.get("/", async (req, res) => {
  try {

    const products = await Product.find();

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("Error fetching products:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch products",
    });
  }
});

// GET: Fetch a single product by ID
router.get("/:id", getProductById);

export default router;
