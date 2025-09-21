import axios from "axios";
import Cookies from "js-cookie";
import toast from "react-hot-toast";

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      Cookies.remove("token");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post("/auth/register", userData),
  sendOTP: (userData) => api.post("/auth/send-otp", userData),
  verifyOTP: (otpData) => api.post("/auth/verify-otp", otpData),
  verifyOTPOnly: (otpData) => api.post("/auth/verify-otp-only", otpData),
  login: (credentials) => api.post("/auth/login", credentials),
  getProfile: () => api.get("/auth/profile"),
  updateProfile: (userData) => api.put("/auth/profile", userData),
  changePassword: (passwordData) => api.put("/auth/password", passwordData),
  updateAvatar: (formData) =>
    api.put("/auth/avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  logout: () => api.post("/auth/logout"),
  // Password Reset
  forgotPassword: (email) =>
    api.post("/password-reset/forgot-password", { email }),
  verifyResetOTP: (data) => api.post("/password-reset/verify-otp", data),
  resetPassword: (data) => api.post("/password-reset/reset-password", data),
};

// Products API
export const productsAPI = {
  getProducts: (params) => api.get("/products", { params }),
  getFeaturedProducts: () => api.get("/products/featured"),
  getCategories: () => api.get("/products/categories"),
  getProduct: (id) => api.get(`/products/${id}`),
  createProduct: (formData) =>
    api.post("/products", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  updateProduct: (id, formData) =>
    api.put(`/products/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  deleteProduct: (id) => api.delete(`/products/${id}`),
  addReview: (id, reviewData) =>
    api.post(`/products/${id}/reviews`, reviewData),
};

// Orders API
export const ordersAPI = {
  createOrder: (orderData) => api.post("/orders", orderData),
  getMyOrders: (params) => api.get("/orders/my-orders", { params }),
  getOrder: (id) => api.get(`/orders/${id}`),
  cancelOrder: (id) => api.put(`/orders/${id}/cancel`),
  getAllOrders: (params) => api.get("/orders/admin/all", { params }),
  updateOrderStatus: (id, statusData) =>
    api.put(`/orders/${id}/status`, statusData),
};

// Subscriptions API
export const subscriptionsAPI = {
  createSubscription: (subscriptionData) =>
    api.post("/subscriptions", subscriptionData),
  getMySubscriptions: (params) =>
    api.get("/subscriptions/my-subscriptions", { params }),
  getSubscription: (id) => api.get(`/subscriptions/${id}`),
  pauseSubscription: (id, reason) =>
    api.put(`/subscriptions/${id}/pause`, { reason }),
  resumeSubscription: (id) => api.put(`/subscriptions/${id}/resume`),
  cancelSubscription: (id, reason) =>
    api.put(`/subscriptions/${id}/cancel`, { reason }),
  updateShippingAddress: (id, shippingAddress) =>
    api.put(`/subscriptions/${id}/shipping-address`, { shippingAddress }),
  getAllSubscriptions: (params) =>
    api.get("/subscriptions/admin/all", { params }),
  getDueRenewals: () => api.get("/subscriptions/admin/due-renewals"),
};

// Payments API
export const paymentsAPI = {
  createPaymentIntent: (paymentData) =>
    api.post("/payments/create-payment-intent", paymentData),
  createSubscription: (subscriptionData) =>
    api.post("/payments/create-subscription", subscriptionData),
  cancelSubscription: (subscriptionData) =>
    api.post("/payments/cancel-subscription", subscriptionData),
  getPaymentMethods: () => api.get("/payments/payment-methods"),
  getConfig: () => api.get("/payments/config"),
};

// Feedback API
export const feedbackAPI = {
  submitFeedback: (feedbackData) => api.post("/feedback/submit", feedbackData),
};

// Wishlist API
export const wishlistAPI = {
  getWishlist: () => api.get("/wishlist"),
  addToWishlist: (productId) => api.post("/wishlist/add", { productId }),
  removeFromWishlist: (productId) =>
    api.delete(`/wishlist/remove/${productId}`),
  clearWishlist: () => api.delete("/wishlist/clear"),
  checkWishlist: (productId) => api.get(`/wishlist/check/${productId}`),
};

// Utility functions
export const handleApiError = (error) => {
  const message =
    error.response?.data?.message || error.message || "An error occurred";
  toast.error(message);
  return message;
};

export const uploadFile = async (file, endpoint) => {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await api.post(endpoint, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

export default api;
