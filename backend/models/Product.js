import mongoose from "mongoose";

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
      enum: [
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
      ],
    },
    brand: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      required: true,
    },
    stock: {
      type: Number,
      default: 0,
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
    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);

export default Product;