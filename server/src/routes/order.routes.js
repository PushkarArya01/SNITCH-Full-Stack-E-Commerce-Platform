import { Router } from "express";

import {
    authenticate,
    authenticateSeller
} from "../middlewares/auth.middleware.js";

import {
    createOrder,
    getMyOrders,
    getSellerOrders,
    updateSellerOrderStatus
} from "../controller/order.controller.js";

const router = Router();

// ============================================================
// GET MY ORDERS - CUSTOMER
// ============================================================

router.get(
    "/my-orders",
    authenticate,
    getMyOrders
);

// ============================================================
// GET SELLER ORDERS
// SELLER ONLY
// ============================================================

router.get(
    "/seller-orders",
    authenticate,
    authenticateSeller,
    getSellerOrders
);

// ============================================================
// UPDATE SELLER ORDER STATUS
// SELLER ONLY
// ============================================================

router.patch(
    "/:orderId/status",
    authenticate,
    authenticateSeller,
    updateSellerOrderStatus
);

// ============================================================
// CREATE ORDER
// ============================================================

router.post(
    "/",
    authenticate,
    createOrder
);

export default router;