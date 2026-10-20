
import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "../models/Product.js";

dotenv.config();

const products = [
  {
    name: "Skincare Product 1",
    description: "Daily skincare product",
    price: 499,
    category: "Skincare",
    brand: "Beauty Care",
    image: "https://res.cloudinary.com/fgmstgnk/image/upload/v1792506247/pexels-alena-chuyankova-280716561-13019081.webp",
    stock: 20,
  },
  {
    name: "Skincare Product 2",
    description: "Daily skincare product",
    price: 599,
    category: "Skincare",
    brand: "Beauty Care",
    image: "https://res.cloudinary.com/fgmstgnk/image/upload/v1792506247/pexels-harper-sunday-3321416.webp",
    stock: 20,
  },
  {
    name: "Skincare Product 3",
    description: "Daily skincare product",
    price: 399,
    category: "Skincare",
    brand: "Beauty Care",
    image: "https://res.cloudinary.com/fgmstgnk/image/upload/v1792506248/pexels-janakukebal-6689393.webp",
    stock: 20,
  },
  {
    name: "Skincare Product 4",
    description: "Daily skincare product",
    price: 699,
    category: "Skincare",
    brand: "Beauty Care",
    image: "https://res.cloudinary.com/fgmstgnk/image/upload/v1792506249/pexels-michela-ampolo-3866384-10712765.webp",
    stock: 20,
  },
  {
    name: "Skincare Product 5",
    description: "Daily skincare product",
    price: 799,
    category: "Skincare",
    brand: "Beauty Care",
    image: "https://res.cloudinary.com/fgmstgnk/image/upload/v1792506248/pexels-lorena-villarreal-546639145-16652492.webp",
    stock: 20,
  },
  {
    name: "Skincare Product 6",
    description: "Daily skincare product",
    price: 299,
    category: "Skincare",
    brand: "Beauty Care",
    image: "https://res.cloudinary.com/fgmstgnk/image/upload/v1792506252/pexels-min-o-2151190130-31552021.webp",
    stock: 20,
  },
  {
    name: "Skincare Product 7",
    description: "Daily skincare product",
    price: 899,
    category: "Skincare",
    brand: "Beauty Care",
    image: "https://res.cloudinary.com/fgmstgnk/image/upload/v1792506253/pexels-natalia-hawthorne-2149934-3785147.webp",
    stock: 20,
  },
];

const seedSkincare = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing from the .env file");
    }

    if (products.some((product) => product.image.startsWith("PASTE_"))) {
      throw new Error("Replace all placeholder image URLs with Cloudinary URLs");
    }

    await mongoose.connect(process.env.MONGO_URI);

    console.log("Connected to MongoDB Atlas");

    const result = await Product.insertMany(products, {
      ordered: true,
    });

    console.log(`Successfully inserted ${result.length} skincare products`);
  } catch (error) {
    console.error("Failed to seed skincare products:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

seedSkincare();

