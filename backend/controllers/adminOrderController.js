import Order from "../models/Order.js";
import sendEmail from "../services/emailService.js";
import sendWhatsAppMessage from "../services/whatsappService.js";

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
    order.orderStatus = orderStatus;
    await order.save();

    const { fullName, phone } = order.shippingAddress;
    const whatsappPhone = `917869575652`;
    const email = "deepakgupta757600@gmail.com";

    console.log(order);

    const message =
      `Hi ${fullName}, your ApnaShop order status has been updated to ` +
      `${orderStatus.replaceAll("_", " ")}. ` +
      `Order ID: ${order._id}. ` +
      `Total: ₹${order.totalAmount}.`;

    // Send email notification.
    try {
      if (email) {
        await sendEmail({
          to: email,
          subject: `ApnaShop Order Update - ${orderStatus.replaceAll("_", " ")}`,
          text: message,
          html: `
            <h2>Order Status Update</h2>
            <p>Hi ${fullName},</p>
            <p>Your ApnaShop order status has been updated.</p>
            <p><strong>Order ID:</strong> ${order._id}</p>
            <p><strong>Order Status:</strong> ${orderStatus.replaceAll("_", " ")}</p>
            <p><strong>Total:</strong> ₹${order.totalAmount}</p>
            <p>Thank you for shopping with ApnaShop!</p>
          `,
        });
      }
    } catch (error) {
      console.error("Order status email notification failed:", error);
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

    const email = "deepakgupta757600@gmail.com"

    try {
      if (email) {
        await sendEmail({
          to: email,
          subject: "ApnaShop Refund Confirmation",
          text:
            `Hi ${fullName}, your refund has been processed for order ` +
            `${order._id}. Order total: ₹${order.totalAmount}.`,
          html: `
            <h2>Refund Confirmation</h2>
            <p>Hi ${fullName},</p>
            <p>Your ApnaShop order refund has been processed.</p>
            <p><strong>Order ID:</strong> ${order._id}</p>
            <p><strong>Refund Amount:</strong> ₹${order.totalAmount}</p>
            <p>The time taken for the amount to reflect in your account
            depends on your payment provider.</p>
            <p>Thank you for shopping with ApnaShop.</p>
          `,
        });
      }
    } catch (error) {
      console.error("Refund confirmation email failed:", error);
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
