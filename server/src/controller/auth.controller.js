import userModel from "../models/user.model.js";
import bcrypt from "bcrypt";

import {
    createAccessToken,
    createRefreshToken,
    readRefreshToken
} from "../utils/auth.utils.js";


/**
 * Register an user and save the data from req.body
 */
export async function register(req, res) {

    const {
        email,
        name,
        password,
        phone
    } = req.body;

    const isUserAlreadyExists = await userModel.findOne({
        email
    });

    if (isUserAlreadyExists) {
        return res.status(400).json({
            message: "User already exists with this email address",
            errors: [
                {
                    path: "email",
                    msg: "User already exists with this email address"
                }
            ]
        });
    }

    const user = await userModel.create({
        email,
        name,
        phone,
        passwordHash: await bcrypt.hash(password, 12)
    });

    const accessToken = createAccessToken({
        userId: user._id,
        role: user.role
    });

    const refreshToken = createRefreshToken({
        userId: user._id,
        role: user.role
    });

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true
    });

    await userModel.findByIdAndUpdate(user._id, {
        refreshToken
    });

    return res.status(201).json({
        message: "User Registered Successfully",
        data: {
            user: {
                email: user.email,
                name: user.name,
                phone: user.phone,
                id: user._id,
                role: user.role
            },
            accessToken
        }
    });
}


/**
 * Login a user and create new accessToken and refreshToken
 */
export async function login(req, res) {

    const {
        email,
        password
    } = req.body;

    const user = await userModel.findOne({
        email
    });

    if (!user) {
        return res.status(400).json({
            message: "Invalid email or password"
        });
    }

    const isPasswordValid = await bcrypt.compare(
        password,
        user.passwordHash
    );

    if (!isPasswordValid) {
        return res.status(400).json({
            message: "Invalid email or password"
        });
    }

    const accessToken = createAccessToken({
        userId: user._id,
        role: user.role
    });

    const refreshToken = createRefreshToken({
        userId: user._id,
        role: user.role
    });

    await userModel.findOneAndUpdate(
        {
            email
        },
        {
            refreshToken
        }
    );

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true
    });

    return res.status(200).json({
        message: "user loggedIn successfully",
        data: {
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                phone: user.phone,
                role: user.role
            },
            accessToken
        }
    });
}


/**
 * Refresh access token
 */
export async function refresh(req, res) {

    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        return res.status(401).json({
            message: "Refresh token is required."
        });
    }

    try {

        const decoded = readRefreshToken(refreshToken);

        const {
            userId
        } = decoded;

        const user = await userModel.findById(userId);

        if (!user) {
            return res.status(401).json({
                message: "User not found"
            });
        }

        if (refreshToken !== user.refreshToken) {

            await userModel.findByIdAndUpdate(
                user._id,
                {
                    refreshToken: null
                }
            );

            return res.status(401).json({
                message: "Refresh token mismatch"
            });
        }

        /*
         * Always take the latest role from database.
         * This prevents an old refresh token from keeping
         * an outdated role.
         */
        const accessToken = createAccessToken({
            userId: user._id,
            role: user.role
        });

        const newRefreshToken = createRefreshToken({
            userId: user._id,
            role: user.role
        });

        await userModel.findByIdAndUpdate(
            user._id,
            {
                refreshToken: newRefreshToken
            }
        );

        res.cookie("refreshToken", newRefreshToken, {
            httpOnly: true
        });

        return res.status(200).json({
            message: "Tokens rotated successfully.",
            data: {
                user: {
                    email: user.email,
                    name: user.name,
                    phone: user.phone,
                    id: user._id,
                    role: user.role
                },
                accessToken
            }
        });

    } catch (err) {

        console.error("Refresh token error:", err);

        return res.status(401).json({
            message: "Invalid refresh Token"
        });
    }
}


/**
 * Get current logged-in user
 */
export async function getMe(req, res) {

    const {
        userId
    } = req.user;

    const user = await userModel.findById(userId);

    if (!user) {
        return res.status(404).json({
            message: "User not found"
        });
    }

    return res.status(200).json({
        message: "User data fetch successfully",
        data: {
            user: {
                email: user.email,
                name: user.name,
                phone: user.phone,
                id: user._id,
                role: user.role
            }
        }
    });
}


/**
 * Logout user
 */
export async function logout(req, res) {

    try {

        const refreshToken = req.cookies.refreshToken;

        if (refreshToken) {

            await userModel.findOneAndUpdate(
                {
                    refreshToken
                },
                {
                    refreshToken: null
                }
            );
        }

        res.clearCookie("refreshToken", {
            httpOnly: true
        });

        return res.status(200).json({
            message: "User logged out successfully"
        });

    } catch (error) {

        console.error("Logout error:", error);

        return res.status(500).json({
            message: "Logout failed"
        });
    }
}