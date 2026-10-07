import React, { useEffect, useState } from 'react';

import {
  Package,
  RefreshCw,
  AlertCircle,
  MapPin,
  CreditCard,
  CalendarDays,
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { orderApi } from '../api/orderApi';

// ============================================================
// FORMAT PRICE
// ============================================================

const formatPrice = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);
};

// ============================================================
// SELLER ORDERS PAGE
// ============================================================

const SellerOrdersPage = () => {
  const { user, isAuthenticated } = useAuth();

  const [orders, setOrders] = useState([]);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [statusLoading, setStatusLoading] =
    useState(null);

  const [error, setError] = useState('');

  // ============================================================
  // LOAD SELLER ORDERS
  // ============================================================

  const loadOrders = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError('');

      const response =
        await orderApi.getSellerOrders();

      const sellerOrders =
        response?.data?.orders ||
        response?.orders ||
        [];

      setOrders(
        Array.isArray(sellerOrders)
          ? sellerOrders
          : []
      );
    } catch (error) {
      console.error(
        'Failed to load seller orders:',
        error
      );

      setError(
        error?.response?.data?.message ||
          'Failed to load seller orders'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ============================================================
  // UPDATE ORDER STATUS
  // ============================================================

  const handleStatusUpdate = async (
    orderNumber,
    status
  ) => {
    try {
      setStatusLoading(orderNumber);

      setError('');

      await orderApi.updateSellerOrderStatus(
        orderNumber,
        status
      );

      // --------------------------------------------------------
      // UPDATE FRONTEND IMMEDIATELY
      // --------------------------------------------------------

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order.orderNumber === orderNumber
            ? {
                ...order,
                orderStatus: status,

                items: Array.isArray(
                  order.items
                )
                  ? order.items.map(
                      (item) => ({
                        ...item,
                        status,
                      })
                    )
                  : order.items,
              }
            : order
        )
      );
    } catch (error) {
      console.error(
        'Failed to update order status:',
        error
      );

      setError(
        error?.response?.data?.message ||
          'Failed to update order status'
      );
    } finally {
      setStatusLoading(null);
    }
  };

  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    if (user?.role !== 'seller') {
      setLoading(false);

      setError(
        'You are not authorized to access seller orders.'
      );

      return;
    }

    loadOrders();
  }, [
    isAuthenticated,
    user?.role,
  ]);

  // ============================================================
  // STATUS STYLE
  // ============================================================

  const getStatusClass = (status) => {
    switch (status) {
      case 'Delivered':
        return 'bg-green-50 text-green-700 border-green-200';

      case 'Shipped':
        return 'bg-blue-50 text-blue-700 border-blue-200';

      case 'Processing':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';

      case 'Confirmed':
        return 'bg-purple-50 text-purple-700 border-purple-200';

      case 'Cancelled':
        return 'bg-red-50 text-red-700 border-red-200';

      case 'Pending':
      default:
        return 'bg-zinc-50 text-zinc-700 border-zinc-200';
    }
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 p-6 md:p-10">
        <div className="max-w-7xl mx-auto">

          <div className="h-8 w-64 bg-zinc-200 animate-pulse mb-8" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">

            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-28 bg-white border border-zinc-200 animate-pulse"
              />
            ))}

          </div>

          <div className="h-96 bg-white border border-zinc-200 animate-pulse" />

        </div>
      </div>
    );
  }

  // ============================================================
  // PAGE
  // ============================================================

  return (
    <div className="min-h-screen bg-zinc-50">

      {/* ======================================================
          HEADER
          ====================================================== */}

      <div className="bg-black text-white">

        <div className="max-w-7xl mx-auto px-5 md:px-8 py-7">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

            <div>

              <p className="text-[10px] uppercase tracking-[0.25em] text-zinc-400 font-bold">
                SNITCH
              </p>

              <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight mt-1">
                Seller Orders
              </h1>

              <p className="text-xs text-zinc-400 mt-1">
                Manage orders containing your products
              </p>

            </div>

            {/* REFRESH */}

            <button
              type="button"
              onClick={() =>
                loadOrders(true)
              }
              disabled={refreshing}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-white text-black text-xs font-bold uppercase tracking-wider hover:bg-zinc-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >

              <RefreshCw
                className={`w-4 h-4 ${
                  refreshing
                    ? 'animate-spin'
                    : ''
                }`}
              />

              {refreshing
                ? 'Refreshing...'
                : 'Refresh'}

            </button>

          </div>

        </div>

      </div>

      {/* ======================================================
          MAIN
          ====================================================== */}

      <main className="max-w-7xl mx-auto px-5 md:px-8 py-8">

        {/* ====================================================
            ERROR
            ==================================================== */}

        {error && (
          <div className="mb-6 flex items-start gap-3 p-4 bg-red-50 border border-red-200 text-red-700">

            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />

            <div>

              <p className="text-xs font-bold uppercase">
                Error
              </p>

              <p className="text-sm mt-1">
                {error}
              </p>

            </div>

          </div>
        )}

        {/* ====================================================
            STATS
            ==================================================== */}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">

          {/* TOTAL ORDERS */}

          <div className="bg-white border border-zinc-200 p-5">

            <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">
              Total Orders
            </p>

            <p className="text-2xl font-black mt-2">
              {orders.length}
            </p>

          </div>

          {/* PENDING */}

          <div className="bg-white border border-zinc-200 p-5">

            <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">
              Pending Orders
            </p>

            <p className="text-2xl font-black mt-2">
              {
                orders.filter(
                  (order) =>
                    order.orderStatus ===
                    'Pending'
                ).length
              }
            </p>

          </div>

          {/* DELIVERED */}

          <div className="bg-white border border-zinc-200 p-5">

            <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">
              Delivered Orders
            </p>

            <p className="text-2xl font-black mt-2">
              {
                orders.filter(
                  (order) =>
                    order.orderStatus ===
                    'Delivered'
                ).length
              }
            </p>

          </div>

        </div>

        {/* ====================================================
            ORDERS BOX
            ==================================================== */}

        <div className="bg-white border border-zinc-200">

          {/* ORDERS HEADER */}

          <div className="flex items-center justify-between border-b border-zinc-200 p-5">

            <div className="flex items-center gap-2">

              <Package className="w-5 h-5" />

              <h2 className="text-sm font-bold uppercase tracking-widest">
                Orders
              </h2>

            </div>

            <span className="text-xs text-zinc-500">
              {orders.length} order
              {orders.length !== 1
                ? 's'
                : ''}
            </span>

          </div>

          {/* ==================================================
              NO ORDERS
              ================================================== */}

          {orders.length === 0 ? (

            <div className="py-20 text-center">

              <Package className="w-10 h-10 mx-auto text-zinc-300" />

              <p className="text-sm font-bold uppercase mt-4">
                No Orders Yet
              </p>

              <p className="text-xs text-zinc-500 mt-2">
                Orders containing your products
                will appear here.
              </p>

            </div>

          ) : (

            /* ==================================================
               ORDERS LIST
               ================================================== */

            <div className="divide-y divide-zinc-200">

              {orders.map((order) => {

                const orderStatus =
                  order.orderStatus ||
                  'Pending';

                return (
                  <div
                    key={
                      order._id ||
                      order.orderNumber
                    }
                    className="p-5 md:p-6"
                  >

                    {/* ========================================
                        ORDER HEADER
                        ======================================== */}

                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 pb-5 border-b border-zinc-100">

                      {/* LEFT SIDE */}

                      <div className="flex flex-wrap items-center gap-6">

                        {/* ORDER NUMBER */}

                        <div>

                          <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">
                            Order ID
                          </p>

                          <p className="text-sm font-bold mt-1">
                            {order.orderNumber ||
                              'N/A'}
                          </p>

                        </div>

                        {/* DATE */}

                        <div>

                          <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">
                            Date
                          </p>

                          <div className="flex items-center gap-1.5 mt-1">

                            <CalendarDays className="w-3.5 h-3.5 text-zinc-500" />

                            <p className="text-sm text-zinc-700">

                              {order.createdAt
                                ? new Date(
                                    order.createdAt
                                  ).toLocaleDateString(
                                    'en-IN',
                                    {
                                      day: 'numeric',
                                      month: 'short',
                                      year: 'numeric',
                                    }
                                  )
                                : 'N/A'}

                            </p>

                          </div>

                        </div>

                        {/* PAYMENT */}

                        <div>

                          <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">
                            Payment
                          </p>

                          <div className="flex items-center gap-1.5 mt-1">

                            <CreditCard className="w-3.5 h-3.5 text-zinc-500" />

                            <p className="text-sm text-zinc-700">
                              {order.paymentMethod ||
                                'COD'}
                            </p>

                          </div>

                        </div>

                      </div>

                      {/* RIGHT SIDE */}

                      <div className="flex flex-wrap items-center gap-4">

                        {/* STATUS */}

                        <div className="flex items-center gap-2">

                          <select
                            value={
                              orderStatus
                            }
                            onChange={(event) =>
                              handleStatusUpdate(
                                order.orderNumber,
                                event.target
                                  .value
                              )
                            }
                            disabled={
                              statusLoading ===
                              order.orderNumber
                            }
                            className={`px-3 py-2 border text-[10px] font-bold uppercase tracking-wider outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${getStatusClass(
                              orderStatus
                            )}`}
                          >

                            <option value="Pending">
                              Pending
                            </option>

                            <option value="Confirmed">
                              Confirmed
                            </option>

                            <option value="Processing">
                              Processing
                            </option>

                            <option value="Shipped">
                              Shipped
                            </option>

                            <option value="Delivered">
                              Delivered
                            </option>

                            <option value="Cancelled">
                              Cancelled
                            </option>

                          </select>

                          {statusLoading ===
                            order.orderNumber && (
                            <RefreshCw className="w-4 h-4 animate-spin text-zinc-500" />
                          )}

                        </div>

                        {/* TOTAL */}

                        <div className="text-right">

                          <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">
                            Order Total
                          </p>

                          <p className="text-base font-black mt-1">
                            {formatPrice(
                                  order.sellerSubtotal ??
                              order.totalAmount ??
                                0
                            )}
                          </p>

                        </div>

                      </div>

                    </div>

                    {/* ========================================
                        ORDER CONTENT
                        ======================================== */}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-5">

                      {/* ======================================
                          PRODUCTS
                          ====================================== */}

                      <div className="lg:col-span-2">

                        <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold mb-4">
                          Ordered Products
                        </p>

                        <div className="space-y-4">

                          {Array.isArray(
                            order.items
                          ) &&
                            order.items.map(
                              (item) => (

                                <div
                                  key={
                                    item._id ||
                                    `${item.product}-${item.size}`
                                  }
                                  className="flex gap-4"
                                >

                                  {/* IMAGE */}

                                  <div className="w-20 h-24 bg-zinc-100 border border-zinc-200 shrink-0 overflow-hidden">

                                    {item.image ? (

                                      <img
                                        src={
                                          item.image
                                        }
                                        alt={
                                          item.title ||
                                          'Product'
                                        }
                                        className="w-full h-full object-cover"
                                      />

                                    ) : (

                                      <div className="w-full h-full flex items-center justify-center text-[10px] text-zinc-400">
                                        NO IMAGE
                                      </div>

                                    )}

                                  </div>

                                  {/* PRODUCT DETAILS */}

                                  <div className="flex-1 min-w-0">

                                    <h3 className="text-sm font-bold uppercase">
                                      {item.title ||
                                        'Product'}
                                    </h3>

                                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-zinc-500">

                                      <span>
                                        Size:{' '}
                                        {item.size ||
                                          'N/A'}
                                      </span>

                                      <span>
                                        Qty:{' '}
                                        {item.quantity ||
                                          0}
                                      </span>

                                      <span>
                                        Unit Price:{' '}
                                        {formatPrice(
                                          item.unitPrice ||
                                            0
                                        )}
                                      </span>

                                    </div>

                                    <p className="text-sm font-bold mt-3">
                                      {formatPrice(
                                        item.totalPrice ||
                                          0
                                      )}
                                    </p>

                                  </div>

                                </div>

                              )
                            )}

                        </div>

                      </div>

                      {/* ======================================
                          SHIPPING ADDRESS
                          ====================================== */}

                      <div className="border border-zinc-200 p-4 h-fit">

                        <div className="flex items-center gap-2 mb-4">

                          <MapPin className="w-4 h-4" />

                          <p className="text-[10px] uppercase tracking-widest font-bold">
                            Shipping Address
                          </p>

                        </div>

                        <div className="text-xs text-zinc-600 space-y-1.5">

                          <p className="font-bold text-zinc-900">
                            {order.shippingAddress
                              ?.fullName ||
                              'N/A'}
                          </p>

                          <p>
                            {order.shippingAddress
                              ?.phone ||
                              'N/A'}
                          </p>

                          <p>
                            {order.shippingAddress
                              ?.addressLine ||
                              'N/A'}
                          </p>

                          <p>

                            {order.shippingAddress
                              ?.city ||
                              ''}

                            {order.shippingAddress
                              ?.city &&
                            order.shippingAddress
                              ?.state
                              ? ', '
                              : ''}

                            {order.shippingAddress
                              ?.state ||
                              ''}

                          </p>

                          <p>
                            Pincode:{' '}
                            {order.shippingAddress
                              ?.pincode ||
                              'N/A'}
                          </p>

                        </div>

                      </div>

                    </div>

                  </div>
                );
              })}

            </div>

          )}

        </div>

      </main>

    </div>
  );
};

export default SellerOrdersPage;