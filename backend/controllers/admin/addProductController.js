import Product from "../../models/Product.js";
import allowedCategories from "../../constants/allowedCategories.js";

// POST: Create a product
export const addProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      image,
      stock = 10,
    } = req.body;

    // Validate required fields
    if (
      !name?.trim() ||
      !description?.trim() ||
      price === undefined ||
      price === null ||
      !category ||
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
    if (!allowedCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product category",
      });
    }

    const product = await Product.create({
      name: name.trim(),
      description: description.trim(),
      price: Number(price),
      category,
      image: image.trim(),
      stock: Number(stock),
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
};