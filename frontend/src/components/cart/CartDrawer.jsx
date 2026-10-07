import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  Tag,
  ShieldCheck,
} from "lucide-react";

import { useCart } from "../../context/CartContext";
import { formatPrice } from "../../utils/formatCurrency";
import { AVAILABLE_COUPONS } from "../../utils/constants";

const CartDrawer = () => {

  const {
    isCartOpen,
    closeCart,
    cartItems,
    totalItemCount,
    removeFromCart,
    updateQuantity,
    subtotal,
    discountAmount,
    shippingFee,
    isFreeShipping,
    freeShippingRemaining,
    freeShippingProgress,
    totalAmount,
    appliedCoupon,
    couponError,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const [couponCode, setCouponCode] = useState("");

  const navigate = useNavigate();


  // ============================================================
  // HELPERS
  // ============================================================

  const getProductId = (product) => {

    if (!product) return null;

    if (typeof product === "string") {
      return product;
    }

    return product.id || product._id;

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

      return Number(
        product.price.amount
      ) || 0;

    }

    return Number(
      product.price
    ) || 0;

  };


  const getProductImage = (product) => {

    if (!product) return "";

    if (
      Array.isArray(product.images) &&
      product.images.length > 0
    ) {

      return product.images[0];

    }

    return "";

  };


  // ============================================================
  // COUPON
  // ============================================================

  const handleApplyCoupon = (e) => {

    e.preventDefault();

    if (!couponCode) return;

    const ok =
      applyCoupon(couponCode);

    if (ok) {
      setCouponCode("");
    }

  };


  // ============================================================
  // CHECKOUT
  // ============================================================

  const handleCheckout = () => {

    closeCart();

    navigate("/checkout");

  };


  // ============================================================
  // CLOSE
  // ============================================================

  if (!isCartOpen) {
    return null;
  }


  return (

    <div className="fixed inset-0 z-50 overflow-hidden animate-fade-in">

      {/* BACKDROP */}

      <div
        onClick={closeCart}
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
      />


      {/* DRAWER */}

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">

        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">


          {/* ================================================= */}
          {/* HEADER */}
          {/* ================================================= */}

          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200">

            <div className="flex items-center space-x-2">

              <ShoppingBag className="w-5 h-5 text-black" />

              <h2 className="text-sm font-bold uppercase tracking-wider">

                Your Bag ({totalItemCount})

              </h2>

            </div>


            <button
              onClick={closeCart}
              className="p-1 text-zinc-400 hover:text-black transition cursor-pointer"
            >

              <X className="w-5 h-5" />

            </button>

          </div>


          {/* ================================================= */}
          {/* FREE SHIPPING */}
          {/* ================================================= */}

          <div className="bg-zinc-50 px-6 py-3 border-b border-zinc-200">

            <p className="text-xs font-medium text-zinc-800 text-center mb-1.5">

              {isFreeShipping ? (

                <span className="text-emerald-600 font-bold">

                  🎉 Congratulations! You have unlocked Free Delivery!

                </span>

              ) : (

                <span>

                  Add{" "}

                  <span className="font-bold text-black">

                    {formatPrice(
                      freeShippingRemaining
                    )}

                  </span>{" "}

                  more to unlock{" "}

                  <span className="font-bold">

                    FREE Delivery

                  </span>

                </span>

              )}

            </p>


            <div className="w-full h-1.5 bg-zinc-200 rounded-full overflow-hidden">

              <div
                className="h-full bg-black transition-all duration-300"
                style={{
                  width: `${freeShippingProgress}%`,
                }}
              />

            </div>

          </div>


          {/* ================================================= */}
          {/* CART ITEMS */}
          {/* ================================================= */}

          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">

            {cartItems.length === 0 ? (

              <div className="h-full flex flex-col items-center justify-center text-center py-16">

                <div className="w-16 h-16 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 mb-4">

                  <ShoppingBag className="w-8 h-8" />

                </div>

                <h3 className="text-sm font-bold uppercase tracking-wider">

                  Your Bag is Empty

                </h3>

                <p className="text-xs text-zinc-500 mt-1 max-w-xs">

                  Looks like you haven't added anything to your cart yet. Explore our latest drops!

                </p>

                <button
                  onClick={() => {
                    closeCart();
                    navigate("/shop");
                  }}
                  className="mt-6 px-6 py-2.5 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-zinc-800 transition cursor-pointer"
                >

                  Start Shopping

                </button>

              </div>

            ) : (

              cartItems.map((item) => {

                const product =
                  item.product;

                const productId =
                  getProductId(product);

                const productName =
                  getProductName(product);

                const productPrice =
                  getProductPrice(product);

                const productImage =
                  getProductImage(product);


                return (

                  <div
                    key={`${productId}-${item.size}`}
                    className="flex space-x-4 border-b border-zinc-100 pb-4"
                  >


                    {/* PRODUCT IMAGE */}

                    <img
                      src={productImage}
                      alt={productName}
                      className="w-20 h-24 object-cover bg-zinc-100 flex-shrink-0"
                    />


                    {/* PRODUCT INFO */}

                    <div className="flex-1 min-w-0 flex flex-col justify-between">


                      <div>

                        <div className="flex justify-between items-start">

                          <h4 className="text-xs font-bold uppercase text-zinc-900 truncate pr-2">

                            {productName}

                          </h4>


                          {/* DELETE */}

                          <button
                            type="button"
                            onClick={() =>
                              removeFromCart(
                                productId,
                                item.size
                              )
                            }
                            className="text-zinc-400 hover:text-red-500 transition cursor-pointer"
                            title="Remove product"
                          >

                            <Trash2 className="w-4 h-4" />

                          </button>

                        </div>


                        {/* SIZE */}

                        <p className="text-[11px] text-zinc-500 mt-0.5">

                          Size:{" "}

                          <span className="font-semibold text-black uppercase">

                            {item.size}

                          </span>

                        </p>


                        {/* PRICE */}

                        <p className="text-xs font-bold text-black mt-1">

                          {formatPrice(
                            productPrice
                          )}

                        </p>

                      </div>


                      {/* ================================================= */}
                      {/* QUANTITY */}
                      {/* ================================================= */}

                      <div className="flex items-center space-x-2 mt-2">

                        <div className="flex items-center border border-zinc-200">


                          {/* MINUS */}

                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(
                                productId,
                                item.size,
                                -1
                              )
                            }
                            className="p-1 hover:bg-zinc-100 transition cursor-pointer"
                            title="Decrease quantity"
                          >

                            <Minus className="w-3 h-3 text-zinc-600" />

                          </button>


                          {/* QUANTITY */}

                          <span className="px-3 text-xs font-semibold">

                            {item.quantity}

                          </span>


                          {/* PLUS */}

                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(
                                productId,
                                item.size,
                                1
                              )
                            }
                            className="p-1 hover:bg-zinc-100 transition cursor-pointer"
                            title="Increase quantity"
                          >

                            <Plus className="w-3 h-3 text-zinc-600" />

                          </button>

                        </div>

                      </div>

                    </div>

                  </div>

                );

              })

            )}

          </div>


          {/* ================================================= */}
          {/* FOOTER */}
          {/* ================================================= */}

          {cartItems.length > 0 && (

            <div className="border-t border-zinc-200 px-6 py-4 bg-zinc-50/50 space-y-4">


              {/* COUPON */}

              <div>

                <form
                  onSubmit={handleApplyCoupon}
                  className="flex space-x-2"
                >

                  <div className="relative flex-1">

                    <Tag className="w-3.5 h-3.5 absolute left-3 top-2.5 text-zinc-400" />

                    <input
                      type="text"
                      placeholder="Enter promo coupon code"
                      value={couponCode}
                      onChange={(e) =>
                        setCouponCode(
                          e.target.value.toUpperCase()
                        )
                      }
                      className="w-full pl-8 pr-3 py-1.5 text-xs uppercase border border-zinc-300 focus:border-black outline-none font-medium"
                    />

                  </div>


                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-black text-white text-xs font-bold uppercase tracking-wider hover:bg-zinc-800 transition cursor-pointer"
                  >

                    Apply

                  </button>

                </form>


                {couponError && (

                  <p className="text-[11px] text-red-600 mt-1">

                    {couponError}

                  </p>

                )}


                {appliedCoupon ? (

                  <div className="mt-2 flex items-center justify-between text-xs bg-emerald-50 text-emerald-700 px-2.5 py-1 border border-emerald-200">

                    <span>

                      Coupon{" "}

                      <strong>
                        {appliedCoupon.code}
                      </strong>{" "}

                      applied (-
                      {formatPrice(discountAmount)}
                      )

                    </span>


                    <button
                      type="button"
                      onClick={removeCoupon}
                      className="text-emerald-800 font-bold hover:underline cursor-pointer ml-2"
                    >

                      Remove

                    </button>

                  </div>

                ) : (

                  <div className="mt-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">

                    <span className="text-[10px] text-zinc-400 uppercase font-semibold">

                      Try:

                    </span>


                    {AVAILABLE_COUPONS.map(
                      (cp) => (

                        <button
                          key={cp.code}
                          type="button"
                          onClick={() =>
                            applyCoupon(cp.code)
                          }
                          className="text-[10px] bg-white border border-dashed border-zinc-300 hover:border-black px-2 py-0.5 font-bold cursor-pointer transition whitespace-nowrap"
                        >

                          {cp.code}

                        </button>

                      )
                    )}

                  </div>

                )}

              </div>


              {/* PRICE BREAKDOWN */}

              <div className="space-y-1.5 text-xs">

                <div className="flex justify-between text-zinc-600">

                  <span>
                    Subtotal
                  </span>

                  <span className="font-semibold text-black">

                    {formatPrice(subtotal)}

                  </span>

                </div>


                {discountAmount > 0 && (

                  <div className="flex justify-between text-emerald-600">

                    <span>
                      Discount
                    </span>

                    <span className="font-semibold">

                      -{formatPrice(
                        discountAmount
                      )}

                    </span>

                  </div>

                )}


                <div className="flex justify-between text-zinc-600">

                  <span>
                    Estimated Shipping
                  </span>

                  <span>

                    {isFreeShipping ? (

                      <span className="text-emerald-600 font-semibold uppercase">

                        Free

                      </span>

                    ) : (

                      formatPrice(
                        shippingFee
                      )

                    )}

                  </span>

                </div>


                <div className="flex justify-between text-sm font-bold text-black pt-2 border-t border-zinc-200">

                  <span>
                    Total Amount
                  </span>

                  <span>

                    {formatPrice(
                      totalAmount
                    )}

                  </span>

                </div>

              </div>


              {/* CHECKOUT */}

              <button
                onClick={handleCheckout}
                className="w-full py-3.5 bg-black hover:bg-zinc-800 text-white font-bold text-xs uppercase tracking-widest flex items-center justify-center space-x-2 transition cursor-pointer"
              >

                <span>
                  Proceed to Checkout
                </span>

                <ArrowRight className="w-4 h-4" />

              </button>


              <div className="flex items-center justify-center space-x-1.5 text-[10px] text-zinc-400 font-medium">

                <ShieldCheck className="w-3.5 h-3.5 text-zinc-500" />

                <span>
                  100% Secure Checkout & Guaranteed Authenticity
                </span>

              </div>

            </div>

          )}

        </div>

      </div>

    </div>

  );

};

export default CartDrawer;