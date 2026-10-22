import Order from "../models/Order.js";
import Order from "../models/Order.js";
import sendWhatsAppMessage from "../services/whatsappService.js";
import sendEmail from "../services/emailService.js";

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

    const { fullName, email, phone } = order.shippingAddress;

    const message =
      `Hi ${fullName}, your ApnaShop order status has been updated to ` +
      `${orderStatus.replaceAll("_", " ")}. ` +
      `Order ID: ${order._id}. ` +
      `Total: ₹${order.totalAmount}.`;

    // Send WhatsApp notification.
    try {
      if (phone) {
        const sent = await sendWhatsAppMessage(phone, message);

        if (!sent) {
          console.error(
            "WhatsApp order status notification failed:",
            order._id,
          );
        }
      }
    } catch (error) {
      console.error("WhatsApp order status notification failed:", error);
    }

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
