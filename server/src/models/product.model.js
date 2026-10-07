import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        minLength: 2,
        maxLength: 100
    },

    description: {
        type: String,
        required: true,
        minLength: 20,
        maxLength: 500
    },

    category: {
        type: String,
        enum: [
            "shirts",
            "t-shirts",
            "bottoms",
            "oversized",
            "luxe",
            "co-ords",
            "perfumes"
        ],
        required: true
    },

    images: {
        type: [{
            type: String
        }],
        validate: {
            validator: images => images.length <= 5,
            message: "A product can have at most 5 images"
        }
    },

    price: {
        amount: {
            type: Number,
            required: true
        },

        currency: {
            type: String,
            enum: ["INR", "USD"],
            default: "INR"
        }
    },

    sizes: [
        {
            size: {
                type: String,

                enum: [
                    "XS",
                    "S",
                    "M",
                    "L",
                    "XL",
                    "XXL",

                    // Perfume volumes
                    "50ml",
                    "100ml",
                    "150ml"
                ],

                required: true
            },

            stock: {
                type: Number,
                min: 0,
                default: 0
            }
        }
    ],

    seller: {
        type: mongoose.Types.ObjectId,
        ref: "users",
        required: true
    },

    published: {
        type: Boolean,
        default: false
    }
});


const productModel = mongoose.model(
    "products",
    productSchema
);

export default productModel;


/**
 * Example Product:
 *
 * product: {
 *     title: "Test Product",
 *
 *     description: "Test product description",
 *
 *     images: [
 *         "https://imagekit.io_1",
 *         "https://imagekit.io_2"
 *     ],
 *
 *     price: {
 *         amount: 100,
 *         currency: "INR"
 *     },
 *
 *     sizes: [
 *         {
 *             size: "M",
 *             stock: 20
 *         },
 *         {
 *             size: "XL",
 *             stock: 40
 *         }
 *     ],
 *
 *     seller: seller_id
 * }
 *
 *
 * Perfume Example:
 *
 * sizes: [
 *     {
 *         size: "50ml",
 *         stock: 10
 *     },
 *     {
 *         size: "100ml",
 *         stock: 20
 *     },
 *     {
 *         size: "150ml",
 *         stock: 5
 *     }
 * ]
 */