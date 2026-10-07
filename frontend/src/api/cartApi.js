import apiClient from "./client";

export const cartApi = {

    // ============================================================
    // GET CART
    // ============================================================

    async getCart() {

        const response =
            await apiClient.get("/cart");

        return response.data;

    },


    // ============================================================
    // ADD TO CART
    // ============================================================

    async addToCart({
        productId,
        quantity,
        size
    }) {

        const response =
            await apiClient.post("/cart", {

                productId,
                quantity,
                size,

            });

        return response.data;

    },


    // ============================================================
    // UPDATE QUANTITY
    // ============================================================

    async updateQuantity({
        productId,
        quantity,
        size
    }) {

        const response =
            await apiClient.patch("/cart", {

                productId,
                quantity,
                size,

            });

        return response.data;

    },


    // ============================================================
    // REMOVE FROM CART
    // ============================================================

    async removeFromCart({
        productId,
        size
    }) {

        const response =
            await apiClient.delete("/cart", {

                data: {

                    productId,
                    size,

                }

            });

        return response.data;

    },

};