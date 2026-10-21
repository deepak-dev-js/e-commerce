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

export const cancelMyOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findOne({
      _id: orderId,
      user: req.user._id,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    const cancellableStatuses = [
      "placed",
      "confirmed",
      "processing",
      "packed",
    ];

    if (!cancellableStatuses.includes(order.orderStatus)) {
      return res.status(400).json({
        success: false,
        message: "This order can no longer be cancelled.",
      });
    }

    if (order.paymentStatus === "pending") {
      return res.status(400).json({
        success: false,
        message:
          "Payment is still pending. Please check your payment status before cancelling.",
      });
    }

    if (order.paymentStatus === "paid") {
      return res.status(400).json({
        success: false,
        message:
          "This order has already been paid. A refund process is required before cancellation can be completed.",
      });
    }

    order.orderStatus = "cancelled";
    await order.save();

    return res.status(200).json({
      success: true,
      message: "Order cancelled successfully.",
      order,
    });
  } catch (error) {
    console.error("Failed to cancel order:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to cancel order.",
    });
  }
};


