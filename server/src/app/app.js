import express from "express"
import authRoutes from "../routes/auth.routes.js"
import cookieParser from "cookie-parser"
import productRoutes from "../routes/products.routes.js"
import cartRoutes from "../routes/cart.routes.js"
import orderRoutes from "../routes/order.routes.js";

const app = express()

app.use((req, res, next) => {
	const origin = req.get("origin")
	const isLocalOrigin = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin || "")

	if (origin && (origin === process.env.FRONTEND_URL || isLocalOrigin)) {
		res.setHeader("Access-Control-Allow-Origin", origin)
		res.setHeader("Access-Control-Allow-Credentials", "true")
		res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization")
		res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS")
		res.setHeader("Vary", "Origin")
	}

	if (req.method === "OPTIONS") {
		return res.sendStatus(204)
	}

	next()
})

app.use(express.json())
app.use(cookieParser())


app.use("/api/auth", authRoutes)
app.use("/api/products", productRoutes)
app.use("/api/cart", cartRoutes)
app.use("/api/orders", orderRoutes);


export default app