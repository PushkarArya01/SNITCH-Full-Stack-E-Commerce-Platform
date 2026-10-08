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

  const userId = user?.id ? String(user.id) : null;

  const getWishlistKey = () => {
    if (!userId) {
      return null;
    }

    return `snitch_wishlist_${userId}`;
  };

  // Load wishlist when user logs in or changes
  useEffect(() => {
    if (!isAuthenticated || !userId) {
      setWishlist([]);
      return;
    }

    const key = getWishlistKey();

    if (!key) {
      setWishlist([]);
      return;
    }

    try {
      const saved = localStorage.getItem(key);

      if (saved) {
        const parsedWishlist = JSON.parse(saved);

        if (Array.isArray(parsedWishlist)) {
          setWishlist(parsedWishlist);
        } else {
          setWishlist([]);
        }
      } else {
        setWishlist([]);
      }
    } catch {
      setWishlist([]);
    }
  }, [isAuthenticated, userId]);

  // Save wishlist for current user
  useEffect(() => {
    if (!isAuthenticated || !userId) {
      return;
    }

    const key = getWishlistKey();

    if (!key) {
      return;
    }

    try {
      localStorage.setItem(
        key,
        JSON.stringify(wishlist)
      );
    } catch {
      // Ignore localStorage errors
    }
  }, [wishlist, isAuthenticated, userId]);

  // Add / remove product
  const toggleWishlist = (product) => {
    if (!isAuthenticated || !userId) {
      return;
    }

    setWishlist((prev) => {
      const exists = prev.some(
        (item) =>
          String(item.id) === String(product.id)
      );

      if (exists) {
        return prev.filter(
          (item) =>
            String(item.id) !== String(product.id)
        );
      }

      return [...prev, product];
    });
  };

  // Check wishlist
  const isInWishlist = (productId) => {
    return wishlist.some(
      (item) =>
        String(item.id) === String(productId)
    );
  };

  // Remove product
  const removeFromWishlist = (productId) => {
    setWishlist((prev) =>
      prev.filter(
        (item) =>
          String(item.id) !== String(productId)
      )
    );
  };

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

export const useWishlist = () => {
  const context = useContext(WishlistContext);

  if (!context) {
    throw new Error(
      "useWishlist must be used within a WishlistProvider"
    );
  }

  return context;
};