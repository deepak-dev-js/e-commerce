import crypto from "crypto";
import mongoose from "mongoose";
import Product from "../../models/Product.js";
import Order from "../../models/Order.js";
import razorpay from "../../config/razorpay.js";
import sendEmail from "../../services/emailService.js";
import createOrderEmailTemplate from "../../templates/orderEmailTemplate.js";

// --------------------------------------------------
// Helpers
// --------------------------------------------------

const getVariantAttributeObject = (attributes) => {
  if (!attributes) {
    return {};
  }

  if (attributes instanceof Map) {
    return Object.fromEntries(attributes);
  }

  if (typeof attributes.toObject === "function") {
    return attributes.toObject();
  }

  return { ...attributes };
};

const restoreReservedStock = async (reservations) => {
  for (const reservation of [...reservations].reverse()) {
    await Product.updateOne(
      {
        _id: reservation.productId,
        "variants._id": reservation.variantId,
      },
      {
        $inc: {
          "variants.$.stock": reservation.quantity,
        },
      },
    );
  }
};

// --------------------------------------------------
// Create Razorpay Payment Order
// --------------------------------------------------

export const createPaymentOrder = async (req, res) => {
  const reservations = [];
  let order = null;

  try {
    const { items, shippingAddress } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message: "Your cart is empty.",
      });
    }

    // Validate shipping address.
    const requiredAddressFields = [
      "fullName",
      "email",
      "phone",
      "addressLine",
    ];

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

    // Validate items and combine duplicate product-variant pairs.
    const quantities = new Map();

    for (const item of items) {
      if (
        !mongoose.isValidObjectId(item.productId) ||
        !mongoose.isValidObjectId(item.variantId) ||
        !Number.isSafeInteger(item.quantity) ||
        item.quantity < 1
      ) {
        return res.status(400).json({
          message: "Invalid product, variant, or quantity.",
        });
      }

      const productId = String(item.productId);
      const variantId = String(item.variantId);
      const key = `${productId}:${variantId}`;

      const quantity =
        (quantities.get(key)?.quantity ?? 0) + item.quantity;

      if (quantity > 100) {
        return res.status(400).json({
          message: "Requested quantity is too large.",
        });
      }

      quantities.set(key, {
        productId,
        variantId,
        quantity,
      });
    }

    // Fetch products from MongoDB.
    const productIds = [
      ...new Set(
        [...quantities.values()].map((item) => item.productId),
      ),
    ];

    const products = await Product.find({
      _id: { $in: productIds },
    });

    const productMap = new Map(
      products.map((product) => [
        String(product._id),
        product,
      ]),
    );

    if (products.length !== productIds.length) {
      return res.status(400).json({
        message: "One or more products are no longer available.",
      });
    }

    const orderItems = [];
    let totalPaise = 0;

    // Validate each selected variant using database values.
    for (const item of quantities.values()) {
      const product = productMap.get(item.productId);

      const variant = product.variants.find(
        (entry) => String(entry._id) === item.variantId,
      );

      if (!variant) {
        return res.status(400).json({
          message: `Selected variant for ${product.name} is unavailable.`,
        });
      }

      const price = Number(variant.price);
      const stock = Number(variant.stock);

      if (!Number.isFinite(price) || price < 0) {
        return res.status(400).json({
          message: `Invalid price for ${product.name}.`,
        });
      }

      if (!Number.isSafeInteger(stock) || stock < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for ${product.name}.`,
        });
      }

      const pricePaise = Math.round(price * 100);

      if (!Number.isSafeInteger(pricePaise)) {
        return res.status(400).json({
          message: `Invalid price for ${product.name}.`,
        });
      }

      totalPaise += pricePaise * item.quantity;

      if (!Number.isSafeInteger(totalPaise)) {
        return res.status(400).json({
          message: "Invalid order amount.",
        });
      }

      const attributes = getVariantAttributeObject(
        variant.attributes,
      );

      orderItems.push({
        product: product._id,
        variantId: variant._id,
        name: product.name,
        sku: variant.sku,
        attributes,
        image: variant.images?.[0] ?? "",
        price,
        quantity: item.quantity,
      });
    }

    if (totalPaise <= 0) {
      return res.status(400).json({
        message: "Invalid order amount.",
      });
    }

    // Reserve stock atomically to prevent overselling.
    // If a reservation fails, previously reserved quantities
    // are restored in the catch block.
    for (const item of quantities.values()) {
      const reservation = await Product.updateOne(
        {
          _id: item.productId,
          variants: {
            $elemMatch: {
              _id: new mongoose.Types.ObjectId(item.variantId),
              stock: { $gte: item.quantity },
            },
          },
        },
        {
          $inc: {
            "variants.$.stock": -item.quantity,
          },
        },
      );

      if (reservation.modifiedCount !== 1) {
        throw new Error(
          "Stock changed during checkout. Please refresh your cart and try again.",
        );
      }

      reservations.push({
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
      });
    }

    // Create order with a snapshot of the selected variants.
    order = await Order.create({
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

    // Create Razorpay order.
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
    console.error("Create payment order failed:", error);

    // Roll back an order created by this request and release
    // stock if payment-order creation failed.
    if (order?._id) {
      try {
        await Order.deleteOne({ _id: order._id });
      } catch (rollbackError) {
        console.error(
          "Failed to remove incomplete order:",
          rollbackError,
        );
      }
    }

    try {
      await restoreReservedStock(reservations);
    } catch (rollbackError) {
      console.error(
        "Failed to restore reserved stock:",
        rollbackError,
      );

      return res.status(500).json({
        message:
          "Checkout failed and stock restoration needs attention.",
      });
    }

    const status = error.message?.startsWith("Stock changed")
      ? 409
      : 500;

    return res.status(status).json({
      message:
        status === 409
          ? error.message
          : "Unable to create payment order.",
    });
  }
};

// --------------------------------------------------
// Verify Razorpay Payment
// --------------------------------------------------

export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

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

    // Find the order belonging to the authenticated user.
    const order = await Order.findOne({
      razorpayOrderId: razorpay_order_id,
      user: req.user._id,
    });

    if (!order) {
      return res.status(404).json({
        message: "Order not found.",
      });
    }

    // Idempotency: do not process an already paid order twice.
    if (order.paymentStatus === "paid") {
      if (order.razorpayPaymentId !== razorpay_payment_id) {
        return res.status(409).json({
          message:
            "This order was already paid using another payment.",
        });
      }

      return res.status(200).json({
        message: "Payment already verified.",
        orderId: order._id,
        paymentStatus: order.paymentStatus,
      });
    }

    if (order.paymentStatus !== "pending") {
      return res.status(409).json({
        message: "This order is no longer awaiting payment.",
      });
    }

    // Verify signature on the backend.
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

    // Confirm payment details directly with Razorpay.
    const payment = await razorpay.payments.fetch(
      razorpay_payment_id,
    );

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

    // Atomically mark the order paid so concurrent verification
    // requests cannot both perform post-payment side effects.
    const updatedOrder = await Order.findOneAndUpdate(
      {
        _id: order._id,
        user: req.user._id,
        paymentStatus: "pending",
      },
      {
        $set: {
          paymentStatus: "paid",
          orderStatus: "confirmed",
          razorpayPaymentId: razorpay_payment_id,
        },
      },
      { new: true },
    );

    if (!updatedOrder) {
      const latestOrder = await Order.findById(order._id);

      if (
        latestOrder?.paymentStatus === "paid" &&
        latestOrder.razorpayPaymentId === razorpay_payment_id
      ) {
        return res.status(200).json({
          message: "Payment already verified.",
          orderId: latestOrder._id,
          paymentStatus: latestOrder.paymentStatus,
        });
      }

      return res.status(409).json({
        message:
          "Order status changed. Please refresh and check your order.",
      });
    }

    // Increment product purchase counts only after verification.
    try {
      const purchaseUpdates = updatedOrder.items.map((item) => ({
        updateOne: {
          filter: { _id: item.product },
          update: {
            $inc: {
              purchaseCount: item.quantity,
            },
          },
        },
      }));

      if (purchaseUpdates.length > 0) {
        await Product.bulkWrite(purchaseUpdates);
      }
    } catch (error) {
      console.error(
        "Failed to update product purchase counts:",
        error,
      );
    }

    // Send confirmation to the customer's supplied email.
    const { fullName, email } = updatedOrder.shippingAddress;

    try {
      const html = createOrderEmailTemplate({
        fullName,
        order: updatedOrder,
        status: "confirmed",
        logoUrl: "",
        storeUrl: "https://apnashop-online.vercel.app",
      });

      await sendEmail({
        to: email,
        subject: "ApnaShop - Order Confirmation",
        text:
          `Hi ${fullName}, your payment was successful! ` +
          `Your ApnaShop order is confirmed. ` +
          `Order ID: ${updatedOrder._id}. ` +
          `Total: ₹${updatedOrder.totalAmount}.`,
        html,
      });
    } catch (error) {
      console.error(
        "Order confirmation email failed:",
        error,
      );
    }

    return res.status(200).json({
      message: "Payment verified successfully.",
      orderId: updatedOrder._id,
      paymentStatus: updatedOrder.paymentStatus,
    });
  } catch (error) {
    console.error("Payment verification failed:", error);

    return res.status(500).json({
      message:
        "Unable to verify payment. Please check your order status.",
    });
  }
};