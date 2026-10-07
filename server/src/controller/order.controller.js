import orderModel from "../models/order.model.js";
import cartModel from "../models/cart.model.js";
import productModel from "../models/product.model.js";


// ============================================================
// GENERATE ORDER NUMBER
// ============================================================

async function generateOrderNumber() {

    let orderNumber;
    let exists = true;

    while (exists) {

        const timestamp =
            Date.now().toString().slice(-8);

        const random =
            Math.floor(
                1000 + Math.random() * 9000
            );

        orderNumber =
            `SN-${timestamp}-${random}`;

        exists = await orderModel.exists({
            orderNumber
        });
    }

    return orderNumber;
}


// ============================================================
// CREATE ORDER
// ============================================================

export async function createOrder(req, res) {

    let createdOrder = null;
    const stockUpdates = [];

    try {

        const {
            shippingAddress,
            paymentMethod = "COD"
        } = req.body;


        // --------------------------------------------------------
        // CHECK SHIPPING ADDRESS
        // --------------------------------------------------------

        if (!shippingAddress) {

            return res.status(400).json({
                message:
                    "Shipping address is required"
            });

        }


        const {
            fullName,
            phone,
            addressLine,
            city,
            state,
            pincode
        } = shippingAddress;


        if (
            !fullName ||
            !phone ||
            !addressLine ||
            !city ||
            !state ||
            !pincode
        ) {

            return res.status(400).json({
                message:
                    "Complete shipping address is required"
            });

        }


        // --------------------------------------------------------
        // CHECK PAYMENT METHOD
        // --------------------------------------------------------

        if (
            !["COD", "ONLINE"].includes(
                paymentMethod
            )
        ) {

            return res.status(400).json({
                message:
                    "Invalid payment method"
            });

        }


        // --------------------------------------------------------
        // GET USER CART
        // --------------------------------------------------------

        const cart =
            await cartModel
                .findOne({
                    user: req.user.userId
                })
                .populate(
                    "products.product"
                );


        if (
            !cart ||
            cart.products.length === 0
        ) {

            return res.status(400).json({
                message:
                    "Cart is empty"
            });

        }


        // --------------------------------------------------------
        // PREPARE ORDER ITEMS
        // --------------------------------------------------------

        const orderItems = [];

        let subtotal = 0;

        let currency = null;


        for (
            const cartItem of cart.products
        ) {

            const product =
                cartItem.product;


            // ----------------------------------------------------
            // PRODUCT STILL EXISTS?
            // ----------------------------------------------------

            if (!product) {

                return res.status(400).json({
                    message:
                        "One or more products in your cart no longer exist"
                });

            }


            // ----------------------------------------------------
            // PRODUCT STILL PUBLISHED?
            // ----------------------------------------------------

            if (!product.published) {

                return res.status(400).json({
                    message:
                        `"${product.title}" is no longer available`
                });

            }


            // ----------------------------------------------------
            // CHECK SIZE
            // ----------------------------------------------------

            const selectedSize =
                product.sizes.find(
                    (item) =>
                        item.size ===
                        cartItem.size
                );


            if (!selectedSize) {

                return res.status(400).json({
                    message:
                        `Size ${cartItem.size} is no longer available for "${product.title}"`
                });

            }


            // ----------------------------------------------------
            // CHECK STOCK
            // ----------------------------------------------------

            if (
                selectedSize.stock <
                cartItem.quantity
            ) {

                return res.status(400).json({
                    message:
                        `Insufficient stock for "${product.title}" - Size ${cartItem.size}`
                });

            }


            // ----------------------------------------------------
            // CHECK CURRENCY
            // ----------------------------------------------------

            const productCurrency =
                product.price?.currency ||
                "INR";


            if (!currency) {

                currency =
                    productCurrency;

            }


            if (
                currency !==
                productCurrency
            ) {

                return res.status(400).json({
                    message:
                        "Mixed currency products cannot be placed in one order"
                });

            }


            // ----------------------------------------------------
            // PRICE SNAPSHOT
            // ----------------------------------------------------

            const unitPrice =
                Number(
                    product.price?.amount ||
                    0
                );


            const totalPrice =
                unitPrice *
                cartItem.quantity;


            subtotal += totalPrice;


            // ----------------------------------------------------
            // CREATE ORDER ITEM SNAPSHOT
            // ----------------------------------------------------

            orderItems.push({

                product:
                    product._id,

                seller:
                    product.seller,

                title:
                    product.title,

                image:
                    product.images?.[0] ||
                    "",

                size:
                    cartItem.size,

                quantity:
                    cartItem.quantity,

                unitPrice,

                totalPrice,

                status:
                    "Pending"

            });

        }


        // --------------------------------------------------------
        // REDUCE STOCK
        // --------------------------------------------------------

        for (
            const cartItem of cart.products
        ) {

            const productId =
                cartItem.product._id;

            const size =
                cartItem.size;

            const quantity =
                cartItem.quantity;


            const updatedProduct =
                await productModel.findOneAndUpdate(

                    {
                        _id:
                            productId,

                        published:
                            true,

                        sizes: {
                            $elemMatch: {
                                size,

                                stock: {
                                    $gte:
                                        quantity
                                }
                            }
                        }
                    },

                    {
                        $inc: {
                            "sizes.$.stock":
                                -quantity
                        }
                    },

                    {
                        new: true
                    }

                );


            if (!updatedProduct) {

                throw new Error(
                    `Stock changed for product ${cartItem.product.title} (${size}). Please review your cart and try again.`
                );

            }


            stockUpdates.push({

                productId,

                size,

                quantity

            });

        }


        // --------------------------------------------------------
        // SHIPPING / DISCOUNT
        // --------------------------------------------------------

        const discountAmount = 0;

        const shippingFee = 0;


        const totalAmount =
            Math.max(
                0,
                subtotal -
                discountAmount +
                shippingFee
            );


        // --------------------------------------------------------
        // GENERATE ORDER NUMBER
        // --------------------------------------------------------

        const orderNumber =
            await generateOrderNumber();


        // --------------------------------------------------------
        // CREATE ORDER
        // --------------------------------------------------------

        createdOrder =
            await orderModel.create({

                orderNumber,

                user:
                    req.user.userId,

                items:
                    orderItems,

                shippingAddress: {

                    fullName,

                    phone,

                    addressLine,

                    city,

                    state,

                    pincode

                },

                subtotal,

                discountAmount,

                shippingFee,

                totalAmount,

                currency:
                    currency || "INR",

                paymentMethod,

                paymentStatus:
                    "Pending",

                orderStatus:
                    "Pending"

            });


        // --------------------------------------------------------
        // CLEAR CART
        // --------------------------------------------------------

        cart.products = [];

        await cart.save();


        // --------------------------------------------------------
        // RETURN ORDER
        // --------------------------------------------------------

        return res.status(201).json({

            message:
                "Order created successfully",

            data: {

                order:
                    createdOrder

            }

        });


    } catch (error) {

        console.error(
            "Create order error:",
            error
        );


        // --------------------------------------------------------
        // ROLLBACK STOCK
        // --------------------------------------------------------

        for (
            const update of stockUpdates
        ) {

            try {

                await productModel.updateOne(

                    {
                        _id:
                            update.productId,

                        "sizes.size":
                            update.size
                    },

                    {
                        $inc: {

                            "sizes.$.stock":
                                update.quantity

                        }
                    }

                );

            } catch (
                rollbackError
            ) {

                console.error(
                    "Stock rollback failed:",
                    rollbackError
                );

            }

        }


        // --------------------------------------------------------
        // DELETE ORDER IF CREATED
        // BUT CART CLEAR FAILED
        // --------------------------------------------------------

        if (createdOrder) {

            try {

                await orderModel.deleteOne({

                    _id:
                        createdOrder._id

                });

            } catch (
                deleteError
            ) {

                console.error(
                    "Order rollback failed:",
                    deleteError
                );

            }

        }


        return res.status(500).json({

            message:
                "Failed to create order",

            error:
                error.message

        });

    }

}


