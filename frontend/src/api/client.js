import axios from 'axios';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  'http://localhost:3000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 5000,
  withCredentials: true,
});

// ============================================
// REQUEST INTERCEPTOR
// Attach Access Token to every request
// ============================================

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('snitch_token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ============================================
// REFRESH TOKEN CONTROL
// Prevent multiple refresh requests
// ============================================

let refreshPromise = null;

// ============================================
// RESPONSE INTERCEPTOR
// Handle 401 → Refresh Token → Retry Request
// ============================================

apiClient.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    // Check if request needs token refresh
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/refresh')
    ) {
      originalRequest._retry = true;

      try {
        // If refresh is already running,
        // wait for the same refresh request
        if (!refreshPromise) {
          refreshPromise = apiClient
            .post('/auth/refresh')
            .then((response) => {
              const newAccessToken =
                response.data.data.accessToken;

              // Save new access token
              localStorage.setItem(
                'snitch_token',
                newAccessToken
              );

              return newAccessToken;
            })
            .finally(() => {
              // Allow future refresh requests
              refreshPromise = null;
            });
        }

        // Wait for refresh request
        const newAccessToken = await refreshPromise;

        // Attach new token to original request
        originalRequest.headers =
          originalRequest.headers || {};

        originalRequest.headers.Authorization =
          `Bearer ${newAccessToken}`;

        // Retry original request
        return apiClient(originalRequest);

      } catch (refreshError) {
        // Refresh failed → logout locally
        localStorage.removeItem('snitch_token');
        localStorage.removeItem('snitch_user');

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;