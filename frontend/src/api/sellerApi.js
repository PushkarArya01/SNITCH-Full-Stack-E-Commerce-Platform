import apiClient from './client';

const sellerApi = {
  // ============================================================
  // GET ALL SELLER PRODUCTS
  // ============================================================

  async getProducts() {
    const response = await apiClient.get(
      '/products/seller'
    );

    return (
      response.data?.data?.products ||
      response.data?.products ||
      []
    );
  },

  // ============================================================
  // LIST PRODUCT
  // ============================================================

  async listProduct(productId) {
    const response = await apiClient.patch(
      `/products/list/${productId}`
    );

    return response.data;
  },

  // ============================================================
  // UNLIST PRODUCT
  // ============================================================

  async unlistProduct(productId) {
    const response = await apiClient.patch(
      `/products/unlist/${productId}`
    );

    return response.data;
  },

  // ============================================================
  // CREATE PRODUCT
  // ============================================================

  async createProduct({
    title,
    description,
    category,
    amount,
    currency,
    sizes,
    images,
    imageUrls,
  }) {
    const formData = new FormData();

    // Basic information
    formData.append(
      'title',
      title
    );

    formData.append(
      'description',
      description
    );

    formData.append(
      'category',
      category
    );

    // Price
    formData.append(
      'price',
      JSON.stringify({
        amount: Number(amount),
        currency,
      })
    );

    // Sizes
    formData.append(
      'sizes',
      JSON.stringify(sizes)
    );

    // Local uploaded images
    if (images?.length) {
      images.forEach((image) => {
        formData.append(
          'images',
          image
        );
      });
    }

    // External image URLs
    formData.append(
      'imageUrls',
      JSON.stringify(
        imageUrls || []
      )
    );

    const response =
      await apiClient.post(
        '/products',
        formData
      );

    return response.data;
  },

  // ============================================================
  // UPDATE PRODUCT
  // ============================================================

  async updateProduct({
    productId,
    title,
    description,
    category,
    amount,
    currency,
    sizes,
    images,
    imageUrls,
  }) {
    const formData = new FormData();

    formData.append(
      'title',
      title
    );

    formData.append(
      'description',
      description
    );

    formData.append(
      'category',
      category
    );

    // Price
    formData.append(
      'price',
      JSON.stringify({
        amount: Number(amount),
        currency,
      })
    );

    // Sizes
    formData.append(
      'sizes',
      JSON.stringify(sizes)
    );

    // New local images
    if (images?.length) {
      images.forEach((image) => {
        formData.append(
          'images',
          image
        );
      });
    }

    // Remaining / existing image URLs
    formData.append(
      'imageUrls',
      JSON.stringify(
        imageUrls || []
      )
    );

    const response =
      await apiClient.patch(
        `/products/${productId}`,
        formData
      );

    return response.data;
  },

  // ============================================================
  // DELETE PRODUCT
  // ============================================================

  async deleteProduct(productId) {
    const response =
      await apiClient.delete(
        `/products/${productId}`
      );

    return response.data;
  },
};

export default sellerApi;