// ============================================================
// GET MY ORDERS
// ============================================================

export async function getMyOrders(
    req,
    res
) {

    try {

        const orders =
            await orderModel

                .find({
                    user:
                        req.user.userId
                })

                .sort({
                    createdAt: -1
                });


        return res.status(200).json({

            message:
                "Orders fetched successfully",

            data: {

                orders

            }

        });

    } catch (error) {

        console.error(
            "Get my orders error:",
            error
        );


        return res.status(500).json({

            message:
                "Failed to fetch orders",

            error:
                error.message

        });

    }

}


// ============================================================
// GET SELLER ORDERS
// ============================================================

export async function getSellerOrders(
    req,
    res
) {

    try {

        const sellerId =
            req.user.userId;


        // --------------------------------------------------------
        // FIND ORDERS WHICH CONTAIN
        // THIS SELLER'S PRODUCTS
        // --------------------------------------------------------

        const orders =
            await orderModel

                .find({
                    "items.seller":
                        sellerId
                })

                .sort({
                    createdAt: -1
                })

                .lean();


        // --------------------------------------------------------
        // RETURN ONLY THIS SELLER'S ITEMS
        // --------------------------------------------------------

        const sellerOrders =
            orders.map(
                (order) => {

                    const sellerItems =
                        order.items.filter(
                            (item) => {

                                return (
                                    item.seller &&
                                    item.seller
                                        .toString() ===
                                    sellerId
                                        .toString()
                                );

                            }
                        );


                    const sellerSubtotal =
                        sellerItems.reduce(
                            (
                                total,
                                item
                            ) => {

                                return (
                                    total +
                                    Number(
                                        item.totalPrice ||
                                        0
                                    )
                                );

                            },
                            0
                        );


                    return {

                        _id:
                            order._id,

                        orderNumber:
                            order.orderNumber,

                        user:
                            order.user,

                        shippingAddress:
                            order.shippingAddress,

                        paymentMethod:
                            order.paymentMethod,

                        paymentStatus:
                            order.paymentStatus,

                        orderStatus:
                            order.orderStatus,

                        createdAt:
                            order.createdAt,

                        updatedAt:
                            order.updatedAt,

                        sellerSubtotal,

                        items:
                            sellerItems

                    };

                }
            );


        return res.status(200).json({

            message:
                "Seller orders fetched successfully",

            data: {

                orders:
                    sellerOrders

            }

        });

    } catch (error) {

        console.error(
            "Get seller orders error:",
            error
        );


        return res.status(500).json({

            message:
                "Failed to fetch seller orders",

            error:
                error.message

        });

    }

}


