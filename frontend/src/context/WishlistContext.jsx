import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { useAuth } from "./AuthContext";

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();

  const [wishlist, setWishlist] = useState([]);

  // ============================================================
  // GET USER ID
  // ============================================================

  const userId = user?.id ? String(user.id) : null;

  // ============================================================
  // GET USER-SPECIFIC WISHLIST KEY
  // ============================================================

  const getWishlistKey = () => {
    if (!userId) {
      return null;
    }

    return `snitch_wishlist_${userId}`;
  };

  // ============================================================
  // LOAD WISHLIST WHEN USER CHANGES
  // ============================================================

  useEffect(() => {
    // User is logged out
    if (!isAuthenticated || !userId) {
      setWishlist([]);
      return;
    }

    try {
      const key = `snitch_wishlist_${userId}`;

      const saved = localStorage.getItem(key);

      if (saved) {
        const parsedWishlist = JSON.parse(saved);

        if (Array.isArray(parsedWishlist)) {
          setWishlist(parsedWishlist);
        } else {
          setWishlist([]);
        }
      } else {
        // New user = empty wishlist
        setWishlist([]);
      }
    } catch (error) {
      console.error(
        "Failed to load wishlist:",
        error
      );

      setWishlist([]);
    }
  }, [isAuthenticated, userId]);

  // ============================================================
  // SAVE WISHLIST FOR CURRENT USER
  // ============================================================

  useEffect(() => {
    // Don't save anything when logged out
    if (!isAuthenticated || !userId) {
      return;
    }

    try {
      const key = `snitch_wishlist_${userId}`;

      localStorage.setItem(
        key,
        JSON.stringify(wishlist)
      );
    } catch (error) {
      console.error(
        "Failed to save wishlist:",
        error
      );
    }
  }, [wishlist, isAuthenticated, userId]);

  // ============================================================
  // ADD / REMOVE WISHLIST
  // ============================================================

  const toggleWishlist = (product) => {
    if (!isAuthenticated || !userId) {
      console.log(
        "Please login to use wishlist"
      );

      return;
    }

    setWishlist((prev) => {
      const exists = prev.some(
        (item) =>
          String(item.id) ===
          String(product.id)
      );

      // REMOVE
      if (exists) {
        return prev.filter(
          (item) =>
            String(item.id) !==
            String(product.id)
        );
      }

      // ADD
      return [...prev, product];
    });
  };

  // ============================================================
  // CHECK PRODUCT
  // ============================================================

  const isInWishlist = (productId) => {
    return wishlist.some(
      (item) =>
        String(item.id) ===
        String(productId)
    );
  };

  // ============================================================
  // REMOVE PRODUCT
  // ============================================================

  const removeFromWishlist = (productId) => {
    setWishlist((prev) =>
      prev.filter(
        (item) =>
          String(item.id) !==
          String(productId)
      )
    );
  };

  // ============================================================
  // CONTEXT
  // ============================================================

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        wishlistCount: wishlist.length,
        toggleWishlist,
        isInWishlist,
        removeFromWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

// ============================================================
// CUSTOM HOOK
// ============================================================

export const useWishlist = () => {
  const context = useContext(WishlistContext);

  if (!context) {
    throw new Error(
      "useWishlist must be used within a WishlistProvider"
    );
  }

  return context;
};