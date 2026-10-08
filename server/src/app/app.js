import express from "express";
import cors from "cors";
import authRoutes from "../routes/auth.routes.js";
import cookieParser from "cookie-parser";
import productRoutes from "../routes/products.routes.js";
import cartRoutes from "../routes/cart.routes.js";
import orderRoutes from "../routes/order.routes.js";

const app = express();

/* ============================================================
   CORS CONFIGURATION
   ============================================================ */

const productionFrontend =
    "https://snitch-full-stack-e-commerce-platform.vercel.app";

const allowedOrigins = [
    productionFrontend,
    process.env.FRONTEND_URL,
    "http://localhost:5173",
    "http://localhost:3000",
].filter(Boolean);

app.use(
    cors({
        origin: (origin, callback) => {
            // Allow requests without an Origin header
            // such as Postman/server-to-server requests.
            if (!origin) {
                return callback(null, true);
            }

            if (allowedOrigins.includes(origin)) {
                return callback(null, true);
            }

            return callback(
                new Error(`CORS blocked origin: ${origin}`)
            );
        },

        credentials: true,

        methods: [
            "GET",
            "POST",
            "PATCH",
            "DELETE",
            "OPTIONS",
        ],

        allowedHeaders: [
            "Content-Type",
            "Authorization",
        ],
    })
);

/* ============================================================
   BODY PARSERS
   ============================================================ */

app.use(express.json());

app.use(cookieParser());

/* ============================================================
   ROUTES
   ============================================================ */

app.use("/api/auth", authRoutes);

app.use("/api/products", productRoutes);

app.use("/api/cart", cartRoutes);

app.use("/api/orders", orderRoutes);

export default app;