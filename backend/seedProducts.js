import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "./models/Product.js";

dotenv.config();

const products = [
  {
    name: "Running Sneakers 1",
    description: "Comfortable running sneakers",
    price: 1999,
    category: "Sneakers",
    brand: "Nike",
    image: "https://res.cloudinary.com/fgmstgnk/image/upload/v1792375927/sneaker-01.jpg",
    stock: 20,
    rating: 4.5,
    numReviews: 10,
    isFeatured: true,
  },
  {
    name: "Running Sneakers 2",
    description: "Stylish everyday sneakers",
    price: 2499,
    category: "Sneakers",
    brand: "Adidas",
    image: "https://res.cloudinary.com/fgmstgnk/image/upload/v1792375927/sneaker-03.jpg",
    stock: 15,
    rating: 4.3,
    numReviews: 8,
    isFeatured: false,
  },
  {
    name: "Running Sneakers 3",
    description: "Lightweight sports sneakers",
    price: 1799,
    category: "Sneakers",
    brand: "Puma",
    image: "https://res.cloudinary.com/fgmstgnk/image/upload/v1792375928/sneaker-02.jpg",
    stock: 25,
    rating: 4.2,
    numReviews: 6,
    isFeatured: false,
  },

  // Add your 5 headphone products here.
  // Add your 5 watch products here.
];

const seedProducts = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    await Product.insertMany(products);

    console.log("Products saved successfully!");

    await mongoose.disconnect();
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  }
};

seedProducts();