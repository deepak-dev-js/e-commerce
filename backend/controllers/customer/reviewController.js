import mongoose from "mongoose";
import Review from "../../models/Review.js";
import Product from "../../models/Product.js";

// @desc    Create or update a product review
// @route   POST /api/products/:id/reviews
// @access  Private
export const createProductReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const productId = req.params.id;
    const userId = req.user._id;

    const numericRating = Number(rating);

    if (
      rating === undefined ||
      rating === null ||
      rating === "" ||
      !Number.isFinite(numericRating) ||
      numericRating < 1 ||
      numericRating > 5
    ) {
      return res.status(400).json({
        message: "Rating must be a number between 1 and 5.",
      });
    }

    if (
      comment !== undefined &&
      (typeof comment !== "string" || comment.trim().length > 1000)
    ) {
      return res.status(400).json({
        message: "Comment must be a string of at most 1000 characters.",
      });
    }

    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({
        message: "Invalid product ID.",
      });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        message: "Product not found.",
      });
    }

    let review = await Review.findOne({
      user: userId,
      product: productId,
    });

    if (review) {
      review.rating = numericRating;
      review.comment = comment?.trim() || "";
      await review.save();
    } else {
      review = await Review.create({
        user: userId,
        product: productId,
        rating: numericRating,
        comment: comment?.trim() || "",
      });
    }

    // Calculate average rating and total reviews.
    const stats = await Review.aggregate([
      {
        $match: {
          product: new mongoose.Types.ObjectId(productId),
        },
      },
      {
        $group: {
          _id: "$product",
          averageRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 },
        },
      },
    ]);

    const averageRating = stats.length
      ? Math.round(stats[0].averageRating * 10) / 10
      : 0;

    const numReviews = stats.length ? stats[0].totalReviews : 0;

    await Product.findByIdAndUpdate(productId, {
      $set: {
        rating: averageRating,
        numReviews,
      },
    });

    return res.status(200).json({
      message: "Review submitted successfully.",
      review,
      rating: averageRating,
      numReviews,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "A review for this product already exists for this user.",
      });
    }

    console.error("Create product review error:", error);

    return res.status(500).json({
      message: "Failed to submit review.",
    });
  }
};

export const getMyProductReviews = async (req, res) => {
    try {
        const reviews = await Review.find({
            user: req.user._id,
        })
            .select("product rating comment")
            .lean();

        return res.status(200).json({ reviews });
    } catch (error) {
        console.error("Failed to fetch product reviews:", error);

        return res.status(500).json({
            message: "Failed to fetch your reviews.",
        });
    }
};