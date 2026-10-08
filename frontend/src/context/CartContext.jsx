import React, {
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";

import {
  FREE_SHIPPING_THRESHOLD,
  SHIPPING_FEE,
  AVAILABLE_COUPONS,
} from "../utils/constants";

import { cartApi } from "../api/cartApi";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  // ============================================================
  // AUTH
  // ============================================================

  const { token } = useAuth();

  // ============================================================
  // CART STATE
  // Backend is the source of truth
  // ============================================================

  const [cartItems, setCartItems] = useState([]);
  const [cartLoading, setCartLoading] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // ============================================================
  // COUPON STATE
  // ============================================================

  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState("");

  // ============================================================
  // HELPER FUNCTIONS
  // ============================================================

  const getProductId = (product) => {
    if (!product) return null;

    if (typeof product === "string") {
      return String(product);
    }

    return String(
      product.id ||
        product._id ||
        product
    );
  };

  const getProductName = (product) => {
    if (!product) return "Product";

    return (
      product.name ||
      product.title ||
      "Product"
    );
  };

  const getProductPrice = (product) => {
    if (!product) return 0;

    // Backend format:
    // price: {
    //   amount: 988,
    //   currency: "INR"
    // }

    if (
      typeof product.price === "object" &&
      product.price !== null
    ) {
      return Number(product.price.amount) || 0;
    }

    // Support number format also
    return Number(product.price) || 0;
  };

  // ============================================================
  // LOAD CART FROM BACKEND
  // ============================================================

  const loadCart = async () => {
    // User logged out
    if (!token) {
      setCartItems([]);
      return;
    }

    try {
      setCartLoading(true);

      const data = await cartApi.getCart();

      const backendCart = data?.data?.cart;

      if (backendCart?.products) {
        // Remove broken cart items where product
        // has been deleted from database.
        setCartItems(
          backendCart.products.filter(
            (item) => item && item.product
          )
        );
      } else {
        setCartItems([]);
      }
    } catch (error) {
      // Keep expected cart loading errors silent.
      setCartItems([]);
    } finally {
      setCartLoading(false);
    }
  };

  // Load cart whenever login token changes
  useEffect(() => {
    loadCart();
  }, [token]);

  // ============================================================
  // CART UI
  // ============================================================

  const openCart = () => {
    setIsCartOpen(true);
  };

  const closeCart = () => {
    setIsCartOpen(false);
  };

  const toggleCart = () => {
    setIsCartOpen((prev) => !prev);
  };

  // ============================================================
  // ADD TO CART
  // ============================================================

  const addToCart = async (
    product,
    size,
    quantity = 1
  ) => {
    try {
      const productId = getProductId(product);

      if (!productId) {
        return {
          success: false,
          message: "Invalid product",
        };
      }

      if (!size) {
        return {
          success: false,
          message: "Please select a size",
        };
      }

      const finalQuantity = Number(quantity);

      if (
        !Number.isInteger(finalQuantity) ||
        finalQuantity < 1
      ) {
        return {
          success: false,
          message: "Invalid quantity",
        };
      }

      // --------------------------------------------------------
      // FRONTEND STOCK CHECK
      // --------------------------------------------------------

      const selectedSize = product?.sizes?.find(
        (item) => item?.size === size
      );

      const availableStock =
        Number(selectedSize?.stock) || 0;

      // Check current quantity already in cart
      const existingCartItem = cartItems.find(
        (item) => {
          const itemProductId =
            getProductId(item?.product);

          return (
            String(itemProductId) ===
              String(productId) &&
            item?.size === size
          );
        }
      );

      const currentCartQuantity =
        Number(existingCartItem?.quantity) || 0;

      const requestedTotal =
        currentCartQuantity + finalQuantity;

      // --------------------------------------------------------
      // STOP BEFORE API CALL
      // --------------------------------------------------------

      if (requestedTotal > availableStock) {
        return {
          success: false,
          message: "Insufficient stock",
        };
      }

      // --------------------------------------------------------
      // ADD PRODUCT TO BACKEND
      // --------------------------------------------------------

      await cartApi.addToCart({
        productId,
        quantity: finalQuantity,
        size,
      });

      // --------------------------------------------------------
      // ALWAYS GET FRESH CART FROM BACKEND
      // --------------------------------------------------------

      await loadCart();

      // Open cart drawer
      setIsCartOpen(true);

      return {
        success: true,
      };
    } catch (error) {
      // Keep expected backend errors silent.
      return {
        success: false,
        message:
          error?.response?.data?.message ||
          "Failed to add product to cart",
      };
    }
  };

  // ============================================================
  // REMOVE FROM CART
  // ============================================================

  const removeFromCart = async (
    productId,
    size
  ) => {
    try {
      const normalizedProductId =
        String(productId);

      if (!normalizedProductId) {
        return {
          success: false,
          message: "Invalid product",
        };
      }

      if (!size) {
        return {
          success: false,
          message: "Size is required",
        };
      }

      // --------------------------------------------------------
      // Delete item from BACKEND
      // --------------------------------------------------------

      await cartApi.removeFromCart({
        productId: normalizedProductId,
        size,
      });

      // --------------------------------------------------------
      // Get fresh cart from backend
      // --------------------------------------------------------

      await loadCart();

      return {
        success: true,
      };
    } catch (error) {
      // Keep expected backend errors silent.
      return {
        success: false,
        message:
          error?.response?.data?.message ||
          "Failed to remove product from cart",
      };
    }
  };

  // ============================================================
  // UPDATE QUANTITY
  // ============================================================

  const updateQuantity = async (
    productId,
    size,
    delta
  ) => {
    try {
      const normalizedProductId =
        String(productId);

      // --------------------------------------------------------
      // FIND CURRENT CART ITEM
      // --------------------------------------------------------

      const currentItem = cartItems.find(
        (item) => {
          const itemProductId =
            getProductId(item?.product);

          return (
            String(itemProductId) ===
              normalizedProductId &&
            item?.size === size
          );
        }
      );

      if (!currentItem) {
        return {
          success: false,
          message: "Product not found in cart",
        };
      }

      const currentQuantity =
        Number(currentItem.quantity) || 0;

      const quantityChange =
        Number(delta) || 0;

      const newQuantity =
        currentQuantity + quantityChange;

      // --------------------------------------------------------
      // IF QUANTITY BECOMES 0
      // DELETE FROM BACKEND
      // --------------------------------------------------------

      if (newQuantity <= 0) {
        return await removeFromCart(
          normalizedProductId,
          size
        );
      }

      // --------------------------------------------------------
      // FRONTEND STOCK CHECK
      // --------------------------------------------------------

      const product =
        currentItem?.product;

      const selectedSize =
        product?.sizes?.find(
          (item) => item?.size === size
        );

      const availableStock =
        Number(selectedSize?.stock) || 0;

      // --------------------------------------------------------
      // STOP BEFORE API CALL
      // --------------------------------------------------------

      if (newQuantity > availableStock) {
        return {
          success: false,
          message: "Insufficient stock",
        };
      }

      // --------------------------------------------------------
      // UPDATE QUANTITY IN BACKEND
      // --------------------------------------------------------

      await cartApi.updateQuantity({
        productId: normalizedProductId,
        quantity: newQuantity,
        size,
      });

      // --------------------------------------------------------
      // REFRESH CART FROM BACKEND
      // --------------------------------------------------------

      await loadCart();

      return {
        success: true,
      };
    } catch (error) {
      // Keep expected backend errors silent.
      return {
        success: false,
        message:
          error?.response?.data?.message ||
          "Failed to update cart quantity",
      };
    }
  };

  // ============================================================
  // CLEAR CART
  // ============================================================

  /*
    NOTE:

    Backend currently does not have a clear-all-cart API.

    So this only clears frontend state.

    Do NOT use this for checkout/order clearing until
    a backend clear-cart endpoint is added.
  */

  const clearCart = () => {
    setCartItems([]);

    setAppliedCoupon(null);
    setCouponError("");
  };

  // ============================================================
  // TOTAL ITEM COUNT
  // ============================================================

  const totalItemCount = cartItems.reduce(
    (acc, item) => {
      return (
        acc +
        (Number(item.quantity) || 0)
      );
    },
    0
  );

  // ============================================================
  // SUBTOTAL
  // ============================================================

  const subtotal = cartItems.reduce(
    (acc, item) => {
      const price = getProductPrice(
        item.product
      );

      const quantity =
        Number(item.quantity) || 0;

      return (
        acc +
        price * quantity
      );
    },
    0
  );

  // ============================================================
  // DISCOUNT
  // ============================================================

  let discountAmount = 0;

  if (appliedCoupon) {
    if (appliedCoupon.discount) {
      discountAmount = Math.round(
        (subtotal *
          appliedCoupon.discount) /
          100
      );
    } else if (
      appliedCoupon.discountAmount
    ) {
      discountAmount = Math.min(
        appliedCoupon.discountAmount,
        subtotal
      );
    }
  }

  // ============================================================
  // SHIPPING
  // ============================================================

  const isFreeShipping =
    subtotal >=
      FREE_SHIPPING_THRESHOLD ||
    subtotal === 0;

  const shippingFee =
    isFreeShipping
      ? 0
      : SHIPPING_FEE;

  const freeShippingRemaining =
    Math.max(
      0,
      FREE_SHIPPING_THRESHOLD -
        subtotal
    );

  const freeShippingProgress =
    Math.min(
      100,
      Math.round(
        (subtotal /
          FREE_SHIPPING_THRESHOLD) *
          100
      )
    );

  // ============================================================
  // TOTAL AMOUNT
  // ============================================================

  const totalAmount = Math.max(
    0,
    subtotal -
      discountAmount +
      shippingFee
  );

  // ============================================================
  // APPLY COUPON
  // ============================================================

  const applyCoupon = (code) => {
    setCouponError("");

    const cleanCode = code
      .trim()
      .toUpperCase();

    const coupon =
      AVAILABLE_COUPONS.find(
        (c) =>
          c.code === cleanCode
      );

    if (!coupon) {
      setCouponError(
        "Invalid coupon code."
      );

      return false;
    }

    if (
      subtotal <
      coupon.minSpend
    ) {
      setCouponError(
        `Min order of ₹${coupon.minSpend} required for this coupon.`
      );

      return false;
    }

    setAppliedCoupon(coupon);

    return true;
  };

  // ============================================================
  // REMOVE COUPON
  // ============================================================

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponError("");
  };

  // ============================================================
  // PROVIDER
  // ============================================================

  return (
    <CartContext.Provider
      value={{
        // ------------------------------------------------------
        // State
        // ------------------------------------------------------

        cartItems,
        cartLoading,

        // ------------------------------------------------------
        // Count
        // ------------------------------------------------------

        totalItemCount,

        // ------------------------------------------------------
        // Cart UI
        // ------------------------------------------------------

        isCartOpen,
        openCart,
        closeCart,
        toggleCart,

        // ------------------------------------------------------
        // Cart operations
        // ------------------------------------------------------

        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,

        // ------------------------------------------------------
        // Calculations
        // ------------------------------------------------------

        subtotal,
        discountAmount,
        shippingFee,
        isFreeShipping,
        freeShippingRemaining,
        freeShippingProgress,
        totalAmount,

        // ------------------------------------------------------
        // Coupon
        // ------------------------------------------------------

        appliedCoupon,
        couponError,
        applyCoupon,
        removeCoupon,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// ============================================================
// USE CART HOOK
// ============================================================

export const useCart = () => {
  const context = useContext(
    CartContext
  );

  if (!context) {
    throw new Error(
      "useCart must be used within a CartProvider"
    );
  }

  return context;
};