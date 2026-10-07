import { Router } from "express"
import { registerValidator, loginValidator } from "../validators/auth.validator.js"
import { register, login, refresh, getMe, logout } from "../controller/auth.controller.js"
import { authenticate } from "../middlewares/auth.middleware.js"



const router = Router()


/**
 * @POST /api/auth/register
 * @param req Express req
 * @param req.body = { email,name,password }
 * @response res.status = 201 (if successful)
 */
router.post("/register", registerValidator, register)


/**
 * @POST /api/auth/login
 * @param req
 * @param req.body = {email,password}
 * res.status = 200
 */
router.post("/login", loginValidator, login)


/**
 * @POST /api/auth/refresh
 */
router.post('/refresh', refresh)


/**
 * @post /api/auth/logout
 */
router.post('/logout', logout)



/**
 * @GET /api/auth/me
 */
router.get("/me", authenticate, getMe)


export default router