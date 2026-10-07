import { body, param, validationResult } from "express-validator";


export const createProductValidator = [

    // ============================================================
    // TITLE
    // ============================================================

   body("title")
    .exists()
    .withMessage("Title is required")
    .bail()
    .isString()
    .withMessage("Title must be a string")
    .bail()
    .trim()
    .isLength({
        min: 2,
        max: 100
    })
    .withMessage(
        "Title length must be between 2 to 100 characters"
    ),

    // ============================================================
    // DESCRIPTION
    // ============================================================

    body("description")
        .exists()
        .withMessage("Description is required")
        .bail()
        .isString()
        .withMessage("Description must be String")
        .bail()
        .trim()
        .isLength({
            min: 20,
            max: 500
        })
        .withMessage(
            "Description length must be between 20 to 500 characters"
        ),


    // ============================================================
    // CATEGORY
    // ============================================================

    body("category")
        .exists()
        .withMessage("Category is required")
        .bail()
        .isString()
        .withMessage("Category must be a string")
        .bail()
        .trim()
        .isIn([
            "shirts",
            "t-shirts",
            "bottoms",
            "oversized",
            "luxe",
            "co-ords",
            "perfumes"
        ])
        .withMessage("Invalid product category"),


    // ============================================================
    // PRICE AMOUNT
    // ============================================================

    body("price.amount")
        .exists()
        .withMessage("price amount is required")
        .bail()
        .isFloat({
            gt: 0
        })
        .withMessage(
            "price amount must be a number greater than 0"
        ),


    // ============================================================
    // PRICE CURRENCY
    // ============================================================

    body("price.currency")
        .exists()
        .withMessage("Currency is required")
        .bail()
        .isString()
        .withMessage(
            "Currency must be a string value"
        )
        .bail()
        .isIn([
            "INR",
            "USD"
        ])
        .withMessage(
            "Currency either be INR or USD"
        ),


    // ============================================================
    // SIZES / VOLUMES
    // ============================================================

    body("sizes")
        .exists()
        .withMessage("Sizes are required")
        .bail()
        .isArray()
        .withMessage(
            "Sizes must be an array of object"
        ),


    // ============================================================
    // SIZE / VOLUME VALUE
    // ============================================================

    body("sizes.*.size")
        .exists()
        .withMessage(
            "size/volume must be present in every entry of sizes array"
        )
        .bail()
        .isString()
        .withMessage(
            "size/volume must be a string value"
        )
        .bail()
        .trim()
        .isIn([
            // Clothing sizes
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
        ])
        .withMessage(
            "Size/volume must be one of XS, S, M, L, XL, XXL, 50ml, 100ml, 150ml."
        ),


    // ============================================================
    // STOCK
    // ============================================================

    body("sizes.*.stock")
        .exists()
        .withMessage(
            "stock must be present in every entry of the sizes array"
        )
        .bail()
        .isInt({
            min: 0
        })
        .withMessage(
            "Stock must be a integer value"
        ),


    // ============================================================
    // VALIDATION RESULT
    // ============================================================

    (req, res, next) => {

        const errors = validationResult(req);

        if (!errors.isEmpty()) {

            return res.status(400).json({
                message: "invalid Request",
                errors: errors.array()
            });

        }

        next();
    }

];


export const unlistProductValidator = [

    // ============================================================
    // PRODUCT ID
    // ============================================================

    param("id")
        .exists()
        .withMessage(
            "product id is required in req params"
        )
        .bail()
        .isMongoId()
        .withMessage(
            "product is must be a valid mongo object id"
        ),


    // ============================================================
    // VALIDATION RESULT
    // ============================================================

    (req, res, next) => {

        const errors = validationResult(req);

        if (!errors.isEmpty()) {

            return res.status(400).json({
                message: "invalid Data",
                errors: errors.array()
            });

        }

        next();
    }

];


export const listProductValidator = [

    // ============================================================
    // PRODUCT ID
    // ============================================================

    param("id")
        .exists()
        .withMessage(
            "product id is required in req params"
        )
        .bail()
        .isMongoId()
        .withMessage(
            "product is must be a valid mongo object id"
        ),


    // ============================================================
    // VALIDATION RESULT
    // ============================================================

    (req, res, next) => {

        const errors = validationResult(req);

        if (!errors.isEmpty()) {

            return res.status(400).json({
                message: "invalid Data",
                errors: errors.array()
            });

        }

        next();
    }

];