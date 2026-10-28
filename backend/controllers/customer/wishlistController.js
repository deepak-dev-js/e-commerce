import mongoose from "mongoose";
import User from "../../models/User.js";
import Product from "../../models/Product.js";

// GET /api/customer/wishlist
export const getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: "wishlist",
      select:
        "name description category brand options variants rating numReviews purchaseCount",
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      wishlist: user.wishlist,
    });
  } catch (error) {
    console.error("Get wishlist error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch wishlist.",
    });
  }
};

// POST /api/customer/wishlist/:productId
export const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID.",
      });
    }

    const product = await Product.findById(productId).select("_id");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        $addToSet: {
          wishlist: product._id,
        },
      },
      {
        new: true,
      },
    ).populate({
      path: "wishlist",
      select:
        "name description category brand options variants rating numReviews purchaseCount",
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product added to wishlist.",
      wishlist: user.wishlist,
    });
  } catch (error) {
    console.error("Add to wishlist error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to add product to wishlist.",
    });
  }
};

// DELETE /api/customer/wishlist/:productId
export const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID.",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        $pull: {
          wishlist: productId,
        },
      },
      {
        new: true,
      },
    ).populate({
      path: "wishlist",
      select:
        "name description category brand options variants rating numReviews purchaseCount",
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product removed from wishlist.",
      wishlist: user.wishlist,
    });
  } catch (error) {
    console.error("Remove from wishlist error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to remove product from wishlist.",
    });
  }
};