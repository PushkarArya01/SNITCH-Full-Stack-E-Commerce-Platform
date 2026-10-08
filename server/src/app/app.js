import express from "express";
import authRoutes from "../routes/auth.routes.js";
import cookieParser from "cookie-parser";
import productRoutes from "../routes/products.routes.js";
import cartRoutes from "../routes/cart.routes.js";
import orderRoutes from "../routes/order.routes.js";

const app = express();

// ============================================================
// CORS CONFIGURATION
// ============================================================

const allowedOrigins = [
    process.env.FRONTEND_URL,
    "https://snitch-full-stack-e-commerce-platform.vercel.app",
].filter(Boolean);

app.use((req, res, next) => {
    const origin = req.headers.origin;

    const isLocalOrigin =
        /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(
            origin || ""
        );

    const isAllowedOrigin =
        origin &&
        (allowedOrigins.includes(origin) || isLocalOrigin);

    if (isAllowedOrigin) {
        res.setHeader(
            "Access-Control-Allow-Origin",
            origin
        );

        res.setHeader(
            "Access-Control-Allow-Credentials",
            "true"
        );

        res.setHeader(
            "Access-Control-Allow-Headers",
            "Content-Type, Authorization"
        );

        res.setHeader(
            "Access-Control-Allow-Methods",
            "GET, POST, PATCH, DELETE, OPTIONS"
        );

        res.setHeader(
            "Vary",
            "Origin"
        );
    }

    // Handle preflight request
    if (req.method === "OPTIONS") {
        return res.sendStatus(204);
    }

    next();
});

// ============================================================
// BODY PARSERS
// ============================================================

app.use(express.json());

app.use(cookieParser());

// ============================================================
// ROUTES
// ============================================================

app.use("/api/auth", authRoutes);

app.use("/api/products", productRoutes);

app.use("/api/cart", cartRoutes);

app.use("/api/orders", orderRoutes);

export default app;