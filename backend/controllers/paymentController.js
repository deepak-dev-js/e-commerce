import crypto from "crypto";
import mongoose from "mongoose";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import razorpay from "../config/razorpay.js";

export const createPaymentOrder = async (req, res) => {
  try {
    const { items, shippingAddress } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message: "Your cart is empty.",
      });
    }

    const requiredAddressFields = ["fullName", "email", "phone", "addressLine"];

    const validAddress =
      shippingAddress &&
      requiredAddressFields.every(
        (field) =>
          typeof shippingAddress[field] === "string" &&
          shippingAddress[field].trim().length > 0,
      );

    if (!validAddress) {
      return res.status(400).json({
        message: "Please provide a complete shipping address.",
      });
    }

    // Validate and combine duplicate product IDs.
    const quantities = new Map();

    for (const item of items) {
      if (
        !item.productId ||
        !mongoose.isValidObjectId(item.productId) ||
        !Number.isSafeInteger(item.quantity) ||
        item.quantity < 1
      ) {
        return res.status(400).json({
          message: "Invalid product or quantity.",
        });
      }

      const id = item.productId.toString();
      const quantity = (quantities.get(id) || 0) + item.quantity;

      if (quantity > 100) {
        return res.status(400).json({
          message: "Requested quantity is too large.",
        });
      }

      quantities.set(id, quantity);
    }

    const productIds = [...quantities.keys()];

    // Always fetch prices and stock from MongoDB.
    const products = await Product.find({
      _id: { $in: productIds },
    });

    if (products.length !== productIds.length) {
      return res.status(400).json({
        message: "One or more products are no longer available.",
      });
    }

    const orderItems = [];
    let totalPaise = 0;

    for (const product of products) {
      const quantity = quantities.get(product._id.toString());

      if (product.stock < quantity) {
        return res.status(400).json({
          message: `Insufficient stock for ${product.name}.`,
        });
      }

      // Convert rupees to paise to calculate money using integers.
      const pricePaise = Math.round(product.price * 100);
      totalPaise += pricePaise * quantity;

      orderItems.push({
        product: product._id,
        name: product.name,
        image: product.image,
        price: product.price,
        quantity,
      });
    }

    if (!Number.isSafeInteger(totalPaise) || totalPaise <= 0) {
      return res.status(400).json({
        message: "Invalid order amount.",
      });
    }

    // Create a pending order in MongoDB.
    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      shippingAddress: {
        fullName: shippingAddress.fullName.trim(),
        email: shippingAddress.email.trim(),
        phone: shippingAddress.phone.trim(),
        addressLine: shippingAddress.addressLine.trim(),
      },
      totalAmount: totalPaise / 100,
      currency: "INR",
      paymentStatus: "pending",
      orderStatus: "awaiting_payment",
    });

    try {
      const razorpayOrder = await razorpay.orders.create({
        amount: totalPaise,
        currency: "INR",
        receipt: order._id.toString(),
      });

      order.razorpayOrderId = razorpayOrder.id;
      await order.save();

      return res.status(201).json({
        message: "Payment order created successfully.",
        keyId: process.env.RAZORPAY_KEY_ID,
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        orderMongoId: order._id,
      });
    } catch (error) {
      // Do not leave a pending order if Razorpay order creation fails.
      await Order.deleteOne({ _id: order._id });
      throw error;
    }
  } catch (error) {
    console.error("Create payment order failed:", error);

    return res.status(500).json({
      message: "Unable to create payment order.",
    });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    if (
      typeof razorpay_order_id !== "string" ||
      typeof razorpay_payment_id !== "string" ||
      typeof razorpay_signature !== "string" ||
      !/^[a-f0-9]{64}$/i.test(razorpay_signature)
    ) {
      return res.status(400).json({
        message: "Invalid payment verification details.",
      });
    }

    // Find the pending order belonging to the authenticated user.
    const order = await Order.findOne({
      razorpayOrderId: razorpay_order_id,
      user: req.user._id,
    });

    if (!order) {
      return res.status(404).json({
        message: "Order not found.",
      });
    }

    // Verify the signature using the secret key on the backend.
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const received = Buffer.from(razorpay_signature, "hex");
    const expected = Buffer.from(expectedSignature, "hex");

    if (
      received.length !== expected.length ||
      !crypto.timingSafeEqual(received, expected)
    ) {
      return res.status(400).json({
        message: "Payment signature verification failed.",
      });
    }

    // Do not trust the frontend alone: confirm payment with Razorpay.
    const payment = await razorpay.payments.fetch(razorpay_payment_id);

    if (
      payment.order_id !== razorpay_order_id ||
      payment.currency !== order.currency ||
      payment.amount !== Math.round(order.totalAmount * 100) ||
      !["authorized", "captured"].includes(payment.status)
    ) {
      return res.status(400).json({
        message: "Payment details do not match this order.",
      });
    }

    if (order.paymentStatus === "paid") {
      if (order.razorpayPaymentId !== razorpay_payment_id) {
        return res.status(409).json({
          message: "This order was already paid using another payment.",
        });
      }

      return res.status(200).json({
        message: "Payment already verified.",
        orderId: order._id,
        paymentStatus: order.paymentStatus,
      });
    }

    // Avoid overwriting a paid order.
    const updatedOrder = await Order.findOneAndUpdate(
      {
        _id: order._id,
        user: req.user._id,
        paymentStatus: "pending",
      },
      {
        $set: {
          paymentStatus: "paid",
          orderStatus: "processing",
          razorpayPaymentId: razorpay_payment_id,
        },
      },
      { new: true },
    );

    if (!updatedOrder) {
      return res.status(409).json({
        message: "Order status changed. Please refresh and check your order.",
      });
    }

    return res.status(200).json({
      message: "Payment verified successfully.",
      orderId: updatedOrder._id,
      paymentStatus: updatedOrder.paymentStatus,
    });
  } catch (error) {
    console.error("Payment verification failed:", error);

    return res.status(500).json({
      message: "Unable to verify payment. Please check your order status.",
    });
  }
};
