import express from "express";
import { protect } from "../../middleware/authMiddleware.js";
import adminOnly from "../../middleware/adminMiddleware.js";
import { getDashboardStats } from "../../controllers/admin/adminDashboardController.js";
import { updatePaymentStatus } from "../../controllers/admin/adminOrderController.js";
import multer from "multer";
import { uploadProductImage } from "../../controllers/admin/uploadProductController.js";
import { getAllOrders, updateOrderStatus } from "../../controllers/admin/adminOrderController.js";
import { addProduct } from "../../controllers/admin/addProductController.js";
import { getNotifications, markNotificationsAsRead } from "../../controllers/admin/adminNotificationController.js";

const router = express.Router();

router.get("/dashboard", protect, adminOnly, (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to Admin Dashboard",
    user: {
      name: req.user.name,
      role: req.user.role,
    },
  });
});

router.get("/orders", protect, adminOnly, getAllOrders);

router.patch("/orders/:id/status", protect, adminOnly, updateOrderStatus);

router.get("/dashboard/stats", protect, adminOnly, getDashboardStats);

// POST: Create a product (Admin only)
router.post("/add-product", protect, adminOnly, addProduct);

router.patch(
    "/orders/:id/payment-status",
    protect,
    adminOnly,
    updatePaymentStatus
);


const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

router.post(
  "/upload-product-image",
  protect,
  adminOnly,
  upload.single("image"),
  uploadProductImage
);

router.get(
  "/notifications",
  protect,
  adminOnly,
  getNotifications,
);

router.patch(
  "/notifications/read",
  protect,
  adminOnly,
  markNotificationsAsRead,
);

export default router;