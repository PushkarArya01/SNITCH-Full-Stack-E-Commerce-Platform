import apiClient from './client';

export const orderApi = {
  // ============================================================
  // CREATE ORDER
  // ============================================================

  async createOrder(orderData) {
    try {
      const response = await apiClient.post(
        '/orders',
        orderData
      );

      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // ============================================================
  // GET MY ORDERS
  // ============================================================

  async getUserOrders() {
    const response = await apiClient.get(
      `/orders/my-orders?_t=${Date.now()}`
    );

    return response.data;
  },

  async getSellerOrders() {
  const response = await apiClient.get(
    `/orders/seller-orders?_t=${Date.now()}`
  );

  return response.data;
},

// ============================================================
// UPDATE SELLER ORDER STATUS
// ============================================================

async updateSellerOrderStatus(orderId, status) {
  const response = await apiClient.patch(
    `/orders/${orderId}/status`,
    {
      status,
    }
  );

  return response.data;
},

};

