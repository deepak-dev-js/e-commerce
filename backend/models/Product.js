import mongoose from "mongoose";

import allowedCategories from "../constants/allowedCategories.js";
import productOptionSchema from "./productOptionSchema.js";
import productVariantSchema from "./productVariantSchema.js";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
      enum: allowedCategories,
    },

    brand: {
      type: String,
      trim: true,
      default: "",
    },

    // Available options for this product.
    options: {
      type: [productOptionSchema],
      default: [],
    },

    // Actual purchasable configurations.
    variants: {
      type: [productVariantSchema],
      default: [],
    },

    // Product-level rating.
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    numReviews: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Total units purchased across all variants.
    purchaseCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true },
);

const Product = mongoose.model("Product", productSchema);

export default Product;