import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

import {
  Heart,
  Star,
  Truck,
  ChevronDown,
  ChevronUp,
  Ruler,
  ArrowRight,
} from 'lucide-react';

import { productApi } from '../api/productApi';
import { formatPrice, calculateDiscount } from '../utils/formatCurrency';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import ProductCard from '../components/product/ProductCard';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');

  const [sizeError, setSizeError] = useState(false);
  const [stockError, setStockError] = useState('');

  const [pincode, setPincode] = useState('');
  const [pincodeStatus, setPincodeStatus] = useState(null);

  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [openAccordion, setOpenAccordion] = useState('desc');

  const [relatedProducts, setRelatedProducts] = useState([]);

  /*
   * ----------------------------------------------------
   * FETCH PRODUCT
   * ----------------------------------------------------
   */
  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);

      try {
        const item = await productApi.getProductById(id);

        if (!item) {
          setProduct(null);
          return;
        }

        setProduct(item);

        /*
         * IMPORTANT:
         * sizes are objects:
         *
         * {
         *   size: "M",
         *   stock: 50
         * }
         *
         * We store only "M" in selectedSize.
         */
        if (Array.isArray(item.sizes) && item.sizes.length > 0) {
          const firstAvailableSize = item.sizes.find(
            (sizeItem) => Number(sizeItem?.stock) > 0
          );

          setSelectedSize(firstAvailableSize?.size || '');
        } else {
          setSelectedSize('');
        }

        setSelectedImage(0);

        /*
         * Fetch related products
         */
        try {
          const allProducts = await productApi.getProducts();

          if (Array.isArray(allProducts)) {
            setRelatedProducts(
              allProducts
                .filter(
                  (p) => String(p.id) !== String(item.id)
                )
                .slice(0, 4)
            );
          }
        } catch (relatedError) {
          console.error(
            'Failed to fetch related products:',
            relatedError
          );

          setRelatedProducts([]);
        }
      } catch (error) {
        console.error(
          'Failed to fetch product:',
          error
        );

        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }, [id]);

  /*
   * ----------------------------------------------------
   * LOADING STATE
   * ----------------------------------------------------
   */
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 animate-pulse">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="aspect-[3/4] bg-zinc-200" />

          <div className="space-y-4">
            <div className="h-8 bg-zinc-200 w-3/4" />
            <div className="h-5 bg-zinc-200 w-1/4" />
            <div className="h-24 bg-zinc-200" />
          </div>
        </div>
      </div>
    );
  }

  /*
   * ----------------------------------------------------
   * PRODUCT NOT FOUND
   * ----------------------------------------------------
   */
  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold uppercase">
          Product Not Found
        </h2>

        <p className="text-xs text-zinc-500 mt-2">
          The item you requested does not exist in our catalog.
        </p>

        <Link
          to="/shop"
          className="mt-4 inline-block px-6 py-2.5 bg-black text-white text-xs font-bold uppercase tracking-wider"
        >
          Back to Shop
        </Link>
      </div>
    );
  }

  /*
   * ----------------------------------------------------
   * PRODUCT HELPERS
   * ----------------------------------------------------
   */

  const productId = product.id || product._id;

  const isFavorited = isInWishlist(productId);

  const discount = calculateDiscount(
    product.originalPrice,
    product.price
  );

  const productSizes = Array.isArray(product.sizes)
    ? product.sizes
    : [];

  /*
   * Find selected size data
   */
  const selectedSizeData = productSizes.find(
    (sizeItem) =>
      sizeItem?.size === selectedSize
  );

  const selectedStock =
    Number(selectedSizeData?.stock) || 0;

  /*
   * ----------------------------------------------------
   * ADD TO CART
   * ----------------------------------------------------
   */
  const handleAddToCart = async () => {
    /*
     * No size selected
     */
    if (!selectedSize) {
      setSizeError(true);
      setStockError('');
      return;
    }

    /*
     * Check selected size stock
     */
    const sizeData = productSizes.find(
      (sizeItem) =>
        sizeItem?.size === selectedSize
    );

    const stock =
      Number(sizeData?.stock) || 0;

    if (stock <= 0) {
      setSizeError(false);
      setStockError(
        'This size is currently unavailable.'
      );
      return;
    }

    setSizeError(false);
    setStockError('');

    try {
      const result = await addToCart(
        product,
        selectedSize,
        1
      );

      /*
       * CartContext may return a result.
       * If it reports failure, show the message.
       */
      if (result?.success === false) {
        setStockError(
          result.message ||
            'Unable to add this product to cart.'
        );
      }
    } catch (error) {
      console.error(
        'Add to cart failed:',
        error
      );

      setStockError(
        error?.response?.data?.message ||
          error?.message ||
          'Unable to add this product to cart.'
      );
    }
  };

  /*
   * ----------------------------------------------------
   * BUY NOW
   * ----------------------------------------------------
   */
  const handleBuyNow = async () => {
    /*
     * No size selected
     */
    if (!selectedSize) {
      setSizeError(true);
      setStockError('');
      return;
    }

    /*
     * Check stock
     */
    const sizeData = productSizes.find(
      (sizeItem) =>
        sizeItem?.size === selectedSize
    );

    const stock =
      Number(sizeData?.stock) || 0;

    if (stock <= 0) {
      setSizeError(false);
      setStockError(
        'This size is currently unavailable.'
      );
      return;
    }

    setSizeError(false);
    setStockError('');

    try {
      const result = await addToCart(
        product,
        selectedSize,
        1
      );

      if (result?.success === false) {
        setStockError(
          result.message ||
            'Unable to proceed with checkout.'
        );
        return;
      }

      navigate('/checkout');
    } catch (error) {
      console.error(
        'Buy now failed:',
        error
      );

      setStockError(
        error?.response?.data?.message ||
          error?.message ||
          'Unable to proceed with checkout.'
      );
    }
  };

  /*
   * ----------------------------------------------------
   * DELIVERY CHECK
   * ----------------------------------------------------
   */
  const checkDelivery = (event) => {
    event.preventDefault();

    if (
      pincode.length === 6 &&
      /^\d+$/.test(pincode)
    ) {
      setPincodeStatus({
        success: true,
        message:
          'Delivery available! Expected delivery in 2-4 business days.',
      });
    } else {
      setPincodeStatus({
        success: false,
        message:
          'Please enter a valid 6-digit Indian PIN code.',
      });
    }
  };

  /*
   * ----------------------------------------------------
   * ACCORDION
   * ----------------------------------------------------
   */
  const toggleAccordion = (name) => {
    setOpenAccordion(
      openAccordion === name
        ? ''
        : name
    );
  };

  /*
   * ----------------------------------------------------
   * RENDER
   * ----------------------------------------------------
   */
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">

      {/* ================================================
          BREADCRUMB
      ================================================= */}
      <nav className="text-[11px] text-zinc-400 uppercase tracking-wider mb-6 flex items-center space-x-2">
        <Link
          to="/"
          className="hover:text-black transition"
        >
          Home
        </Link>

        <span>/</span>

        <Link
          to={`/shop?category=${product.category || ''}`}
          className="hover:text-black transition"
        >
          {product.category || 'Products'}
        </Link>

        <span>/</span>

        <span className="text-black font-semibold truncate max-w-[200px]">
          {product.name}
        </span>
      </nav>

      {/* ================================================
          MAIN PRODUCT SECTION
      ================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

        {/* ==============================================
            LEFT - PRODUCT IMAGES
        =============================================== */}
        <div className="lg:col-span-7 flex flex-col-reverse md:flex-row gap-4">

          {/* Thumbnails */}
          <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto max-h-[580px] no-scrollbar">

            {product.images?.map(
              (img, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() =>
                    setSelectedImage(index)
                  }
                  className={`relative w-16 h-20 sm:w-20 sm:h-24 flex-shrink-0 border-2 overflow-hidden cursor-pointer transition ${
                    selectedImage === index
                      ? 'border-black'
                      : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={img}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </button>
              )
            )}
          </div>

          {/* Main Image */}
          <div className="flex-1 relative aspect-[3/4] bg-zinc-100 overflow-hidden border border-zinc-200">

            <img
              src={
                product.images?.[
                  selectedImage
                ] ||
                product.images?.[0]
              }
              alt={product.name}
              className="w-full h-full object-cover object-top transition duration-500 hover:scale-105"
            />

            {product.badge && (
              <div className="absolute top-3 left-3 bg-black text-white text-[10px] font-bold tracking-widest uppercase px-2.5 py-1">
                {product.badge}
              </div>
            )}

            {/* Wishlist */}
            <button
              type="button"
              onClick={() =>
                toggleWishlist(product)
              }
              className="absolute top-3 right-3 p-2.5 bg-white/90 hover:bg-white rounded-full text-black shadow-md cursor-pointer transition"
            >
              <Heart
                className={`w-5 h-5 ${
                  isFavorited
                    ? 'fill-red-500 text-red-500'
                    : 'text-zinc-700'
                }`}
              />
            </button>
          </div>
        </div>

        {/* ==============================================
            RIGHT - PRODUCT DETAILS
        =============================================== */}
        <div className="lg:col-span-5 flex flex-col space-y-6">

          {/* Product title */}
          <div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">
              SNITCH APPAREL
            </span>

            <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-zinc-900 mt-1">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center space-x-2 mt-2">
              <div className="flex items-center bg-black text-white text-xs px-2 py-0.5 font-bold">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400 mr-1" />

                <span>
                  {product.rating || '4.8'}
                </span>
              </div>

              <span className="text-xs text-zinc-500">
                (
                {product.reviewsCount ||
                  120}{' '}
                Verified Reviews)
              </span>
            </div>
          </div>

          {/* ==========================================
              PRICE
          =========================================== */}
          <div className="border-y border-zinc-200 py-3">
            <div className="flex items-baseline space-x-3">

              <span className="text-2xl font-black text-black">
                {formatPrice(product.price)}
              </span>

              {product.originalPrice &&
                product.originalPrice >
                  product.price && (
                  <>
                    <span className="text-sm text-zinc-400 line-through">
                      {formatPrice(
                        product.originalPrice
                      )}
                    </span>

                    <span className="text-xs font-bold text-emerald-600 uppercase tracking-wide">
                      {discount}% OFF
                    </span>
                  </>
                )}
            </div>

            <p className="text-[11px] text-zinc-500 mt-1">
              Inclusive of all taxes
            </p>
          </div>

  {/* ============================================================
    SIZE / VOLUME SELECTOR
============================================================ */}

<div>
  <div className="flex items-center justify-between mb-2">
<div className="text-xs font-bold uppercase tracking-wider text-black">
  {product?.category === 'perfumes'
    ? 'Select Volume:'
    : 'Select Size:'}{' '}
  <span className="font-semibold text-zinc-500">
    {selectedSize || 'Select'}
  </span>
</div>

    {product?.category !== 'perfumes' && (
      <button
        type="button"
        onClick={() => setSizeGuideOpen(true)}
        className="text-xs font-bold uppercase tracking-wider text-zinc-600 hover:text-black flex items-center cursor-pointer"
      >
        <Ruler className="w-3.5 h-3.5 mr-1" />
        Size Guide
      </button>
    )}
  </div>

  {/* SIZE / VOLUME BUTTONS */}

  <div
    className={`grid gap-2 ${
      product?.category === 'perfumes'
        ? 'grid-cols-3'
        : 'grid-cols-3 sm:grid-cols-5'
    }`}
  >
    {product?.sizes?.map((sizeItem) => {
      const sizeName = sizeItem?.size;
      const stock = Math.max(
        0,
        Number(sizeItem?.stock) || 0
      );

      const unavailable = stock <= 0;
      const isSelected = selectedSize === sizeName;

      return (
        <button
          key={sizeName}
          type="button"
          disabled={unavailable}
          onClick={() => {
            if (unavailable) return;

            setSelectedSize(sizeName);
            setSizeError(false);
            setStockError('');
          }}
          className={`py-2.5 px-1 text-xs font-bold uppercase border transition-all ${
            unavailable
              ? 'border-zinc-200 bg-zinc-100 text-zinc-400 cursor-not-allowed'
              : isSelected
              ? 'border-black bg-black text-white cursor-pointer'
              : 'border-zinc-300 hover:border-black bg-white text-black cursor-pointer'
          }`}
        >
          {/* SIZE / VOLUME */}
          <span
            className={
              unavailable
                ? 'line-through'
                : ''
            }
          >
            {sizeName}
          </span>

          {/* STOCK QUANTITY */}
          <span
            className={`block text-[9px] mt-1 normal-case tracking-normal ${
              isSelected
                ? 'text-zinc-300'
                : unavailable
                ? 'text-zinc-400'
                : 'text-zinc-500'
            }`}
          >
            {unavailable
              ? 'Unavailable'
              : `${stock} available`}
          </span>
        </button>
      );
    })}
  </div>

  {/* SIZE ERROR */}

  {sizeError && (
    <p className="text-xs text-red-600 font-semibold mt-2">
      Please select a{' '}
      {product?.category === 'perfumes'
        ? 'volume'
        : 'size'}{' '}
      before adding to bag.
    </p>
  )}

  {/* STOCK ERROR */}

  {stockError && (
    <p className="text-xs text-red-600 font-semibold mt-2">
      {stockError}
    </p>
  )}
</div>
          {/* ==========================================
              ACTION BUTTONS
          =========================================== */}
          <div className="space-y-2.5 pt-2">

            <button
              type="button"
              onClick={handleAddToCart}
              className="w-full py-4 bg-black hover:bg-zinc-800 text-white font-black text-xs uppercase tracking-widest transition cursor-pointer"
            >
              Add To Bag
            </button>

            <button
              type="button"
              onClick={handleBuyNow}
              className="w-full py-4 bg-zinc-100 hover:bg-zinc-200 text-black font-black text-xs uppercase tracking-widest border border-black transition cursor-pointer"
            >
              Buy It Now
            </button>
          </div>

          {/* ==========================================
              DELIVERY
          =========================================== */}
          <div className="p-4 bg-zinc-50 border border-zinc-200 space-y-2">

            <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider">
              <Truck className="w-4 h-4 text-zinc-700" />

              <span>
                Delivery & Shipping Options
              </span>
            </div>

            <form
              onSubmit={checkDelivery}
              className="flex gap-2"
            >
              <input
                type="text"
                maxLength={6}
                value={pincode}
                onChange={(event) =>
                  setPincode(
                    event.target.value
                  )
                }
                placeholder="Enter 6-digit Pincode"
                className="flex-1 px-3 py-1.5 text-xs bg-white border border-zinc-300 focus:border-black outline-none font-medium"
              />

              <button
                type="submit"
                className="px-4 py-1.5 bg-black text-white text-xs font-bold uppercase tracking-wider hover:bg-zinc-800 cursor-pointer"
              >
                Check
              </button>
            </form>

            {pincodeStatus && (
              <p
                className={`text-xs font-medium ${
                  pincodeStatus.success
                    ? 'text-emerald-700'
                    : 'text-red-600'
                }`}
              >
                {pincodeStatus.message}
              </p>
            )}
          </div>

          {/* ==========================================
              ACCORDIONS
          =========================================== */}
          <div className="border-t border-zinc-200 pt-2 divide-y divide-zinc-200">

            {/* Description */}
            <div className="py-3">
              <button
                type="button"
                onClick={() =>
                  toggleAccordion('desc')
                }
                className="w-full flex justify-between items-center text-xs font-bold uppercase tracking-wider text-left cursor-pointer"
              >
                <span>
                  Product Description
                </span>

                {openAccordion ===
                'desc' ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>

              {openAccordion === 'desc' && (
                <div className="mt-2 text-xs text-zinc-600 space-y-2 leading-relaxed">

                  <p>
                    {product.description}
                  </p>

                  <ul className="list-disc list-inside space-y-1 text-zinc-500 pt-1">
                    <li>
                      Fit:{' '}
                      <strong className="text-zinc-800">
                        {product.fit ||
                          'Modern Relaxed'}
                      </strong>
                    </li>

                    <li>
                      Color:{' '}
                      <strong className="text-zinc-800">
                        {product.color ||
                          'Solid'}
                      </strong>
                    </li>
                  </ul>
                </div>
              )}
            </div>

            {/* Material */}
            <div className="py-3">
              <button
                type="button"
                onClick={() =>
                  toggleAccordion('fabric')
                }
                className="w-full flex justify-between items-center text-xs font-bold uppercase tracking-wider text-left cursor-pointer"
              >
                <span>
                  Material & Fabric Care
                </span>

                {openAccordion ===
                'fabric' ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>

              {openAccordion === 'fabric' && (
                <div className="mt-2 text-xs text-zinc-600 space-y-2 leading-relaxed">

                  <p>
                    <strong>
                      Fabric:
                    </strong>{' '}
                    {product.fabric ||
                      '100% Premium Cotton'}
                  </p>

                  <p>
                    <strong>
                      Wash Care:
                    </strong>{' '}
                    {product.care ||
                      'Machine wash cold with like colors.'}
                  </p>
                </div>
              )}
            </div>

            {/* Shipping */}
            <div className="py-3">
              <button
                type="button"
                onClick={() =>
                  toggleAccordion('shipping')
                }
                className="w-full flex justify-between items-center text-xs font-bold uppercase tracking-wider text-left cursor-pointer"
              >
                <span>
                  Shipping, Return & Exchange
                </span>

                {openAccordion ===
                'shipping' ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>

              {openAccordion ===
                'shipping' && (
                <div className="mt-2 text-xs text-zinc-600 space-y-1.5 leading-relaxed">
                  <p>
                    • Free shipping on
                    prepaid orders above
                    ₹999.
                  </p>

                  <p>
                    • 7-day hassle-free
                    reverse pickup from
                    your doorstep.
                  </p>

                  <p>
                    • Instant exchange for
                    size or store credit
                    refund.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ==============================================
          RELATED PRODUCTS
      =============================================== */}
      {relatedProducts.length > 0 && (
        <section className="mt-20 pt-12 border-t border-zinc-200">

          <div className="flex items-center justify-between mb-8">

            <h3 className="text-xl font-black uppercase tracking-tight text-zinc-900">
              YOU MAY ALSO LIKE
            </h3>

            <Link
              to="/shop"
              className="text-xs font-bold uppercase tracking-wider text-black hover:underline flex items-center"
            >
              Shop All

              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">

            {relatedProducts.map(
              (relatedProduct) => (
                <ProductCard
                  key={
                    relatedProduct.id ||
                    relatedProduct._id
                  }
                  product={relatedProduct}
                />
              )
            )}
          </div>
        </section>
      )}

      {/* ==============================================
          SIZE GUIDE MODAL
      =============================================== */}
      {sizeGuideOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">

          <div className="bg-white w-full max-w-lg p-6 border border-zinc-200 shadow-2xl relative">

            <button
              type="button"
              onClick={() =>
                setSizeGuideOpen(false)
              }
              className="absolute top-4 right-4 text-zinc-500 hover:text-black font-bold uppercase text-xs cursor-pointer"
            >
              Close
            </button>

            <h3 className="text-sm font-black uppercase tracking-wider mb-2">
              Size Chart & Fit Guide
            </h3>

            <p className="text-xs text-zinc-500 mb-4">
              All measurements are in inches. True to Indian standard sizing.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">

                <thead>
                  <tr className="bg-zinc-100 uppercase text-[11px] font-bold">

                    <th className="p-2.5 border border-zinc-200">
                      Size
                    </th>

                    <th className="p-2.5 border border-zinc-200">
                      Chest (Inches)
                    </th>

                    <th className="p-2.5 border border-zinc-200">
                      Shoulder
                    </th>

                    <th className="p-2.5 border border-zinc-200">
                      Length
                    </th>

                  </tr>
                </thead>

                <tbody>

                  <tr>
                    <td className="p-2.5 font-bold border border-zinc-200">
                      S
                    </td>

                    <td className="p-2.5 border border-zinc-200">
                      38
                    </td>

                    <td className="p-2.5 border border-zinc-200">
                      17.5
                    </td>

                    <td className="p-2.5 border border-zinc-200">
                      28
                    </td>
                  </tr>

                  <tr>
                    <td className="p-2.5 font-bold border border-zinc-200">
                      M
                    </td>

                    <td className="p-2.5 border border-zinc-200">
                      40
                    </td>

                    <td className="p-2.5 border border-zinc-200">
                      18.5
                    </td>

                    <td className="p-2.5 border border-zinc-200">
                      29
                    </td>
                  </tr>

                  <tr>
                    <td className="p-2.5 font-bold border border-zinc-200">
                      L
                    </td>

                    <td className="p-2.5 border border-zinc-200">
                      42
                    </td>

                    <td className="p-2.5 border border-zinc-200">
                      19.5
                    </td>

                    <td className="p-2.5 border border-zinc-200">
                      30
                    </td>
                  </tr>

                  <tr>
                    <td className="p-2.5 font-bold border border-zinc-200">
                      XL
                    </td>

                    <td className="p-2.5 border border-zinc-200">
                      44
                    </td>

                    <td className="p-2.5 border border-zinc-200">
                      20.5
                    </td>

                    <td className="p-2.5 border border-zinc-200">
                      31
                    </td>
                  </tr>

                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailPage;