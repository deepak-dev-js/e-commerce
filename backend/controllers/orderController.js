import Order from "../models/Order.js";

export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      user: req.user._id,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error("Failed to fetch customer orders:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch your orders.",
    });
  }
};
