import Order from "../models/Order.js";

export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .populate("items.product", "name image")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error("Failed to fetch orders:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch orders.",
    });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus } = req.body;

    const allowedStatuses = [
      "confirmed",
      "packed",
      "shipped",
      "in_transit",
      "out_for_delivery",
      "delivered",
      "cancelled",
    ];

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { $set: { orderStatus } },
      { new: true, runValidators: true },
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      order,
    });
  } catch (error) {
    console.error("Update order status error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update order status",
    });
  }
};

export const updatePaymentStatus = async (req, res) => {
  try {
    const { paymentStatus } = req.body;

    if (!["refund_processing", "refunded"].includes(paymentStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment status.",
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    if (
      order.orderStatus !== "cancelled" ||
      order.paymentStatus !== "refund_processing" ||
      paymentStatus !== "refunded"
    ) {
      return res.status(400).json({
        success: false,
        message: "This order cannot be marked as refunded.",
      });
    }

    order.paymentStatus = "refunded";
    await order.save();

    return res.status(200).json({
      success: true,
      message: "Order marked as refunded successfully.",
      order,
    });
  } catch (error) {
    console.error("Failed to update payment status:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update payment status.",
    });
  }
};