// ============================================================
// UPDATE SELLER ORDER ITEM STATUS
// ============================================================

export async function updateSellerOrderStatus(
    req,
    res
) {

    try {

        const sellerId =
            req.user.userId;


        const {
            orderId
        } = req.params;


        const {
            status
        } = req.body || {};


        console.log(
            "===================================="
        );

        console.log(
            "UPDATE SELLER ORDER STATUS"
        );

        console.log(
            "Order Param:",
            orderId
        );

        console.log(
            "New Status:",
            status
        );

        console.log(
            "Seller ID:",
            sellerId
        );

        console.log(
            "===================================="
        );


        // --------------------------------------------------------
        // VALID STATUSES
        // --------------------------------------------------------

        const allowedStatuses = [

            "Pending",

            "Confirmed",

            "Processing",

            "Shipped",

            "Delivered",

            "Cancelled"

        ];


        if (
            !status
        ) {

            return res.status(400).json({

                message:
                    "Order status is required"

            });

        }


        if (
            !allowedStatuses.includes(
                status
            )
        ) {

            return res.status(400).json({

                message:
                    "Invalid order status",

                allowedStatuses

            });

        }


        // --------------------------------------------------------
        // FIND ORDER
        //
        // Support BOTH:
        // 1. MongoDB _id
        // 2. SN-XXXXXXXX-XXXX orderNumber
        // --------------------------------------------------------

        let order = null;


        const isMongoObjectId =
            /^[0-9a-fA-F]{24}$/.test(
                String(orderId)
            );


        if (isMongoObjectId) {

            order =
                await orderModel.findById(
                    orderId
                );

        }


        // If not found by MongoDB ID,
        // try orderNumber.

        if (!order) {

            order =
                await orderModel.findOne({

                    orderNumber:
                        orderId

                });

        }


        // --------------------------------------------------------
        // ORDER NOT FOUND
        // --------------------------------------------------------

        if (!order) {

            return res.status(404).json({

                message:
                    "Order not found"

            });

        }


        // --------------------------------------------------------
        // CHECK SELLER OWNS AN ITEM
        // IN THIS ORDER
        // --------------------------------------------------------

        const sellerItems =
            order.items.filter(
                (item) => {

                    return (
                        item.seller &&
                        item.seller
                            .toString() ===
                        sellerId
                            .toString()
                    );

                }
            );


        if (
            sellerItems.length === 0
        ) {

            return res.status(403).json({

                message:
                    "You are not authorized to update this order"

            });

        }


        // --------------------------------------------------------
        // UPDATE ONLY THIS SELLER'S ITEMS
        // --------------------------------------------------------

        order.items.forEach(
            (item) => {

                if (

                    item.seller &&

                    item.seller
                        .toString() ===
                    sellerId
                        .toString()

                ) {

                    item.status =
                        status;

                }

            }
        );


        // --------------------------------------------------------
        // UPDATE MAIN ORDER STATUS
        // --------------------------------------------------------

        order.orderStatus =
            status;


        // --------------------------------------------------------
        // SAVE ORDER
        // --------------------------------------------------------

        await order.save();


        // --------------------------------------------------------
        // SUCCESS RESPONSE
        // --------------------------------------------------------

        return res.status(200).json({

            message:
                "Order status updated successfully",

            data: {

                order

            }

        });


    } catch (error) {

        console.error(
            "Update seller order status error:",
            error
        );


        return res.status(500).json({

            message:
                "Failed to update order status",

            error:
                error.message

        });

    }

}