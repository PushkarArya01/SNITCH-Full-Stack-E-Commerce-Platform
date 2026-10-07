import React, { useEffect, useMemo, useState } from 'react';

import {
  Package,
  CheckCircle,
  XCircle,
  RefreshCw,
  AlertCircle,
  Trash2,
} from 'lucide-react';

import { useNavigate } from 'react-router-dom';

import sellerApi from '../api/sellerApi';
import { formatPrice } from '../utils/formatCurrency';

const SellerDashboardPage = () => {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Product action loading
  const [actionLoading, setActionLoading] = useState(null);

  // Delete loading
  const [deleteLoading, setDeleteLoading] = useState(null);

  const [error, setError] = useState('');

  /*
   * ============================================================
   * LOAD SELLER PRODUCTS
   * ============================================================
   */

  const loadProducts = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await sellerApi.getProducts();

      setProducts(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (err) {
      console.error(
        'Failed to load seller products:',
        err
      );

      setError(
        err?.response?.data?.message ||
          'Failed to load seller products.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  /*
   * ============================================================
   * PRODUCT ID
   * ============================================================
   */

  const getProductId = (product) => {
    return product?.id || product?._id;
  };

  /*
   * ============================================================
   * PRODUCT STOCK
   * ============================================================
   */

  const getTotalStock = (product) => {
    if (!Array.isArray(product?.sizes)) {
      return 0;
    }

    return product.sizes.reduce(
      (total, sizeItem) => {
        const stock =
          typeof sizeItem === 'object'
            ? Number(sizeItem?.stock) || 0
            : 0;

        return total + stock;
      },
      0
    );
  };

  /*
   * ============================================================
   * EDIT PRODUCT
   * ============================================================
   */

  const handleEdit = (productId) => {
    if (!productId) {
      setError('Product ID is missing.');
      return;
    }

    navigate(
      `/seller/products/edit/${productId}`
    );
  };

  /*
   * ============================================================
   * UNLIST PRODUCT
   * ============================================================
   */

  const handleUnlist = async (productId) => {
    setActionLoading(productId);
    setError('');

    try {
      await sellerApi.unlistProduct(productId);

      /*
       * IMPORTANT:
       * Product ko dashboard se remove nahi karna.
       * Sirf published ko false karna hai.
       *
       * Isse seller baad mein same product ko
       * dobara LIST kar sakta hai.
       */

      setProducts((prevProducts) =>
        prevProducts.map((product) =>
          String(getProductId(product)) ===
          String(productId)
            ? {
                ...product,
                published: false,
              }
            : product
        )
      );
    } catch (err) {
      console.error(
        'Failed to unlist product:',
        err
      );

      setError(
        err?.response?.data?.message ||
          'Failed to unlist product.'
      );
    } finally {
      setActionLoading(null);
    }
  };

  /*
   * ============================================================
   * LIST PRODUCT
   * ============================================================
   */

  const handleList = async (productId) => {
    setActionLoading(productId);
    setError('');

    try {
      await sellerApi.listProduct(productId);

      /*
       * Update product locally instead of
       * reloading the complete page.
       */

      setProducts((prevProducts) =>
        prevProducts.map((product) =>
          String(getProductId(product)) ===
          String(productId)
            ? {
                ...product,
                published: true,
              }
            : product
        )
      );
    } catch (err) {
      console.error(
        'Failed to list product:',
        err
      );

      setError(
        err?.response?.data?.message ||
          'Failed to list product.'
      );
    } finally {
      setActionLoading(null);
    }
  };

  /*
   * ============================================================
   * DELETE PRODUCT
   * ============================================================
   */

  const handleDelete = async (productId, title) => {
    if (!productId) {
      setError('Product ID is missing.');
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete "${title}"?\n\nThis action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    setDeleteLoading(productId);
    setError('');

    try {
      await sellerApi.deleteProduct(productId);

      /*
       * Remove deleted product from dashboard.
       */

      setProducts((prevProducts) =>
        prevProducts.filter(
          (product) =>
            String(getProductId(product)) !==
            String(productId)
        )
      );
    } catch (err) {
      console.error(
        'Failed to delete product:',
        err
      );

      setError(
        err?.response?.data?.message ||
          'Failed to delete product.'
      );
    } finally {
      setDeleteLoading(null);
    }
  };

  /*
   * ============================================================
   * STATS
   * ============================================================
   */

  const stats = useMemo(() => {
    const total = products.length;

    const listed = products.filter(
      (product) =>
        product?.published === true
    ).length;

    const unlisted = total - listed;

    const totalStock = products.reduce(
      (totalStock, product) =>
        totalStock + getTotalStock(product),
      0
    );

    return {
      total,
      listed,
      unlisted,
      totalStock,
    };
  }, [products]);

  /*
   * ============================================================
   * LOADING
   * ============================================================
   */

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 p-6 md:p-10">
        <div className="max-w-7xl mx-auto">

          <div className="h-8 w-56 bg-zinc-200 animate-pulse mb-8" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map(
              (item) => (
                <div
                  key={item}
                  className="h-28 bg-white border border-zinc-200 animate-pulse"
                />
              )
            )}
          </div>

          <div className="h-96 bg-white border border-zinc-200 animate-pulse" />

        </div>
      </div>
    );
  }

  /*
   * ============================================================
   * PAGE
   * ============================================================
   */

  return (
    <div className="min-h-screen bg-zinc-50">

      {/* ========================================================
          HEADER
      ======================================================== */}

      <div className="bg-black text-white">
        <div className="max-w-7xl mx-auto px-5 md:px-8 py-6">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

            <div>
              <p className="text-[10px] uppercase tracking-[0.25em] text-zinc-400 font-bold">
                SNITCH
              </p>

              <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight mt-1">
                Seller Dashboard
              </h1>

              <p className="text-xs text-zinc-400 mt-1">
                Manage your products and listings
              </p>
            </div>

            <button
              type="button"
              onClick={loadProducts}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-black text-xs font-bold uppercase tracking-wider hover:bg-zinc-200 transition cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />

              Refresh
            </button>

          </div>
        </div>
      </div>

      {/* ========================================================
          CONTENT
      ======================================================== */}

      <main className="max-w-7xl mx-auto px-5 md:px-8 py-8">

        {/* ======================================================
            ERROR
        ====================================================== */}

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

        {/* ======================================================
            STATS
        ====================================================== */}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">

          {/* Total */}

          <div className="bg-white border border-zinc-200 p-5">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                  Total Products
                </p>

                <p className="text-3xl font-black mt-2">
                  {stats.total}
                </p>
              </div>

              <div className="w-10 h-10 bg-zinc-100 flex items-center justify-center">
                <Package className="w-5 h-5 text-zinc-700" />
              </div>

            </div>

          </div>

          {/* Listed */}

          <div className="bg-white border border-zinc-200 p-5">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                  Listed
                </p>

                <p className="text-3xl font-black mt-2">
                  {stats.listed}
                </p>
              </div>

              <div className="w-10 h-10 bg-emerald-50 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
              </div>

            </div>

          </div>

          {/* Unlisted */}

          <div className="bg-white border border-zinc-200 p-5">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                  Unlisted
                </p>

                <p className="text-3xl font-black mt-2">
                  {stats.unlisted}
                </p>
              </div>

              <div className="w-10 h-10 bg-red-50 flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-500" />
              </div>

            </div>

          </div>

          {/* Total Stock */}

          <div className="bg-white border border-zinc-200 p-5">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                  Total Stock
                </p>

                <p className="text-3xl font-black mt-2">
                  {stats.totalStock}
                </p>
              </div>

              <div className="w-10 h-10 bg-zinc-100 flex items-center justify-center">
                <Package className="w-5 h-5 text-zinc-700" />
              </div>

            </div>

          </div>

        </div>

        {/* ======================================================
            PRODUCTS
        ====================================================== */}

        <section className="bg-white border border-zinc-200">

          {/* Section Header */}

          <div className="px-5 md:px-6 py-5 border-b border-zinc-200">

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">

              <div>
                <h2 className="text-sm font-black uppercase tracking-wider">
                  Your Products
                </h2>

                <p className="text-xs text-zinc-400 mt-1">
                  Products returned by your seller account
                </p>
              </div>

              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                {products.length} Product
                {products.length !== 1
                  ? 's'
                  : ''}
              </span>

            </div>

          </div>

          {/* ==================================================
              EMPTY
          ================================================== */}

          {products.length === 0 ? (
            <div className="py-20 text-center">

              <Package className="w-10 h-10 mx-auto text-zinc-300" />

              <h3 className="text-sm font-bold uppercase mt-4">
                No Products Found
              </h3>

              <p className="text-xs text-zinc-400 mt-1">
                Your seller account has no products yet.
              </p>

            </div>
          ) : (

            /* ==================================================
               DESKTOP TABLE
            ================================================== */

            <div className="overflow-x-auto">

              <table className="w-full min-w-[1100px]">

                <thead>

                  <tr className="bg-zinc-50 border-b border-zinc-200">

                    <th className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                      Product
                    </th>

                    <th className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                      Category
                    </th>

                    <th className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                      Price
                    </th>

                    <th className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                      Stock
                    </th>

                    <th className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                      Status
                    </th>

                    <th className="text-right px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                      Action
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {products.map(
                    (product) => {

                      const productId =
                        getProductId(product);

                      const title =
                        product?.name ||
                        product?.title ||
                        'Untitled Product';

                      const image =
                        product?.images?.[0];

                      const published =
                        product?.published === true;

                      const stock =
                        getTotalStock(product);

                      const isActionLoading =
                        actionLoading ===
                        productId;

                      const isDeleteLoading =
                        deleteLoading ===
                        productId;

                      return (
                        <tr
                          key={productId}
                          className="border-b border-zinc-100 hover:bg-zinc-50 transition"
                        >

                          {/* Product */}

                          <td className="px-5 py-4">

                            <div className="flex items-center gap-3">

                              <div className="w-14 h-16 bg-zinc-100 shrink-0 overflow-hidden">

                                {image ? (
                                  <img
                                    src={image}
                                    alt={title}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <Package className="w-5 h-5 text-zinc-300" />
                                  </div>
                                )}

                              </div>

                              <div className="min-w-0">

                                <p className="text-xs font-bold uppercase text-zinc-900 truncate max-w-[250px]">
                                  {title}
                                </p>

                                <p className="text-[10px] text-zinc-400 mt-1">
                                  ID:{' '}
                                  {String(productId).slice(-8)}
                                </p>

                              </div>

                            </div>

                          </td>

                          {/* Category */}

                          <td className="px-5 py-4">

                            <span className="text-[10px] font-bold uppercase text-zinc-500">
                              {product?.category || '—'}
                            </span>

                          </td>

                          {/* Price */}

                          <td className="px-5 py-4">

                            <span className="text-xs font-bold">
                              {formatPrice(
                                product?.price?.amount
                              )}
                            </span>

                          </td>

                          {/* Stock */}

                          <td className="px-5 py-4">

                            <span
                              className={`text-xs font-bold ${
                                stock > 0
                                  ? 'text-zinc-900'
                                  : 'text-red-600'
                              }`}
                            >
                              {stock}
                            </span>

                          </td>

                          {/* Status */}

                          <td className="px-5 py-4">

                            {published ? (
                              <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-emerald-50 text-emerald-700 text-[9px] font-bold uppercase tracking-wider">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                Listed
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-red-50 text-red-700 text-[9px] font-bold uppercase tracking-wider">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                Unlisted
                              </span>
                            )}

                          </td>

                          {/* ==================================================
                              ACTIONS
                          ================================================== */}

                          <td className="px-5 py-4">

                            <div className="flex items-center justify-end gap-2">

                              {/* EDIT */}

                              <button
                                type="button"
                                onClick={() =>
                                  handleEdit(
                                    productId
                                  )
                                }
                                disabled={
                                  isDeleteLoading
                                }
                                className="px-3 py-2 border border-zinc-300 bg-white text-black text-[10px] font-bold uppercase tracking-wider hover:bg-zinc-100 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
                              >
                                Edit
                              </button>

                              {/* LIST / UNLIST */}

                              {published ? (
                                <button
                                  type="button"
                                  disabled={
                                    isActionLoading ||
                                    isDeleteLoading
                                  }
                                  onClick={() =>
                                    handleUnlist(
                                      productId
                                    )
                                  }
                                  className="px-3 py-2 bg-black text-white text-[10px] font-bold uppercase tracking-wider hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
                                >
                                  {isActionLoading
                                    ? 'Processing...'
                                    : 'Unlist'}
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  disabled={
                                    isActionLoading ||
                                    isDeleteLoading
                                  }
                                  onClick={() =>
                                    handleList(
                                      productId
                                    )
                                  }
                                  className="px-3 py-2 bg-black text-white text-[10px] font-bold uppercase tracking-wider hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
                                >
                                  {isActionLoading
                                    ? 'Processing...'
                                    : 'List'}
                                </button>
                              )}

                              {/* DELETE */}

                              <button
                                type="button"
                                disabled={
                                  isDeleteLoading ||
                                  isActionLoading
                                }
                                onClick={() =>
                                  handleDelete(
                                    productId,
                                    title
                                  )
                                }
                                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-red-600 text-white text-[10px] font-bold uppercase tracking-wider hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />

                                {isDeleteLoading
                                  ? 'Deleting...'
                                  : 'Delete'}
                              </button>

                            </div>

                          </td>

                        </tr>
                      );
                    }
                  )}

                </tbody>

              </table>

            </div>
          )}

        </section>

      </main>

    </div>
  );
};

export default SellerDashboardPage;