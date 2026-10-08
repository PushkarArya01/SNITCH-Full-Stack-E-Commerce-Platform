# SNITCH — Full-Stack E-Commerce Platform

SNITCH is a modern full-stack fashion e-commerce platform built for customers and sellers.  
It provides product browsing, authentication, cart management, wishlist, checkout, order management, and a dedicated seller dashboard.

---
## 🌐 Live Demo

🚀 **Live Website:**  


📦 **GitHub Repository:**  
https://github.com/PushkarArya01/SNITCH-Full-Stack-E-Commerce-Platform

## 🚀 Features

### 👤 Authentication
- User Registration & Login
- JWT Access Token Authentication
- Refresh Token Integration
- Protected Routes
- Logout
- User Profile
- Role-based access control
- Customer & Seller roles

### 🛍️ Shopping
- Browse Products
- Product Details
- Search Products
- Category Filtering
- Product Sorting
- Trending Products
- Size-based Stock Management
- Perfume Volume Selection
- Out-of-stock Handling

### 🛒 Cart
- Add products to cart
- Select size/volume
- Increase/decrease quantity
- Remove products
- One cart per user
- Backend-synchronized cart

### ❤️ Wishlist
- Add/remove products from wishlist
- Wishlist page
- Wishlist state management

### 📦 Orders
- Checkout
- Shipping Address
- Cash on Delivery
- Order Creation
- Customer Order History
- Seller Order Management
- Order Status Updates
- Seller-specific order filtering

### 🧑‍💼 Seller Dashboard
- Seller-only dashboard
- Add Products
- Edit Products
- Delete Products
- List/Unlist Products
- Product Stock Management
- Product Image Upload
- Seller Order Management

---

## 🛠️ Tech Stack

### Frontend
- React.js
- Vite
- Tailwind CSS
- React Router
- Axios
- Lucide React

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- Multer

### Storage
- ImageKit

---

## 📁 Project Structure

```text
SNITCH/
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── routes/
│   │   └── App.jsx
│   │
│   ├── package.json
│   └── vite.config.js
│
├── server/
│   ├── src/
│   │   ├── controller/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middlewares/
│   │   └── app/
│   │
│   ├── package.json
│   └── .env
│
└── README.md
