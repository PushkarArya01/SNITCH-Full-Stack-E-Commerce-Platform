import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Public Pages
import HomePage from "../pages/HomePage";
import ShopPage from "../pages/ShopPage";
import ProductDetailPage from "../pages/ProductDetailPage";
import WishlistPage from "../pages/WishlistPage";
import CheckoutPage from "../pages/CheckoutPage";
import AccountPage from "../pages/AccountPage";

// Auth Pages
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";

// Seller Pages
import SellerDashboardPage from "../pages/SellerDashboardPage";
import SellerAddProductPage from "../pages/SellerAddProductPage";
import SellerEditProductPage from "../pages/SellerEditProductPage";
import SellerOrdersPage from "../pages/SellerOrdersPage";

const AppRoutes = () => {
  return (
    <Routes>
      {/* =========================
          PUBLIC ROUTES
      ========================== */}

      <Route path="/" element={<HomePage />} />

      <Route path="/shop" element={<ShopPage />} />

      <Route path="/product/:id" element={<ProductDetailPage />} />

      <Route path="/wishlist" element={<WishlistPage />} />

      <Route path="/checkout" element={<CheckoutPage />} />

      <Route path="/account" element={<AccountPage />} />

      {/* =========================
          AUTH ROUTES
      ========================== */}

      <Route path="/login" element={<LoginPage />} />

      <Route path="/register" element={<RegisterPage />} />

      {/* =========================
          SELLER ROUTES
      ========================== */}

      {/* Seller Dashboard */}
      <Route path="/seller/dashboard" element={<SellerDashboardPage />} />

      {/* Add New Product */}
      <Route path="/seller/products/new" element={<SellerAddProductPage />} />

      {/* Edit Existing Product */}
      <Route
        path="/seller/products/edit/:id"
        element={<SellerEditProductPage />}
      />

      {/* Seller Orders */}
      <Route path="/seller/orders" element={<SellerOrdersPage />} />

      {/* =========================
          UNKNOWN ROUTE
      ========================== */}

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
