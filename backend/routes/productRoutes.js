import express from "express";
import Product from "../models/Product.js";
import { getProductById } from "../controllers/productController.js";
import { protect } from "../middleware/authMiddleware.js";
import adminOnly from "../middleware/adminMiddleware.js";

const router = express.Router();

// GET: Fetch all products
router.get("/", async (req, res) => {
  try {
    console.log("Fetching products from MongoDB Atlas...");

    const products = await Product.find();

    console.log("Products fetched:", products.length);

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

// POST: Create a product (Admin only)
router.post("/", protect, adminOnly, async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      brand,
      image,
      stock,
      isFeatured,
    } = req.body;

    // Validate required fields
    if (
      !name?.trim() ||
      !description?.trim() ||
      price === undefined ||
      price === null ||
      !category ||
      !brand?.trim() ||
      !image?.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required product fields",
      });
    }

    // Validate price
    if (!Number.isFinite(Number(price)) || Number(price) < 0) {
      return res.status(400).json({
        success: false,
        message: "Price must be a valid non-negative number",
      });
    }

    // Validate stock
    if (
      stock !== undefined &&
      (!Number.isInteger(Number(stock)) || Number(stock) < 0)
    ) {
      return res.status(400).json({
        success: false,
        message: "Stock must be a non-negative integer",
      });
    }

    // Validate category
    const allowedCategories = [
      // Fashion
      "Men's Clothing",
      "Women's Clothing",
      "Kids' Clothing",
      "Sneakers",
      "Shoes",
      "Sandals",
      "Watches",
      "Bags",
      "Jewelry",
      "Sunglasses",
      "Accessories",

      // Electronics
      "Mobiles",
      "Laptops",
      "Tablets",
      "Headphones",
      "Speakers",
      "Cameras",
      "Gaming Accessories",
      "Smart Home",

      // Home & Living
      "Home & Kitchen",
      "Furniture",
      "Home Decor",
      "Lighting",
      "Bedding",

      // Beauty & Personal Care
      "Skincare",
      "Makeup",
      "Haircare",
      "Fragrances",
      "Personal Care",

      // Other
      "Sports & Fitness",
      "Books",
      "Toys",
      "Pet Supplies",
      "Automotive",
    ];

    if (!allowedCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product category 1",
      });
    }

    const product = await Product.create({
      name: name.trim(),
      description: description.trim(),
      price: Number(price),
      category,
      brand: brand.trim(),
      image: image.trim(),
      stock: stock === undefined ? 0 : Number(stock),
      isFeatured: Boolean(isFeatured),
    });

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    console.error("Error creating product:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create product",
    });
  }
});

// GET: Fetch a single product by ID
router.get("/:id", getProductById);

export default router;
