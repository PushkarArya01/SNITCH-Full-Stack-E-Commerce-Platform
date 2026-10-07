import cartModel from "../models/cart.model.js";
import productModel from "../models/product.model.js";


// ============================================================
// ADD TO CART
// ============================================================

export async function addToCart(req, res) {

    try {

        const {
            productId,
            quantity,
            size
        } = req.body;


        // ----------------------------------------------------
        // Find product
        // ----------------------------------------------------

        const product =
            await productModel.findById(productId);

        if (!product) {

            return res.status(404).json({
                message: "Product not found"
            });

        }


        // ----------------------------------------------------
        // Find selected size
        // ----------------------------------------------------

        const selectedSize =
            product.sizes.find(
                (item) => item.size === size
            );

        if (!selectedSize) {

            return res.status(400).json({
                message: "Invalid size"
            });

        }


        // ----------------------------------------------------
        // Check stock
        // ----------------------------------------------------

        if (selectedSize.stock < quantity) {

            return res.status(400).json({
                message: "Insufficient stock"
            });

        }


        // ----------------------------------------------------
        // Find user's cart
        // ----------------------------------------------------

        let cart =
            await cartModel.findOne({
                user: req.user.userId
            });


        // ----------------------------------------------------
        // Create cart if it doesn't exist
        // ----------------------------------------------------

        if (!cart) {

            cart =
                await cartModel.create({
                    user: req.user.userId,
                    products: []
                });

        }


        // ----------------------------------------------------
        // Find same product + same size
        // ----------------------------------------------------

        const productInCart =
            cart.products.find(
                (item) =>
                    item.product.toString() === productId &&
                    item.size === size
            );


        // ----------------------------------------------------
        // Product already exists in cart
        // ----------------------------------------------------

        if (productInCart) {

            const newQuantity =
                productInCart.quantity + quantity;


            // Check stock

            if (
                newQuantity >
                selectedSize.stock
            ) {

                return res.status(400).json({
                    message: "Insufficient stock"
                });

            }


            productInCart.quantity =
                newQuantity;

            await cart.save();


            return res.status(200).json({

                message:
                    "Product quantity updated in cart"

            });

        }


        // ----------------------------------------------------
        // Product does NOT exist
        // Add as NEW item
        // Quantity will start from requested quantity
        // Normally quantity = 1
        // ----------------------------------------------------

        cart.products.push({

            product: productId,

            quantity: quantity,

            size: size

        });


        await cart.save();


        return res.status(200).json({

            message:
                "Product added to cart"

        });


    } catch (error) {

        console.error(
            "Add to cart error:",
            error
        );


        return res.status(500).json({

            message:
                "Failed to add product to cart",

            error:
                error.message

        });

    }

}


// ============================================================
// GET CART
// ============================================================

export async function getCart(req, res) {

    try {

        let cart =
            await cartModel
                .findOne({
                    user: req.user.userId
                })
                .populate("products.product");


        // ----------------------------------------------------
        // Create empty cart if it doesn't exist
        // ----------------------------------------------------

        if (!cart) {

            cart =
                await cartModel.create({

                    user: req.user.userId,

                    products: []

                });

        }


        return res.status(200).json({

            message:
                "Cart retrieved successfully",

            data: {
                cart
            }

        });


    } catch (error) {

        console.error(
            "Get cart error:",
            error
        );


        return res.status(500).json({

            message:
                "Failed to retrieve cart",

            error:
                error.message

        });

    }

}


// ============================================================
// UPDATE CART QUANTITY
// ============================================================

export async function updateCartQuantity(
    req,
    res
) {

    try {

        const {
            productId,
            quantity,
            size
        } = req.body;


        // ----------------------------------------------------
        // Find product
        // ----------------------------------------------------

        const product =
            await productModel.findById(productId);

        if (!product) {

            return res.status(404).json({
                message: "Product not found"
            });

        }


        // ----------------------------------------------------
        // Find selected size
        // ----------------------------------------------------

        const selectedSize =
            product.sizes.find(
                (item) => item.size === size
            );


        if (!selectedSize) {

            return res.status(400).json({
                message: "Invalid size"
            });

        }


        // ----------------------------------------------------
        // Check stock
        // ----------------------------------------------------

        if (
            quantity >
            selectedSize.stock
        ) {

            return res.status(400).json({

                message:
                    "Insufficient stock"

            });

        }


        // ----------------------------------------------------
        // Find user's cart
        // ----------------------------------------------------

        const cart =
            await cartModel.findOne({

                user:
                    req.user.userId

            });


        if (!cart) {

            return res.status(404).json({

                message:
                    "Cart not found"

            });

        }


        // ----------------------------------------------------
        // Find product + size
        // ----------------------------------------------------

        const productInCart =
            cart.products.find(

                (item) =>
                    item.product.toString() ===
                        productId &&
                    item.size === size

            );


        if (!productInCart) {

            return res.status(404).json({

                message:
                    "Product not found in cart"

            });

        }


        // ----------------------------------------------------
        // Update quantity
        // ----------------------------------------------------

        productInCart.quantity =
            quantity;


        await cart.save();


        return res.status(200).json({

            message:
                "Cart quantity updated successfully",

            data: {
                cart
            }

        });


    } catch (error) {

        console.error(
            "Update cart quantity error:",
            error
        );


        return res.status(500).json({

            message:
                "Failed to update cart quantity",

            error:
                error.message

        });

    }

}


// ============================================================
// REMOVE FROM CART
// ============================================================

export async function removeFromCart(
    req,
    res
) {

    try {

        const {
            productId,
            size
        } = req.body;


        // ----------------------------------------------------
        // Find user's cart
        // ----------------------------------------------------

        const cart =
            await cartModel.findOne({

                user:
                    req.user.userId

            });


        if (!cart) {

            return res.status(404).json({

                message:
                    "Cart not found"

            });

        }


        // ----------------------------------------------------
        // Find item index
        // ----------------------------------------------------

        const productIndex =
            cart.products.findIndex(

                (item) =>
                    item.product.toString() ===
                        productId &&
                    item.size === size

            );


        // ----------------------------------------------------
        // Product not found
        // ----------------------------------------------------

        if (productIndex === -1) {

            return res.status(404).json({

                message:
                    "Product not found in cart"

            });

        }


        // ----------------------------------------------------
        // IMPORTANT:
        // Completely remove item from cart
        // ----------------------------------------------------

        cart.products.splice(
            productIndex,
            1
        );


        // ----------------------------------------------------
        // Save updated cart to MongoDB
        // ----------------------------------------------------

        await cart.save();


        // ----------------------------------------------------
        // Return latest cart
        // ----------------------------------------------------

        const updatedCart =
            await cartModel
                .findOne({
                    user: req.user.userId
                })
                .populate("products.product");


        return res.status(200).json({

            message:
                "Product removed from cart successfully",

            data: {

                cart:
                    updatedCart

            }

        });


    } catch (error) {

        console.error(
            "Remove from cart error:",
            error
        );


        return res.status(500).json({

            message:
                "Failed to remove product from cart",

            error:
                error.message

        });

    }

}