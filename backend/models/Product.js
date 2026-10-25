import mongoose from "mongoose";
import allowedCategories from "../constants/allowedCategories.js";

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
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
      type: String,
      required: true,
      enum: allowedCategories,
    },
    image: {
      type: String,
      required: true,
    },
    stock: {
      type: Number,
      default: 10,
      min: 0,
    },
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
