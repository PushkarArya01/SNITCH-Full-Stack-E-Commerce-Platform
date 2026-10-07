import React, {
  useState,
  useEffect,
} from "react";

import {
  useNavigate,
  Link,
} from "react-router-dom";

import {
  User,
  Package,
  LogOut,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { orderApi } from "../api/orderApi";
import { formatPrice } from "../utils/formatCurrency";

const AccountPage = () => {
  const {
    user,
    isAuthenticated,
    logout,
  } = useAuth();

  const [orders, setOrders] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState("");

  const navigate = useNavigate();

  // ============================================================
  // FETCH USER ORDERS
  // ============================================================

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      try {
        setLoading(true);
        setErrorMessage("");

        const response =
          await orderApi.getUserOrders();

        // Backend can return:
        //
        // {
        //   data: {
        //     orders: []
        //   }
        // }
        //
        // OR:
        //
        // {
        //   orders: []
        // }
        //
        // OR directly:
        //
        // []

        const backendOrders =
          response?.data?.orders ||
          response?.orders ||
          (Array.isArray(response)
            ? response
            : []);

        setOrders(
          Array.isArray(
            backendOrders
          )
            ? backendOrders
            : []
        );
      } catch (error) {
        console.error(
          "Failed to load orders:",
          error
        );

        setErrorMessage(
          error?.response?.data
            ?.message ||
            error?.message ||
            "Failed to load order history."
        );

        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [isAuthenticated]);

  // ============================================================
  // SIGN IN CHECK
  // ============================================================

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <User className="w-12 h-12 mx-auto text-zinc-400" />

        <h2 className="text-lg font-bold uppercase">
          Please Sign In
        </h2>

        <p className="text-xs text-zinc-500">
          Sign in to view your orders,
          addresses, and wishlist.
        </p>

        <button
          onClick={() =>
            navigate("/login")
          }
          className="px-6 py-2.5 bg-black text-white text-xs font-bold uppercase tracking-wider"
        >
          Sign In Now
        </button>
      </div>
    );
  }

  // ============================================================
  // FORMAT ORDER STATUS
  // ============================================================

  const getStatusClass = (status) => {
    switch (status) {
      case "Delivered":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";

      case "Shipped":
        return "bg-blue-50 text-blue-700 border-blue-200";

      case "Processing":
        return "bg-amber-50 text-amber-700 border-amber-200";

      case "Confirmed":
        return "bg-green-50 text-green-700 border-green-200";

      case "Cancelled":
        return "bg-red-50 text-red-700 border-red-200";

      case "Pending":
      default:
        return "bg-zinc-50 text-zinc-700 border-zinc-200";
    }
  };

  // ============================================================
  // SIGN OUT
  // ============================================================

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">

      {/* ======================================================
          ACCOUNT HEADER
      ====================================================== */}

      <div className="border-b border-zinc-200 pb-6 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">

        <div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-zinc-900">
            MY ACCOUNT
          </h1>

          <p className="text-xs text-zinc-500 uppercase tracking-widest mt-1">
            Logged in as{" "}
            <strong className="text-black">
              {user?.name}
            </strong>{" "}
            ({user?.email})
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="inline-flex items-center space-x-1.5 px-4 py-2 border border-zinc-300 text-xs font-bold uppercase tracking-wider text-zinc-700 hover:text-black hover:border-black cursor-pointer self-start sm:self-auto"
        >
          <LogOut className="w-3.5 h-3.5" />

          <span>
            Sign Out
          </span>
        </button>
      </div>

      {/* ======================================================
          MAIN GRID
      ====================================================== */}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* ====================================================
            PROFILE CARD
        ==================================================== */}

        <div className="lg:col-span-4 space-y-6">

          <div className="border border-zinc-200 p-6 bg-zinc-50/50 space-y-4">

            <div className="flex items-center space-x-3">

              <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center font-bold text-base">
                {user?.name
                  ?.charAt(0)
                  ?.toUpperCase() ||
                  "U"}
              </div>

              <div>
                <h3 className="text-sm font-bold uppercase text-black">
                  {user?.name}
                </h3>

                <p className="text-xs text-zinc-500">
                  {user?.email}
                </p>

                {user?.phone && (
                  <p className="text-xs text-zinc-500">
                    {user.phone}
                  </p>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-zinc-200 text-xs text-zinc-600">
              <p>
                Member Status:{" "}
                <span className="font-bold text-black uppercase">
                  Snitch Club Gold
                </span>
              </p>
            </div>

          </div>
        </div>

        {/* ====================================================
            ORDERS
        ==================================================== */}

        <div className="lg:col-span-8">

          <div className="border border-zinc-200 p-6 bg-white">

            {/* HEADER */}

            <div className="flex items-center space-x-2 border-b border-zinc-200 pb-4 mb-6">

              <Package className="w-4 h-4 text-black" />

              <h2 className="text-xs font-bold uppercase tracking-widest text-black">
                My Orders & Shipments (
                {orders.length}
                )
              </h2>
            </div>

            {/* ==================================================
                ERROR
            ================================================== */}

            {errorMessage && (
              <div className="mb-6 border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
                {errorMessage}
              </div>
            )}

            {/* ==================================================
                LOADING
            ================================================== */}

            {loading ? (
              <div className="py-12 text-center text-xs text-zinc-400">
                Loading order history...
              </div>
            ) : orders.length === 0 ? (

              /* ==================================================
                 EMPTY ORDERS
              ================================================== */

              <div className="py-12 text-center space-y-3">

                <p className="text-sm font-bold uppercase text-zinc-800">
                  No Orders Yet
                </p>

                <p className="text-xs text-zinc-500 max-w-xs mx-auto">
                  When you place an order,
                  you will be able to track
                  your package status right
                  here.
                </p>

                <Link
                  to="/shop"
                  className="inline-block mt-2 px-6 py-2.5 bg-black text-white text-xs font-bold uppercase tracking-wider"
                >
                  Start Shopping
                </Link>

              </div>

            ) : (

              /* ==================================================
                 ORDERS LIST
              ================================================== */

              <div className="space-y-6">

                {orders.map(
                  (order, orderIndex) => {

                    const orderId =
                      order?.orderNumber ||
                      order?.id ||
                      order?._id ||
                      `ORDER-${orderIndex + 1}`;

                    const orderDate =
                      order?.createdAt ||
                      order?.updatedAt ||
                      new Date();

                    const orderStatus =
                      order?.orderStatus ||
                      order?.status ||
                      "Pending";

                    const orderTotal =
                      Number(
                        order?.totalAmount
                      ) || 0;

                    const orderItems =
                      Array.isArray(
                        order?.items
                      )
                        ? order.items
                        : [];

                    return (
                      <div
                        key={orderId}
                        className="border border-zinc-200 p-4 space-y-4"
                      >

                        {/* ======================================
                            ORDER HEADER
                        ====================================== */}

                        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-100 pb-3">

                          {/* ORDER ID */}

                          <div>
                            <span className="text-[10px] text-zinc-400 uppercase font-semibold">
                              Order ID
                            </span>

                            <p className="text-xs font-bold text-black">
                              {orderId}
                            </p>
                          </div>

                          {/* DATE */}

                          <div>
                            <span className="text-[10px] text-zinc-400 uppercase font-semibold">
                              Date
                            </span>

                            <p className="text-xs text-zinc-600">
                              {new Date(
                                orderDate
                              ).toLocaleDateString(
                                "en-IN",
                                {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                }
                              )}
                            </p>
                          </div>

                          {/* STATUS */}

                          <div>
                            <span className="text-[10px] text-zinc-400 uppercase font-semibold">
                              Status
                            </span>

                            <span
                              className={`block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border text-center ${getStatusClass(
                                orderStatus
                              )}`}
                            >
                              {orderStatus}
                            </span>
                          </div>

                          {/* TOTAL */}

                          <div>
                            <span className="text-[10px] text-zinc-400 uppercase font-semibold">
                              Total
                            </span>

                            <p className="text-xs font-black text-black">
                              {formatPrice(
                                orderTotal
                              )}
                            </p>
                          </div>

                        </div>

                        {/* ======================================
                            ORDER ITEMS
                        ====================================== */}

                        <div className="space-y-2">

                          {orderItems.length >
                          0 ? (
                            orderItems.map(
                              (
                                item,
                                idx
                              ) => {

                                const itemName =
                                  item?.title ||
                                  item?.name ||
                                  "Product";

                                const itemImage =
                                  item?.image ||
                                  "";

                                const itemSize =
                                  item?.size ||
                                  "-";

                                const itemQuantity =
                                  Number(
                                    item?.quantity
                                  ) || 1;

                                const itemPrice =
                                  Number(
                                    item?.unitPrice ??
                                      item?.price ??
                                      0
                                  );

                                return (
                                  <div
                                    key={
                                      item?._id ||
                                      idx
                                    }
                                    className="flex items-center space-x-3 text-xs"
                                  >

                                    {/* IMAGE */}

                                    {itemImage ? (
                                      <img
                                        src={
                                          itemImage
                                        }
                                        alt={
                                          itemName
                                        }
                                        className="w-10 h-12 object-cover bg-zinc-100"
                                      />
                                    ) : (
                                      <div className="w-10 h-12 bg-zinc-100 flex items-center justify-center">
                                        <span className="text-[8px] text-zinc-400 uppercase">
                                          No Image
                                        </span>
                                      </div>
                                    )}

                                    {/* INFO */}

                                    <div className="flex-1 min-w-0">

                                      <p className="font-semibold text-zinc-900 truncate uppercase">
                                        {itemName}
                                      </p>

                                      <p className="text-[11px] text-zinc-500">
                                        Size:{" "}
                                        {itemSize}{" "}
                                        • Qty:{" "}
                                        {
                                          itemQuantity
                                        }
                                      </p>
                                    </div>

                                    {/* PRICE */}

                                    <span className="font-bold">
                                      {formatPrice(
                                        itemPrice *
                                          itemQuantity
                                      )}
                                    </span>

                                  </div>
                                );
                              }
                            )
                          ) : (
                            <p className="text-xs text-zinc-500">
                              Order items
                              unavailable.
                            </p>
                          )}

                        </div>

                      </div>
                    );
                  }
                )}

              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;