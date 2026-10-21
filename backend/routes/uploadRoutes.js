import express from "express";
import multer from "multer";
import cloudinary from "../config/cloudinary.js";
import { protect } from "../middleware/authMiddleware.js";
import adminOnly from "../middleware/adminMiddleware.js";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
  },
});

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

router.post(
  "/upload-product-image",
  protect,
  adminOnly,
  upload.single("image"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Please select an image",
        });
      }

      const category = req.body.category
        ?.trim();

      if (!allowedCategories.includes(category)) {
        console.log(category);
        return res.status(400).json({
          success: false,
          message: "Invalid product category 2",
        });
      }

      if (!req.file.mimetype.startsWith("image/")) {
        return res.status(400).json({
          success: false,
          message: "Only image files are allowed",
        });
      }

      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: `e-commerce/products/${category}`,
            resource_type: "image",
          },
          (error, result) => {
            if (error) {
              return reject(error);
            }

            resolve(result);
          }
        );

        stream.end(req.file.buffer);
      });

      return res.status(200).json({
        success: true,
        message: "Image uploaded successfully",
        imageUrl: result.secure_url,
        publicId: result.public_id,
      });
    } catch (error) {
      console.error("Cloudinary upload failed:", error);

      return res.status(500).json({
        success: false,
        message: "Image upload failed",
      });
    }
  }
);

export default router;