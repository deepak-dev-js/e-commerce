import Order from "../../models/Order.js";
import sendEmail from "../../services/emailService.js";
import createOrderEmailTemplate from "../../templates/orderEmailTemplate.js";
import { getIO } from "../../config/socket.js";

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

    if (!allowedStatuses.includes(orderStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status.",
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    // Do not send notifications if the status has not changed.
    if (order.orderStatus === orderStatus) {
      return res.status(200).json({
        success: true,
        message: "Order status is already up to date.",
        order,
      });
    }

    // Update the order status.
    // Update the order status.
    order.orderStatus = orderStatus;
    await order.save();

    // Notify the customer in real time.
    getIO()
      .to(`user:${order.user}`)
      .emit("order_status_updated", {
        orderId: order._id.toString(),
        status: order.orderStatus,
        message: `Your order status is now ${order.orderStatus.replaceAll("_", " ")}`,
        updatedAt: order.updatedAt,
      });

    const fullName = order.shippingAddress?.fullName || "Customer";

    const email = "deepakgupta757600@gmail.com";

    try {
      if (email) {
        const html = createOrderEmailTemplate({
          fullName,
          order: order,
          status: "confirmed",
          logoUrl: "", // Optional: apne logo ka public HTTPS URL yahan do
          storeUrl: "https://apnashop-online.vercel.app",
        });

        await sendEmail({
          to: email,
          subject: "ApnaShop - Order Confirmation",
          text:
            `Hi ${fullName}, your payment was successful! ` +
            `Your ApnaShop order is confirmed. ` +
            `Order ID: ${order._id}. ` +
            `Total: ₹${order.totalAmount}.`,
          html,
        });
      }
    } catch (error) {
      console.error("Order confirmation email failed:", error);
    }

    return res.status(200).json({
      success: true,
      message: "Order status updated successfully.",
      order,
    });
  } catch (error) {
    console.error("Update order status error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update order status.",
    });
  }
};

export const updatePaymentStatus = async (req, res) => {
  try {
    const { paymentStatus } = req.body;

    if (paymentStatus !== "refunded") {
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
      order.paymentStatus !== "refund_processing"
    ) {
      return res.status(400).json({
        success: false,
        message: "This order cannot be marked as refunded.",
      });
    }

    order.paymentStatus = "refunded";
    await order.save();

    const { fullName } = order.shippingAddress;

    const email = "deepakgupta757600@gmail.com";

    try {
      if (email) {
        const html = createOrderEmailTemplate({
          fullName,
          order: order,
          status: "confirmed",
          logoUrl: "", // Optional: apne logo ka public HTTPS URL yahan do
          storeUrl: "https://apnashop-online.vercel.app",
        });

        await sendEmail({
          to: email,
          subject: "ApnaShop - Order Confirmation",
          text:
            `Hi ${fullName}, your payment was successful! ` +
            `Your ApnaShop order is confirmed. ` +
            `Order ID: ${order._id}. ` +
            `Total: ₹${order.totalAmount}.`,
          html,
        });
      }
    } catch (error) {
      console.error("Order confirmation email failed:", error);
    }

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
