import apiClient from './client';

const normalizeProduct = (product) => ({
  ...product,

  id: product.id || product._id,

  name: product.name || product.title,

  price:
    typeof product.price === 'number'
      ? product.price
      : product.price?.amount,

  sizes: Array.isArray(product.sizes)
    ? product.sizes.map((size) => {
        if (typeof size === 'string') {
          return {
            size,
            stock: 0,
          };
        }

        return {
          size: size?.size || '',
          stock: Number(size?.stock) || 0,
        };
      })
    : [],

  inStock:
    product.inStock ??
    product.sizes?.some(
      (size) => Number(size?.stock) > 0
    ) ??
    false,
});

export const productApi = {
  /**
   * Fetch all products with optional filters
   * category, search, sort
   */
  async getProducts(params = {}) {
    try {
      const response = await apiClient.get('/products', {
        params,
      });

      const products =
        response.data?.data?.products ||
        response.data?.products ||
        response.data;

      if (!Array.isArray(products)) {
        return [];
      }

      return products.map(normalizeProduct);
    } catch (err) {
      console.error('[Snitch API] Failed to fetch products:', err);
      throw err;
    }
  },

  /**
   * Fetch a single product by ID
   */
  async getProductById(id) {
    try {
      const response = await apiClient.get(`/products/${id}`);

      const product =
        response.data?.data?.product ||
        response.data?.product ||
        response.data;

      if (!product) {
        throw new Error('Product not found');
      }

      return normalizeProduct(product);
    } catch (err) {
      console.error(
        `[Snitch API] Failed to fetch product ${id}:`,
        err
      );

      throw err;
    }
  },

  /**
   * Fetch trending products from backend
   */
  async getTrendingProducts(limit = 8) {
    try {
      const response = await apiClient.get(
        `/products/trending?limit=${limit}`
      );

      const products =
        response.data?.data?.products ||
        response.data?.products ||
        response.data;

      if (!Array.isArray(products)) {
        return [];
      }

      return products.map(normalizeProduct);
    } catch (err) {
      console.error(
        '[Snitch API] Failed to fetch trending products:',
        err
      );

      throw err;
    }
  },
};

export default productApi;