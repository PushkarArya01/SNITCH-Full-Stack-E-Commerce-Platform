import { Router } from "express"

import {
    createProductValidator,
    unlistProductValidator,
    listProductValidator
} from "../validators/product.validator.js"

import {
    authenticate,
    authenticateSeller
} from "../middlewares/auth.middleware.js"

import {
    createProduct,
    listAllProducts,
    getTrendingProducts,
    listAllProductsToSeller,
    unlistProduct,
    listProduct,
    getProductById,
    updateProduct,
    deleteProduct
} from "../controller/product.controller.js"

import multer from "multer"


const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        files: 5,
        fileSize: 5 * 1024 * 1024 // 5MB
    },
})


const router = Router()


/**
 * @method POST
 * @route /api/products/
 * @description creates the product and save its data into the DB, images will be store on imagekit.
 * @access seller
 * req.body => {
 *   title,
 *   description,
 *   price: { amount, currency },
 *   sizes: [{ size, stock }, { size, stock }]
 * }
 */
router.post(
    "/",

    // check is user authenticate
    authenticate,

    // check the role is seller or not
    authenticateSeller,

    // required for reading the data from req.body if the format is form-data (multipart/form-data)
    upload.array("images"),

    // parse the complex data like object and array into JSON
    (req, res, next) => {

        req.body?.price &&
            (req.body.price = JSON.parse(req.body.price))

        req.body?.sizes &&
            (req.body.sizes = JSON.parse(req.body.sizes))

        next()
    },

    createProductValidator,

    createProduct
)


/**
 * @method GET
 * @route /api/products
 * @description Read all the published products from the DB
 * @access user
 */
router.get(
    "/",
    listAllProducts
)


/**
 * @method GET
 * @route /api/products/seller
 * @description Read all the products from the DB
 * @access seller
 */
router.get(
    "/seller",
    authenticate,
    authenticateSeller,
    listAllProductsToSeller
)


/**
 * @method PATCH
 * @route /api/products/unlist/:id
 * @description Unlist a product by its ID
 * @access seller
 */
router.patch(
    "/unlist/:id",
    authenticate,
    authenticateSeller,
    unlistProductValidator,
    unlistProduct
)


/**
 * @method PATCH
 * @route /api/products/list/:id
 * @description List a product by its ID
 * @access seller
 */
router.patch(
    "/list/:id",
    authenticate,
    authenticateSeller,
    listProductValidator,
    listProduct
)


/**
 * @method GET
 * @route /api/products/trending
 * @description Get trending published products
 * @access public
 */
router.get(
    "/trending",
    getTrendingProducts
)


/**
 * @method GET
 * @route /api/products/:id
 * @description Get a single product by ID
 * @access public
 */
router.get(
    "/:id",
    getProductById
)

// ============================================================
// UPDATE PRODUCT - SELLER ONLY
// ============================================================

router.patch(
    "/:id",
    authenticate,
    authenticateSeller,
    upload.array("images", 5),
    (req, res, next) => {

        if (req.body?.price) {
            req.body.price = JSON.parse(req.body.price)
        }

        if (req.body?.sizes) {
            req.body.sizes = JSON.parse(req.body.sizes)
        }

        next()
    },
    updateProduct
)


// ============================================================
// DELETE PRODUCT - SELLER ONLY
// ============================================================

router.delete(
    "/:id",
    authenticate,
    authenticateSeller,
    deleteProduct
)

export default router