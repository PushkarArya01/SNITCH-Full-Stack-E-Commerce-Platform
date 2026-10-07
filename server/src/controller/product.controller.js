import productModel from "../models/product.model.js"
import cartModel from "../models/cart.model.js";
import { uploadFile } from "../services/storage.service.js"


export async function createProduct(req, res) {

    try {

        console.log(req.body)
        console.log(req.files)

        // ============================================================
        // IMAGE URLS
        // ============================================================

        let imageUrls = []

        if (req.body.imageUrls) {

            if (typeof req.body.imageUrls === "string") {
                imageUrls = JSON.parse(req.body.imageUrls)
            } else if (Array.isArray(req.body.imageUrls)) {
                imageUrls = req.body.imageUrls
            }

        }

        // Check valid image URLs
        imageUrls = imageUrls.filter((url) => {
            return (
                typeof url === "string" &&
                /^https?:\/\/.+/i.test(url.trim())
            )
        })


        // ============================================================
        // CHECK MAX 5 IMAGES
        // ============================================================

        const uploadedImagesCount = req.files?.length || 0
        const urlImagesCount = imageUrls.length

        if (uploadedImagesCount + urlImagesCount > 5) {

            return res.status(400).json({
                message: "A product can have maximum 5 images"
            })

        }


        // ============================================================
        // UPLOAD LOCAL IMAGES
        // ============================================================

        const filesUrls = []

        if (req.files && req.files.length > 0) {

            for (let i = 0; i < req.files.length; i++) {

                const response = await uploadFile({

                    buffer: req.files[i].buffer,

                    fileName: req.files[i].originalname

                })

                filesUrls.push(response.url)
            }

        }


        console.log("Uploaded image URLs:", filesUrls)
        console.log("External image URLs:", imageUrls)


        // ============================================================
        // COMBINE BOTH TYPES OF IMAGES
        // ============================================================

        const allImages = [
            ...filesUrls,
            ...imageUrls
        ]


        // ============================================================
        // CREATE PRODUCT
        // ============================================================

        const product = await productModel.create({

            title: req.body.title,

            description: req.body.description,

            category: req.body.category,

            price: {
                amount: req.body.price.amount,
                currency: req.body.price.currency
            },

            sizes: req.body.sizes,

            images: allImages,

            seller: req.user.userId

        })


        return res.status(201).json({

            message: "Product created successfully",

            data: {
                product
            }

        })


    } catch (error) {

        console.error("Create product error:", error)

        return res.status(500).json({

            message: "Failed to create product",

            error: error.message

        })

    }

}

export async function listAllProducts(req, res) {
  try {
    const { search, category, sort } = req.query;

    const filter = {
      published: true,
    };

    // Search by product title or description
    if (search?.trim()) {
      const searchText = search.trim();

      filter.$or = [
        {
          title: {
            $regex: searchText,
            $options: "i",
          },
        },
        {
          description: {
            $regex: searchText,
            $options: "i",
          },
        },
      ];
    }

    // Filter by category
    if (category?.trim()) {
      filter.category = category.trim();
    }

    // Sort products
    let sortOption = {};

    if (sort === "price-low") {
      sortOption = {
        "price.amount": 1,
      };
    }

    if (sort === "price-high") {
      sortOption = {
        "price.amount": -1,
      };
    }

    const products = await productModel
      .find(filter)
      .sort(sortOption);

    return res.status(200).json({
      message: "Products data fetched successfully",
      data: {
        products,
      },
    });
  } catch (error) {
    console.error("List products error:", error);

    return res.status(500).json({
      message: "Failed to fetch products",
      error: error.message,
    });
  }
}

// ============================================================
// TRENDING PRODUCTS
// Based on products currently present in users' carts
// ============================================================

export async function getTrendingProducts(req, res) {
  try {
    let limit = Number(req.query.limit) || 8;

    // Keep API safe
    if (limit < 1) {
      limit = 1;
    }

    if (limit > 20) {
      limit = 20;
    }

    const trendingProducts = await cartModel.aggregate([
      // Cart ke products ko individual documents mein convert karo
      {
        $unwind: "$products",
      },

      // Same product ki total cart quantity calculate karo
      {
        $group: {
          _id: "$products.product",
          score: {
            $sum: "$products.quantity",
          },
          userCount: {
            $addToSet: "$user",
          },
        },
      },

      // User count calculate karo
      {
        $project: {
          _id: 1,
          score: 1,
          userCount: {
            $size: "$userCount",
          },
        },
      },

      // Pehle quantity, phir unique users ke basis par sort
      {
        $sort: {
          score: -1,
          userCount: -1,
        },
      },

      // Sirf required number of products
      {
        $limit: limit,
      },

      // Product details fetch karo
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product",
        },
      },

      {
        $unwind: "$product",
      },

      // Sirf published products show karo
      {
        $match: {
          "product.published": true,
        },
      },

      // Response mein product return karo
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: [
              "$product",
              {
                trendingScore: "$score",
                trendingUsers: "$userCount",
              },
            ],
          },
        },
      },
    ]);

    // Agar carts mein abhi koi product nahi hai,
    // to newest published products fallback honge.
    if (trendingProducts.length === 0) {
      const fallbackProducts = await productModel
        .find({
          published: true,
        })
        .sort({
          createdAt: -1,
        })
        .limit(limit);

      return res.status(200).json({
        message: "Trending products fetched successfully",
        data: {
          products: fallbackProducts,
        },
      });
    }

    return res.status(200).json({
      message: "Trending products fetched successfully",
      data: {
        products: trendingProducts,
      },
    });
  } catch (error) {
    console.error("Trending products error:", error);

    return res.status(500).json({
      message: "Failed to fetch trending products",
      error: error.message,
    });
  }
}

