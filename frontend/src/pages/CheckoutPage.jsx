import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import {
  CheckCircle2,
  ShieldCheck,
  Truck,
  CreditCard,
  Smartphone,
  Banknote,
  ArrowLeft,
} from 'lucide-react';

import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { orderApi } from '../api/orderApi';
import { formatPrice } from '../utils/formatCurrency';

const PAYMENT_METHODS = [
  {
    id: 'upi',
    name: 'UPI (Google Pay, PhonePe, Paytm)',
    icon: Smartphone,
  },
  {
    id: 'card',
    name: 'Credit / Debit Card',
    icon: CreditCard,
  },
  {
    id: 'cod',
    name: 'Cash on Delivery (+ ₹49 convenience fee)',
    icon: Banknote,
  },
];

const CheckoutPage = () => {
  const {
    cartItems,
    subtotal,
    discountAmount,
    shippingFee,
    totalAmount,
    clearCart,
  } = useCart();

  const { user } = useAuth();
  const navigate = useNavigate();

  const [address, setAddress] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    street: '',
    city: '',
    state: '',
    pincode: '',
  });

  const [paymentMethod, setPaymentMethod] = useState('upi');

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [completedOrder, setCompletedOrder] =
    useState(null);

  const [errorMessage, setErrorMessage] =
    useState('');

  // ============================================================
  // SAFE PRODUCT HELPERS
  // ============================================================

  const getProductName = (product) => {
    return (
      product?.name ||
      product?.title ||
      'Product'
    );
  };

  const getProductPrice = (product) => {
    if (
      typeof product?.price === 'number'
    ) {
      return product.price;
    }

    if (
      typeof product?.price?.amount ===
      'number'
    ) {
      return product.price.amount;
    }

    return 0;
  };

  const getProductImage = (product) => {
    if (
      Array.isArray(product?.images) &&
      product.images.length > 0
    ) {
      return product.images[0];
    }

    if (product?.image) {
      return product.image;
    }

    return null;
  };

  // ============================================================
  // INVALID CART ITEMS
  // ============================================================

  const invalidCartItems =
    cartItems.filter(
      (item) => !item?.product
    );

  const hasInvalidCartItems =
    invalidCartItems.length > 0;

  // ============================================================
  // COD TOTAL
  // IMPORTANT:
  // Must be declared BEFORE completedOrder
  // ============================================================

  const finalTotal =
    paymentMethod === 'cod'
      ? totalAmount + 49
      : totalAmount;

  // ============================================================
  // EMPTY CART
  // ============================================================

  if (
    cartItems.length === 0 &&
    !completedOrder
  ) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold uppercase tracking-wider">
          Your Bag is Empty
        </h2>

        <p className="text-xs text-zinc-500">
          Add some styles to your bag before
          checking out.
        </p>

        <Link
          to="/shop"
          className="inline-block px-8 py-3 bg-black text-white text-xs font-bold uppercase tracking-wider hover:bg-zinc-800"
        >
          Go Shopping
        </Link>
      </div>
    );
  }

  // ============================================================
  // ADDRESS INPUT
  // ============================================================

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setAddress((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errorMessage) {
      setErrorMessage('');
    }
  };

  // ============================================================
  // PLACE ORDER
  // ============================================================

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    setErrorMessage('');

    // Prevent order creation when cart contains
    // invalid product reference.
    if (hasInvalidCartItems) {
      setErrorMessage(
        'One or more products in your bag are no longer available. Please remove the unavailable product from your bag and try again.'
      );

      return;
    }

    // Extra frontend validation
    if (
      !address.fullName.trim() ||
      !address.phone.trim() ||
      !address.street.trim() ||
      !address.city.trim() ||
      !address.state.trim() ||
      !address.pincode.trim()
    ) {
      setErrorMessage(
        'Please fill all shipping details.'
      );

      return;
    }

    if (
      address.pincode.trim().length !== 6
    ) {
      setErrorMessage(
        'Please enter a valid 6-digit PIN code.'
      );

      return;
    }

    setIsSubmitting(true);

    try {
      // ========================================================
      // Backend Order API expects:
      //
      // shippingAddress:
      // {
      //   fullName,
      //   phone,
      //   addressLine,
      //   city,
      //   state,
      //   pincode
      // }
      //
      // paymentMethod:
      // COD / ONLINE
      //
      // Product details are NOT sent.
      // Backend reads authenticated user's cart.
      // ========================================================

      const orderPayload = {
        shippingAddress: {
          fullName:
            address.fullName.trim(),

          phone:
            address.phone.trim(),

          addressLine:
            address.street.trim(),

          city:
            address.city.trim(),

          state:
            address.state.trim(),

          pincode:
            address.pincode.trim(),
        },

        paymentMethod:
          paymentMethod === 'cod'
            ? 'COD'
            : 'ONLINE',
      };

      const response =
        await orderApi.createOrder(
          orderPayload
        );

      // ========================================================
      // Support possible response structures
      // without changing orderApi.js
      // ========================================================

      const createdOrder =
        response?.order ||
        response?.data?.order ||
        response?.data ||
        response;

      setCompletedOrder(
        createdOrder
      );

      // Existing cart flow
      clearCart();
    } catch (err) {
      console.error(
        'Place order error:',
        err
      );

      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        'Unable to place your order. Please try again.';

      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============================================================
  // ORDER CONFIRMED STATE
  // ============================================================

  if (completedOrder) {
    const confirmationItems =
      completedOrder?.items || [];

    const orderId =
      completedOrder?.orderNumber ||
      completedOrder?.id ||
      completedOrder?._id ||
      'Order Confirmed';

    const confirmedTotal =
      typeof completedOrder?.totalAmount ===
      'number'
        ? completedOrder.totalAmount
        : finalTotal;

    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center animate-fade-in">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-zinc-900">
          Order Successfully Placed!
        </h1>

        <p className="text-xs text-zinc-500 uppercase tracking-widest mt-1">
          Order ID:{' '}
          <span className="font-bold text-black">
            {orderId}
          </span>
        </p>

        <div className="mt-8 bg-zinc-50 border border-zinc-200 p-6 text-left space-y-4">
          {/* DELIVERY DETAILS */}

          <div className="border-b border-zinc-200 pb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-black">
              Delivery Details
            </h3>

            <p className="text-xs text-zinc-700 mt-1 font-semibold">
              {address.fullName} (
              {address.phone})
            </p>

            <p className="text-xs text-zinc-500">
              {address.street},{' '}
              {address.city},{' '}
              {address.state} -{' '}
              {address.pincode}
            </p>
          </div>

          {/* ITEMS */}

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-black mb-2">
              Items Ordered
            </h3>

            <div className="space-y-2">
              {confirmationItems.length >
              0 ? (
                confirmationItems.map(
                  (item, idx) => {
                    const itemName =
                      item?.name ||
                      item?.title ||
                      'Product';

                    const itemPrice =
                      typeof item?.price ===
                      'number'
                        ? item.price
                        : typeof item?.unitPrice ===
                          'number'
                        ? item.unitPrice
                        : 0;

                    return (
                      <div
                        key={
                          item?._id ||
                          idx
                        }
                        className="flex justify-between items-center text-xs"
                      >
                        <span className="font-medium text-zinc-800">
                          {itemName}{' '}
                          <span className="text-zinc-500">
                            (
                            {item?.size ||
                              '-'}
                            ) ×{' '}
                            {item?.quantity ||
                              1}
                          </span>
                        </span>

                        <span className="font-bold text-black">
                          {formatPrice(
                            itemPrice *
                              (item?.quantity ||
                                1)
                          )}
                        </span>
                      </div>
                    );
                  }
                )
              ) : (
                <p className="text-xs text-zinc-500">
                  Your order has been
                  successfully created.
                </p>
              )}
            </div>
          </div>

          {/* TOTAL */}

          <div className="border-t border-zinc-200 pt-3 flex justify-between font-bold text-sm">
            <span>Total Paid</span>

            <span>
              {formatPrice(
                confirmedTotal
              )}
            </span>
          </div>
        </div>

        <div className="mt-8 flex justify-center space-x-4">
          <Link
            to="/shop"
            className="px-8 py-3 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-zinc-800"
          >
            Continue Shopping
          </Link>

          <Link
            to="/account"
            className="px-8 py-3 bg-zinc-100 text-black border border-zinc-300 text-xs font-bold uppercase tracking-widest hover:bg-zinc-200"
          >
            View In My Orders
          </Link>
        </div>
      </div>
    );
  }

  // ============================================================
  // MAIN CHECKOUT UI
  // ============================================================

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      <Link
        to="/shop"
        className="inline-flex items-center text-xs font-bold uppercase tracking-wider text-zinc-500 hover:text-black mb-6"
      >
        <ArrowLeft className="w-3.5 h-3.5 mr-1" />
        Return to Catalog
      </Link>

      {errorMessage && (
        <div className="mb-6 border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700 font-medium">
          {errorMessage}
        </div>
      )}

      {hasInvalidCartItems && (
        <div className="mb-6 border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-700 font-medium">
          One or more products in your
          bag are unavailable. Please
          remove the unavailable product
          from your bag before placing
          the order.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

        {/* ======================================================
            LEFT: SHIPPING + PAYMENT
        ====================================================== */}

        <div className="lg:col-span-7">
          <form
            onSubmit={handlePlaceOrder}
            className="space-y-8"
          >

            {/* ==================================================
                STEP 1: DELIVERY ADDRESS
            ================================================== */}

            <div className="border border-zinc-200 p-6 bg-white shadow-sm">
              <div className="flex items-center space-x-2 border-b border-zinc-200 pb-3 mb-4">
                <Truck className="w-4 h-4 text-black" />

                <h2 className="text-xs font-bold uppercase tracking-widest text-black">
                  1. Shipping Information
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                {/* FULL NAME */}

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-600 mb-1">
                    Recipient Full Name *
                  </label>

                  <input
                    type="text"
                    required
                    name="fullName"
                    value={
                      address.fullName
                    }
                    onChange={
                      handleInputChange
                    }
                    placeholder="Enter your full name"
                    className="w-full px-3 py-2 text-xs border border-zinc-300 focus:border-black outline-none"
                  />
                </div>

                {/* PHONE */}

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-600 mb-1">
                    Contact Phone *
                  </label>

                  <input
                    type="tel"
                    required
                    name="phone"
                    value={
                      address.phone
                    }
                    onChange={
                      handleInputChange
                    }
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2 text-xs border border-zinc-300 focus:border-black outline-none"
                  />
                </div>

                {/* PINCODE */}

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-600 mb-1">
                    PIN Code *
                  </label>

                  <input
                    type="text"
                    required
                    maxLength={6}
                    name="pincode"
                    value={
                      address.pincode
                    }
                    onChange={
                      handleInputChange
                    }
                    placeholder="e.g. 560001"
                    className="w-full px-3 py-2 text-xs border border-zinc-300 focus:border-black outline-none"
                  />
                </div>

                {/* STREET */}

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-600 mb-1">
                    Street Address / Flat / Building *
                  </label>

                  <input
                    type="text"
                    required
                    name="street"
                    value={
                      address.street
                    }
                    onChange={
                      handleInputChange
                    }
                    placeholder="House / Flat No., Road, Landmark"
                    className="w-full px-3 py-2 text-xs border border-zinc-300 focus:border-black outline-none"
                  />
                </div>

                {/* CITY */}

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-600 mb-1">
                    City *
                  </label>

                  <input
                    type="text"
                    required
                    name="city"
                    value={
                      address.city
                    }
                    onChange={
                      handleInputChange
                    }
                    placeholder="Bengaluru / Mumbai / Delhi"
                    className="w-full px-3 py-2 text-xs border border-zinc-300 focus:border-black outline-none"
                  />
                </div>

                {/* STATE */}

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-600 mb-1">
                    State *
                  </label>

                  <input
                    type="text"
                    required
                    name="state"
                    value={
                      address.state
                    }
                    onChange={
                      handleInputChange
                    }
                    placeholder="State"
                    className="w-full px-3 py-2 text-xs border border-zinc-300 focus:border-black outline-none"
                  />
                </div>
              </div>
            </div>

            {/* ==================================================
                STEP 2: PAYMENT
            ================================================== */}

            <div className="border border-zinc-200 p-6 bg-white shadow-sm">
              <div className="flex items-center space-x-2 border-b border-zinc-200 pb-3 mb-4">
                <CreditCard className="w-4 h-4 text-black" />

                <h2 className="text-xs font-bold uppercase tracking-widest text-black">
                  2. Select Payment Mode
                </h2>
              </div>

              <div className="space-y-3">
                {PAYMENT_METHODS.map(
                  (pm) => {
                    const Icon =
                      pm.icon;

                    return (
                      <label
                        key={pm.id}
                        className={`flex items-center justify-between p-3.5 border cursor-pointer transition ${
                          paymentMethod ===
                          pm.id
                            ? 'border-black bg-zinc-50'
                            : 'border-zinc-200 hover:border-zinc-300'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value={pm.id}
                            checked={
                              paymentMethod ===
                              pm.id
                            }
                            onChange={(e) =>
                              setPaymentMethod(
                                e.target.value
                              )
                            }
                            className="accent-black"
                          />

                          <span className="text-xs font-bold text-zinc-900">
                            {pm.name}
                          </span>
                        </div>

                        <Icon className="w-4 h-4 text-zinc-600" />
                      </label>
                    );
                  }
                )}
              </div>
            </div>

            {/* ERROR */}

            {errorMessage && (
              <div className="border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
                {errorMessage}
              </div>
            )}

            {/* PLACE ORDER */}

            <button
              type="submit"
              disabled={
                isSubmitting ||
                hasInvalidCartItems
              }
              className="w-full py-4 bg-black hover:bg-zinc-800 text-white font-bold text-xs uppercase tracking-widest transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting
                ? 'Confirming Order...'
                : `Complete Order • ${formatPrice(
                    finalTotal
                  )}`}
            </button>
          </form>
        </div>

        {/* ======================================================
            RIGHT: ORDER SUMMARY
        ====================================================== */}

        <div className="lg:col-span-5">
          <div className="border border-zinc-200 bg-zinc-50 p-6 sticky top-28 space-y-5">

            <h2 className="text-xs font-bold uppercase tracking-widest text-black border-b border-zinc-200 pb-3">
              Order Summary (
              {cartItems.length} items)
            </h2>

            {/* ITEMS LIST */}

            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {cartItems.map(
                (item, index) => {
                  const product =
                    item?.product;

                  const productName =
                    getProductName(
                      product
                    );

                  const productPrice =
                    getProductPrice(
                      product
                    );

                  const productImage =
                    getProductImage(
                      product
                    );

                  return (
                    <div
                      key={`${product?._id || product?.id || 'product'}-${item?.size || 'size'}-${index}`}
                      className="flex space-x-3 text-xs"
                    >
                      {/* PRODUCT IMAGE */}

                      <div className="w-14 h-18 bg-zinc-200 flex-shrink-0 overflow-hidden flex items-center justify-center">
                        {productImage ? (
                          <img
                            src={
                              productImage
                            }
                            alt={
                              productName
                            }
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-[8px] text-zinc-500 text-center uppercase">
                            No Image
                          </span>
                        )}
                      </div>

                      {/* PRODUCT INFO */}

                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-zinc-900 truncate uppercase">
                          {productName}
                        </p>

                        <p className="text-zinc-500 text-[11px]">
                          Size:{' '}
                          {item?.size ||
                            '-'}{' '}
                          | Qty:{' '}
                          {item?.quantity ||
                            0}
                        </p>

                        <p className="font-bold text-black mt-1">
                          {formatPrice(
                            productPrice *
                              (item?.quantity ||
                                0)
                          )}
                        </p>

                        {!product && (
                          <p className="text-[10px] text-red-600 mt-1 font-semibold">
                            PRODUCT UNAVAILABLE
                          </p>
                        )}
                      </div>
                    </div>
                  );
                }
              )}
            </div>

            {/* CALCULATIONS */}

            <div className="border-t border-zinc-200 pt-3 space-y-2 text-xs">

              {/* SUBTOTAL */}

              <div className="flex justify-between text-zinc-600">
                <span>
                  Subtotal
                </span>

                <span className="font-semibold text-black">
                  {formatPrice(
                    subtotal
                  )}
                </span>
              </div>

              {/* DISCOUNT */}

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>
                    Coupon Discount
                  </span>

                  <span>
                    -{formatPrice(
                      discountAmount
                    )}
                  </span>
                </div>
              )}

              {/* SHIPPING */}

              <div className="flex justify-between text-zinc-600">
                <span>
                  Shipping
                </span>

                <span>
                  {shippingFee === 0 ? (
                    <span className="text-emerald-600 font-semibold">
                      FREE
                    </span>
                  ) : (
                    formatPrice(
                      shippingFee
                    )
                  )}
                </span>
              </div>

              {/* COD FEE */}

              {paymentMethod ===
                'cod' && (
                <div className="flex justify-between text-zinc-600">
                  <span>
                    COD Convenience Fee
                  </span>

                  <span>
                    {formatPrice(49)}
                  </span>
                </div>
              )}

              {/* GRAND TOTAL */}

              <div className="flex justify-between text-sm font-bold text-black pt-3 border-t border-zinc-200">
                <span>
                  Grand Total
                </span>

                <span>
                  {formatPrice(
                    finalTotal
                  )}
                </span>
              </div>
            </div>

            {/* SECURITY */}

            <div className="flex items-center space-x-2 text-[10px] text-zinc-500 pt-2 border-t border-zinc-200">
              <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />

              <span>
                SSL Encrypted Checkout.
                Your details are safe
                with us.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;