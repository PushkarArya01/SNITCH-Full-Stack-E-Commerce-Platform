import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Star, Check } from 'lucide-react';

import {
  formatPrice,
  calculateDiscount,
} from '../../utils/formatCurrency';

import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [isHovered, setIsHovered] = useState(false);
  const [addedSize, setAddedSize] = useState(null);

  /*
   * ----------------------------------------------------
   * PRODUCT DATA
   * ----------------------------------------------------
   */

  const productId =
    product?.id || product?._id;

  const isFavorited = isInWishlist(productId);

  const discount = calculateDiscount(
    product?.originalPrice,
    product?.price
  );

  /*
   * ----------------------------------------------------
   * NORMALIZE SIZES
   * ----------------------------------------------------
   *
   * Backend format:
   *
   * {
   *   size: "M",
   *   stock: 50
   * }
   *
   * Old/mock format:
   *
   * "M"
   *
   * We support both.
   */

  const productSizes = Array.isArray(
    product?.sizes
  )
    ? product.sizes.map((sizeItem) => {
        if (typeof sizeItem === 'string') {
          return {
            size: sizeItem,
            stock: 0,
          };
        }

        return {
          size: sizeItem?.size || '',
          stock:
            Number(sizeItem?.stock) || 0,
        };
      })
    : [];

  /*
   * ----------------------------------------------------
   * QUICK ADD
   * ----------------------------------------------------
   */

  const handleQuickAdd = async (
    event,
    size
  ) => {
    event.preventDefault();
    event.stopPropagation();

    /*
     * Find selected size data
     */
    const selectedSize = productSizes.find(
      (sizeItem) =>
        sizeItem.size === size
    );

    const stock =
      Number(selectedSize?.stock) || 0;

    /*
     * Out of stock
     */
    if (stock <= 0) {
      return;
    }

    try {
      await addToCart(
        product,
        size,
        1
      );

      setAddedSize(size);

      setTimeout(() => {
        setAddedSize(null);
      }, 1500);
    } catch (error) {
      console.error(
        'Quick add to cart failed:',
        error
      );
    }
  };

  /*
   * ----------------------------------------------------
   * WISHLIST
   * ----------------------------------------------------
   */

  const handleWishlistToggle = (event) => {
    event.preventDefault();
    event.stopPropagation();

    toggleWishlist(product);
  };

  /*
   * ----------------------------------------------------
   * IMAGES
   * ----------------------------------------------------
   */

  const mainImage =
    product?.images?.[0] ||
    'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=800';

  const hoverImage =
    product?.images?.[1] ||
    mainImage;

  /*
   * ----------------------------------------------------
   * RENDER
   * ----------------------------------------------------
   */

  return (
    <div
      className="group relative flex flex-col bg-white select-none"
      onMouseEnter={() =>
        setIsHovered(true)
      }
      onMouseLeave={() =>
        setIsHovered(false)
      }
    >
      {/* ================================================
          PRODUCT IMAGE
      ================================================= */}

      <div className="relative aspect-[3/4] w-full overflow-hidden bg-zinc-100">

        <Link
          to={`/product/${productId}`}
          className="block w-full h-full"
        >
          <img
            src={
              isHovered
                ? hoverImage
                : mainImage
            }
            alt={product?.name || 'Product'}
            className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
            loading="lazy"
          />
        </Link>

        {/* ============================================
            PRODUCT BADGE
        ============================================= */}

        {product?.badge && (
          <div className="absolute top-2 left-2 z-10 bg-black text-white text-[9px] font-bold tracking-widest uppercase px-2 py-0.5">
            {product.badge}
          </div>
        )}

        {/* ============================================
            WISHLIST
        ============================================= */}

        <button
          type="button"
          onClick={handleWishlistToggle}
          aria-label="Save to Wishlist"
          className="absolute top-2 right-2 z-10 p-2 rounded-full bg-white/90 hover:bg-white text-black shadow-sm transition-all duration-200 cursor-pointer"
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              isFavorited
                ? 'fill-red-500 text-red-500'
                : 'text-zinc-700 hover:text-black'
            }`}
          />
        </button>

        {/* ============================================
            QUICK SIZE SELECT
        ============================================= */}

        <div className="absolute bottom-0 inset-x-0 bg-white/95 backdrop-blur-sm p-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-10 border-t border-zinc-200">

          <p className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 text-center mb-1.5">
            Quick Add Size
          </p>

          <div className="flex justify-center gap-1.5">

            {productSizes.length > 0 ? (
              productSizes.map(
                (sizeItem) => {
                  const sizeName =
                    sizeItem.size;

                  const stock =
                    Number(
                      sizeItem.stock
                    ) || 0;

                  const unavailable =
                    stock <= 0;

                  const isAdded =
                    addedSize ===
                    sizeName;

                  return (
                    <button
                      key={sizeName}
                      type="button"
                      disabled={unavailable}
                      onClick={(event) =>
                        handleQuickAdd(
                          event,
                          sizeName
                        )
                      }
                      title={
                        unavailable
                          ? `${sizeName} - Unavailable`
                          : `Add size ${sizeName}`
                      }
                      className={`min-w-[28px] min-h-[28px] px-1 text-[11px] font-semibold border flex items-center justify-center transition-all ${
                        unavailable
                          ? 'border-zinc-200 bg-zinc-100 text-zinc-400 cursor-not-allowed'
                          : isAdded
                          ? 'bg-black text-white border-black'
                          : 'border-zinc-300 hover:border-black hover:bg-black hover:text-white cursor-pointer'
                      }`}
                    >
                      {isAdded ? (
                        <Check className="w-3 h-3" />
                      ) : (
                        <span
                          className={
                            unavailable
                              ? 'line-through'
                              : ''
                          }
                        >
                          {sizeName}
                        </span>
                      )}
                    </button>
                  );
                }
              )
            ) : (
              <span className="text-[10px] text-zinc-400">
                No sizes
              </span>
            )}

          </div>

          {/* Unavailable info */}

          {productSizes.some(
            (sizeItem) =>
              Number(sizeItem.stock) <= 0
          ) && (
            <p className="text-[8px] text-zinc-400 text-center mt-1">
              Unavailable sizes are disabled
            </p>
          )}
        </div>
      </div>

      {/* ================================================
          PRODUCT DETAILS
      ================================================= */}

      <div className="pt-3 pb-1 flex flex-col flex-1">

        {/* Fit / Category + Rating */}

        <div className="flex items-center justify-between text-[11px] text-zinc-400 uppercase tracking-wider mb-1">

          <span>
            {product?.fit ||
              product?.category ||
              ''}
          </span>

          {product?.rating && (
            <span className="flex items-center text-zinc-700 font-semibold">

              <Star className="w-3 h-3 fill-amber-400 text-amber-400 mr-0.5" />

              {product.rating}
            </span>
          )}
        </div>

        {/* Product Name */}

        <Link
          to={`/product/${productId}`}
          className="text-xs font-semibold text-zinc-900 uppercase tracking-tight line-clamp-1 hover:underline"
        >
          {product?.name || 'Product'}
        </Link>

        {/* ============================================
            PRICING
        ============================================= */}

        <div className="mt-1.5 flex items-center space-x-2">

          <span className="text-xs font-bold text-black">
            {formatPrice(
              product?.price
            )}
          </span>

          {product?.originalPrice &&
            product.originalPrice >
              product.price && (
              <>
                <span className="text-[11px] text-zinc-400 line-through">
                  {formatPrice(
                    product.originalPrice
                  )}
                </span>

                <span className="text-[10px] font-bold text-emerald-600 tracking-wider uppercase">
                  ({discount}% OFF)
                </span>
              </>
            )}

        </div>
      </div>
    </div>
  );
};

export default ProductCard;