export async function listAllProductsToSeller(req, res) {

    try {

        const products = await productModel.find({})

        return res.status(200).json({

            message: "All products fetched successfully",

            data: {
                products
            }

        })

    } catch (error) {

        console.error("Seller products error:", error)

        return res.status(500).json({

            message: "Failed to fetch seller products",

            error: error.message

        })

    }

}


export async function unlistProduct(req, res) {

    try {

        const { id } = req.params


        const product = await productModel.findById(id)

        if (!product) {

            return res.status(404).json({

                message: "product not found by id"

            })

        }


        await productModel.findByIdAndUpdate(
            id,
            {
                published: false
            }
        )


        return res.status(200).json({

            message: "Product unpublished successfully"

        })

    } catch (error) {

        console.error("Unlist product error:", error)

        return res.status(500).json({

            message: "Failed to unlist product",

            error: error.message

        })

    }

}


export async function listProduct(req, res) {

    try {

        const { id } = req.params


        const product = await productModel.findById(id)

        if (!product) {

            return res.status(404).json({

                message: "product not found by id"

            })

        }


        await productModel.findByIdAndUpdate(
            id,
            {
                published: true
            }
        )


        return res.status(200).json({

            message: "Product published successfully"

        })

    } catch (error) {

        console.error("List product error:", error)

        return res.status(500).json({

            message: "Failed to list product",

            error: error.message

        })

    }

}


export async function getProductById(req, res) {

    try {

        const product = await productModel.findOne({

            _id: req.params.id,

            published: true

        })


        if (!product) {

            return res.status(404).json({

                message: "Product not found"

            })

        }


        return res.status(200).json({

            message: "Product data fetched successfully",

            data: {
                product
            }

        })

    } catch (error) {

        console.error("Get product error:", error)

        return res.status(500).json({

            message: "Failed to fetch product",

            error: error.message

        })

    }

}


// ============================================================
// UPDATE PRODUCT
// ============================================================

export async function updateProduct(req, res) {
    try {

        const { id } = req.params

        // Sirf seller ka apna product update hoga
        const product = await productModel.findOne({
            _id: id,
            seller: req.user.userId
        })

        if (!product) {
            return res.status(404).json({
                message: "Product not found or you are not the owner"
            })
        }

        // Agar multipart/form-data se data aa raha hai
        if (req.body?.price && typeof req.body.price === "string") {
            req.body.price = JSON.parse(req.body.price)
        }

        if (req.body?.sizes && typeof req.body.sizes === "string") {
            req.body.sizes = JSON.parse(req.body.sizes)
        }

        // Basic product fields update
        if (req.body.title !== undefined) {
            product.title = req.body.title
        }

        if (req.body.description !== undefined) {
            product.description = req.body.description
        }

        if (req.body.category !== undefined) {
            product.category = req.body.category
        }

        if (req.body.price !== undefined) {
            product.price = {
                amount: Number(req.body.price.amount),
                currency: req.body.price.currency
            }
        }

        if (req.body.sizes !== undefined) {
            product.sizes = req.body.sizes
        }

        // Agar new images upload hui hain
        if (req.files && req.files.length > 0) {

            const filesUrls = []

            for (let i = 0; i < req.files.length; i++) {

                const response = await uploadFile({
                    buffer: req.files[i].buffer,
                    fileName: req.files[i].originalname
                })

                filesUrls.push(response.url)
            }

            // New images old images ko replace karengi
            product.images = filesUrls
        }

        await product.save()

        return res.status(200).json({
            message: "Product updated successfully",
            data: {
                product
            }
        })

    } catch (error) {

        console.error("Update product error:", error)

        return res.status(500).json({
            message: "Failed to update product",
            error: error.message
        })
    }
}


// ============================================================
// DELETE PRODUCT
// ============================================================

export async function deleteProduct(req, res) {
    try {

        const { id } = req.params

        // Sirf seller ka apna product delete hoga
        const product = await productModel.findOneAndDelete({
            _id: id,
            seller: req.user.userId
        })

        if (!product) {
            return res.status(404).json({
                message: "Product not found or you are not the owner"
            })
        }

        return res.status(200).json({
            message: "Product deleted successfully"
        })

    } catch (error) {

        console.error("Delete product error:", error)

        return res.status(500).json({
            message: "Failed to delete product",
            error: error.message
        })
    }
}

