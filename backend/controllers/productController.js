import mongoose from "mongoose";
import Product from "../models/Product.js";

const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid product ID",
      });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    return res.status(200).json({ product });
  } catch (error) {
    console.error("Get product by ID error:", error);

    return res.status(500).json({
      message: "Failed to fetch product",
    });
  }
};

export { getProductById };