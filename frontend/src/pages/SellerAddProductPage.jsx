import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  ArrowLeft,
  ImagePlus,
  X,
  Plus,
  Minus,
  PackagePlus,
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import sellerApi from '../api/sellerApi';

const CATEGORIES = [
  {
    value: 'shirts',
    label: 'Shirts',
  },
  {
    value: 't-shirts',
    label: 'T-Shirts',
  },
  {
    value: 'bottoms',
    label: 'Bottoms',
  },
  {
    value: 'oversized',
    label: 'Oversized',
  },
  {
    value: 'luxe',
    label: 'Luxe',
  },
  {
    value: 'co-ords',
    label: 'Co-Ords',
  },
  {
    value: 'perfumes',
    label: 'Perfumes',
  },
];

const CLOTHING_SIZES = [
  'XS',
  'S',
  'M',
  'L',
  'XL',
  'XXL',
];

const PERFUME_VOLUMES = [
  '50ml',
  '100ml',
  '150ml',
];

const MAX_IMAGES = 5;
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const SellerAddProductPage = () => {
  const navigate = useNavigate();

  const {
    user,
    isAuthenticated,
  } = useAuth();

  // ============================================================
  // PRODUCT FORM
  // ============================================================

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('INR');

  // ============================================================
  // SIZE / VOLUME STOCK
  // ============================================================

  const [sizes, setSizes] = useState([]);

  // IMPORTANT:
  // Clothing -> XS, S, M, L, XL, XXL
  // Perfumes -> 50ml, 100ml, 150ml
  const availableVariants =
    category === 'perfumes'
      ? PERFUME_VOLUMES
      : CLOTHING_SIZES;

  // ============================================================
  // IMAGES
  // ============================================================

  const [images, setImages] = useState([]);
  const [imageUrls, setImageUrls] = useState([]);
  const [imageUrlInput, setImageUrlInput] = useState('');

  // ============================================================
  // UI STATE
  // ============================================================

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // ============================================================
  // SELLER PROTECTION
  // ============================================================

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', {
        replace: true,
      });

      return;
    }

    if (user?.role !== 'seller') {
      navigate('/', {
        replace: true,
      });
    }
  }, [
    isAuthenticated,
    user,
    navigate,
  ]);

  // ============================================================
  // CATEGORY CHANGE
  // ============================================================

  const handleCategoryChange = (event) => {
    const nextCategory = event.target.value;

    setCategory(nextCategory);

    const nextVariants =
      nextCategory === 'perfumes'
        ? PERFUME_VOLUMES
        : CLOTHING_SIZES;

    // Preserve stock for variants that exist in both lists.
    // This also prevents clothing sizes from remaining
    // when switching to perfume.
    setSizes((currentSizes) =>
      nextVariants.map((variant) => {
        const existingVariant = currentSizes.find(
          (item) => item.size === variant
        );

        return {
          size: variant,
          stock: existingVariant?.stock ?? 0,
        };
      })
    );
  };

  // ============================================================
  // SELECT / REMOVE SIZE OR VOLUME
  // ============================================================

  const toggleSize = (size) => {
    setSizes((currentSizes) => {
      const alreadySelected = currentSizes.some(
        (item) => item.size === size
      );

      if (alreadySelected) {
        return currentSizes.filter(
          (item) => item.size !== size
        );
      }

      return [
        ...currentSizes,
        {
          size,
          stock: 0,
        },
      ];
    });
  };

  const updateSizeStock = (size, stock) => {
    const numericStock = Math.max(
      0,
      Number(stock) || 0
    );

    setSizes((currentSizes) =>
      currentSizes.map((item) =>
        item.size === size
          ? {
              ...item,
              stock: numericStock,
            }
          : item
      )
    );
  };

  const increaseStock = (size) => {
    const selectedSize = sizes.find(
      (item) => item.size === size
    );

    updateSizeStock(
      size,
      (selectedSize?.stock || 0) + 1
    );
  };

  const decreaseStock = (size) => {
    const selectedSize = sizes.find(
      (item) => item.size === size
    );

    updateSizeStock(
      size,
      Math.max(
        0,
        (selectedSize?.stock || 0) - 1
      )
    );
  };

  // ============================================================
  // IMAGE HANDLING - LOCAL FILES
  // ============================================================

  const handleImageChange = (event) => {
    const selectedFiles = Array.from(
      event.target.files || []
    );

    if (!selectedFiles.length) {
      return;
    }

    setError('');

    const remainingSlots =
      MAX_IMAGES -
      imageUrls.length -
      images.length;

    if (remainingSlots <= 0) {
      setError(
        'A product can have at most 5 images.'
      );

      event.target.value = '';
      return;
    }

    const filesToCheck = selectedFiles.slice(
      0,
      remainingSlots
    );

    if (
      selectedFiles.length >
      remainingSlots
    ) {
      setError(
        `You can add only ${remainingSlots} more image${
          remainingSlots > 1 ? 's' : ''
        }. Maximum is 5 images total.`
      );
    }

    const validFiles = filesToCheck.filter(
      (file) => {
        if (!file.type.startsWith('image/')) {
          return false;
        }

        if (file.size > MAX_FILE_SIZE) {
          return false;
        }

        return true;
      }
    );

    if (
      validFiles.length !==
      filesToCheck.length
    ) {
      setError(
        'Only image files under 5MB are allowed.'
      );
    }

    setImages((currentImages) => {
      const availableSlots =
        MAX_IMAGES -
        imageUrls.length -
        currentImages.length;

      if (availableSlots <= 0) {
        return currentImages;
      }

      return [
        ...currentImages,
        ...validFiles.slice(
          0,
          availableSlots
        ),
      ];
    });

    event.target.value = '';
  };

  const removeImage = (indexToRemove) => {
    setImages((currentImages) =>
      currentImages.filter(
        (_, index) =>
          index !== indexToRemove
      )
    );
  };

  // ============================================================
  // IMAGE URL
  // ============================================================

  const addImageUrl = () => {
    const url = imageUrlInput.trim();

    if (!url) {
      setError(
        'Please enter an image URL.'
      );

      return;
    }

    if (
      images.length +
        imageUrls.length >=
      MAX_IMAGES
    ) {
      setError(
        'A product can have at most 5 images.'
      );

      return;
    }

    try {
      const parsedUrl = new URL(url);

      if (
        !['http:', 'https:'].includes(
          parsedUrl.protocol
        )
      ) {
        setError(
          'Please enter a valid image URL.'
        );

        return;
      }
    } catch {
      setError(
        'Please enter a valid image URL.'
      );

      return;
    }

    if (imageUrls.includes(url)) {
      setError(
        'This image URL has already been added.'
      );

      return;
    }

    setImageUrls((currentUrls) => [
      ...currentUrls,
      url,
    ]);

    setImageUrlInput('');
    setError('');
  };

  const removeImageUrl = (indexToRemove) => {
    setImageUrls((currentUrls) =>
      currentUrls.filter(
        (_, index) =>
          index !== indexToRemove
      )
    );
  };

  // ============================================================
  // IMAGE PREVIEWS
  // ============================================================

  const imagePreviews = useMemo(() => {
    return images.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));
  }, [images]);

  useEffect(() => {
    return () => {
      imagePreviews.forEach((item) => {
        URL.revokeObjectURL(item.url);
      });
    };
  }, [imagePreviews]);

  // ============================================================
  // FORM VALIDATION
  // ============================================================

  const validateForm = () => {
    if (!title.trim()) {
      return 'Product title is required.';
    }

    if (title.trim().length < 2) {
      return 'Product title must be at least 2 characters.';
    }

    if (!description.trim()) {
      return 'Product description is required.';
    }

    if (description.trim().length < 20) {
      return 'Description must be at least 20 characters.';
    }

    if (!category) {
      return 'Please select a category.';
    }

    if (
      amount === '' ||
      Number(amount) <= 0
    ) {
      return 'Please enter a valid product price.';
    }

    if (!sizes.length) {
      return category === 'perfumes'
        ? 'Please select at least one volume.'
        : 'Please select at least one size.';
    }

    if (
      images.length +
        imageUrls.length >
      MAX_IMAGES
    ) {
      return 'A product can have at most 5 images.';
    }

    return '';
  };

  // ============================================================
  // SUBMIT
  // ============================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError('');
    setSuccess('');

    const validationError =
      validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);

      const response =
        await sellerApi.createProduct({
          title: title.trim(),
          description: description.trim(),
          category,
          amount,
          currency,
          sizes,
          images,
          imageUrls,
        });

      console.log(
        'Product created:',
        response
      );

      setSuccess(
        'Product created successfully.'
      );

      // Clear form
      setTitle('');
      setDescription('');
      setCategory('');
      setAmount('');
      setCurrency('INR');
      setSizes([]);
      setImages([]);
      setImageUrls([]);
      setImageUrlInput('');

      // Product is unpublished by backend
      setTimeout(() => {
        navigate('/seller/dashboard');
      }, 1200);
    } catch (error) {
      console.error(
        'Create product failed:',
        error
      );

      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        'Failed to create product. Please try again.';

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // PAGE
  // ============================================================

  return (
    <div className="min-h-screen bg-zinc-50">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="bg-white border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-20 flex items-center justify-between">

            <div className="flex items-center gap-4">

              <button
                type="button"
                onClick={() =>
                  navigate('/seller/dashboard')
                }
                className="p-2 border border-zinc-200 hover:bg-zinc-100 transition"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">
                  Seller Panel
                </p>

                <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight">
                  Add Product
                </h1>
              </div>

            </div>

            <PackagePlus className="w-7 h-7 hidden sm:block" />

          </div>
        </div>
      </div>

      {/* ======================================================
          CONTENT
      ====================================================== */}

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ====================================================
            ALERTS
        ==================================================== */}

        {error && (
          <div className="mb-6 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {success}
          </div>
        )}

        {/* ====================================================
            FORM
        ==================================================== */}

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >

          {/* ==================================================
              BASIC INFORMATION
          ================================================== */}

          <section className="bg-white border border-zinc-200">

            <div className="px-5 sm:px-6 py-5 border-b border-zinc-200">
              <h2 className="text-sm font-black uppercase tracking-wider">
                Product Information
              </h2>

              <p className="text-xs text-zinc-500 mt-1">
                Add the basic details of your product.
              </p>
            </div>

            <div className="p-5 sm:p-6 space-y-5">

              {/* Product Title */}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2">
                  Product Title
                </label>

                <input
                  type="text"
                  value={title}
                  onChange={(event) =>
                    setTitle(event.target.value)
                  }
                  placeholder="Example: Premium Oversized Black Shirt"
                  maxLength={100}
                  className="w-full border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-black transition"
                />

                <p className="text-[11px] text-zinc-400 mt-1">
                  {title.length}/100
                </p>
              </div>

              {/* Description */}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2">
                  Description
                </label>

                <textarea
                  value={description}
                  onChange={(event) =>
                    setDescription(
                      event.target.value
                    )
                  }
                  placeholder="Describe the product, material, fit, style, etc."
                  rows={6}
                  maxLength={500}
                  className="w-full border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-black transition resize-none"
                />

                <p className="text-[11px] text-zinc-400 mt-1">
                  {description.length}/500
                </p>
              </div>

              {/* Category */}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2">
                  Category
                </label>

                <select
                  value={category}
                  onChange={handleCategoryChange}
                  className="w-full border border-zinc-300 px-4 py-3 text-sm bg-white outline-none focus:border-black transition"
                >
                  <option value="">
                    Select category
                  </option>

                  {CATEGORIES.map((item) => (
                    <option
                      key={item.value}
                      value={item.value}
                    >
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>

            </div>
          </section>

          {/* ==================================================
              PRICE
          ================================================== */}

          <section className="bg-white border border-zinc-200">

            <div className="px-5 sm:px-6 py-5 border-b border-zinc-200">
              <h2 className="text-sm font-black uppercase tracking-wider">
                Pricing
              </h2>
            </div>

            <div className="p-5 sm:p-6">

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                {/* Amount */}

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2">
                    Price
                  </label>

                  <div className="flex">

                    <span className="inline-flex items-center px-4 border border-r-0 border-zinc-300 bg-zinc-50 text-sm font-bold">
                      {currency === 'USD'
                        ? '$'
                        : '₹'}
                    </span>

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={amount}
                      onChange={(event) =>
                        setAmount(
                          event.target.value
                        )
                      }
                      placeholder="1999"
                      className="w-full border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-black transition"
                    />

                  </div>
                </div>

                {/* Currency */}

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2">
                    Currency
                  </label>

                  <select
                    value={currency}
                    onChange={(event) =>
                      setCurrency(
                        event.target.value
                      )
                    }
                    className="w-full border border-zinc-300 px-4 py-3 text-sm bg-white outline-none focus:border-black transition"
                  >
                    <option value="INR">
                      INR - Indian Rupee
                    </option>

                    <option value="USD">
                      USD - US Dollar
                    </option>
                  </select>
                </div>

              </div>

            </div>
          </section>

          {/* ==================================================
              SIZES / VOLUME & STOCK
          ================================================== */}

          <section className="bg-white border border-zinc-200">

            <div className="px-5 sm:px-6 py-5 border-b border-zinc-200">

              <h2 className="text-sm font-black uppercase tracking-wider">
                {category === 'perfumes'
                  ? 'Volume & Stock'
                  : 'Sizes & Stock'}
              </h2>

              <p className="text-xs text-zinc-500 mt-1">
                {category === 'perfumes'
                  ? 'Select the available volumes and enter stock quantity.'
                  : 'Select the available sizes and enter stock quantity.'}
              </p>

            </div>

            <div className="p-5 sm:p-6">

              {/* Variant Buttons */}

              <div className="flex flex-wrap gap-2 mb-6">

                {availableVariants.map(
                  (variant) => {
                    const selected =
                      sizes.some(
                        (item) =>
                          item.size === variant
                      );

                    return (
                      <button
                        key={variant}
                        type="button"
                        onClick={() =>
                          toggleSize(variant)
                        }
                        className={`min-w-[60px] px-4 py-3 text-xs font-bold border transition ${
                          selected
                            ? 'bg-black text-white border-black'
                            : 'bg-white text-zinc-700 border-zinc-300 hover:border-black'
                        }`}
                      >
                        {variant}
                      </button>
                    );
                  }
                )}

              </div>

              {/* Selected Variants */}

              {sizes.length > 0 ? (

                <div className="space-y-3">

                  {sizes.map((item) => (

                    <div
                      key={item.size}
                      className="flex flex-col sm:flex-row sm:items-center gap-3 border border-zinc-200 p-4"
                    >

                      <div className="w-16 h-12 flex items-center justify-center bg-zinc-100 text-sm font-black">
                        {item.size}
                      </div>

                      <div className="flex-1">

                        <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                          Stock Quantity
                        </label>

                        <input
                          type="number"
                          min="0"
                          value={item.stock}
                          onChange={(event) =>
                            updateSizeStock(
                              item.size,
                              event.target.value
                            )
                          }
                          className="w-full border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-black"
                        />

                      </div>

                      {/* Quantity Controls */}

                      <div className="flex items-center border border-zinc-300">

                        <button
                          type="button"
                          onClick={() =>
                            decreaseStock(
                              item.size
                            )
                          }
                          className="p-2 hover:bg-zinc-100"
                        >
                          <Minus className="w-4 h-4" />
                        </button>

                        <span className="w-12 text-center text-sm font-bold">
                          {item.stock}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            increaseStock(
                              item.size
                            )
                          }
                          className="p-2 hover:bg-zinc-100"
                        >
                          <Plus className="w-4 h-4" />
                        </button>

                      </div>

                      {/* Remove */}

                      <button
                        type="button"
                        onClick={() =>
                          toggleSize(
                            item.size
                          )
                        }
                        className="p-2 text-red-500 hover:bg-red-50"
                        aria-label={`Remove ${item.size}`}
                      >
                        <X className="w-4 h-4" />
                      </button>

                    </div>

                  ))}

                </div>

              ) : (

                <div className="border border-dashed border-zinc-300 py-10 text-center">

                  <p className="text-sm text-zinc-500">
                    {category === 'perfumes'
                      ? 'No volumes selected.'
                      : 'No sizes selected.'}
                  </p>

                  <p className="text-xs text-zinc-400 mt-1">
                    {category === 'perfumes'
                      ? 'Select at least one volume above.'
                      : 'Select at least one size above.'}
                  </p>

                </div>

              )}

            </div>
          </section>

          {/* ==================================================
              IMAGES
          ================================================== */}

          <section className="bg-white border border-zinc-200">

            {/* Image Header */}

            <div className="px-5 sm:px-6 py-5 border-b border-zinc-200">

              <div className="flex items-center justify-between">

                <div>
                  <h2 className="text-sm font-black uppercase tracking-wider">
                    Product Images
                  </h2>

                  <p className="text-xs text-zinc-500 mt-1">
                    Upload images or add image URLs. Maximum 5 images total.
                  </p>
                </div>

                <span className="text-xs font-bold text-zinc-500">
                  {images.length +
                    imageUrls.length}
                  /5
                </span>

              </div>

            </div>

            <div className="p-5 sm:p-6">

              {/* Image Preview Grid */}

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">

                {/* Local Images */}

                {imagePreviews.map(
                  (item, index) => (

                    <div
                      key={`${item.file.name}-${index}`}
                      className="relative aspect-[3/4] bg-zinc-100 border border-zinc-200 overflow-hidden"
                    >

                      <img
                        src={item.url}
                        alt={`Product preview ${index + 1}`}
                        className="w-full h-full object-cover"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          removeImage(index)
                        }
                        className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center bg-black text-white hover:bg-red-600 transition"
                        aria-label="Remove image"
                      >
                        <X className="w-4 h-4" />
                      </button>

                      {index === 0 && (
                        <span className="absolute bottom-0 left-0 right-0 bg-black/80 text-white text-[9px] font-bold uppercase tracking-wider text-center py-2">
                          Main Image
                        </span>
                      )}

                    </div>

                  )
                )}

                {/* URL Images */}

                {imageUrls.map(
                  (url, index) => (

                    <div
                      key={`${url}-${index}`}
                      className="relative aspect-[3/4] bg-zinc-100 border border-zinc-200 overflow-hidden"
                    >

                      <img
                        src={url}
                        alt={`URL image ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(event) => {
                          event.currentTarget.style.display =
                            'none';
                        }}
                      />

                      <button
                        type="button"
                        onClick={() =>
                          removeImageUrl(index)
                        }
                        className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center bg-black text-white hover:bg-red-600 transition"
                        aria-label="Remove URL image"
                      >
                        <X className="w-4 h-4" />
                      </button>

                      {images.length === 0 &&
                        index === 0 && (
                          <span className="absolute bottom-0 left-0 right-0 bg-black/80 text-white text-[9px] font-bold uppercase tracking-wider text-center py-2">
                            Main Image
                          </span>
                        )}

                    </div>

                  )
                )}

                {/* Upload Button */}

                {images.length +
                  imageUrls.length <
                  MAX_IMAGES && (

                  <label className="aspect-[3/4] border-2 border-dashed border-zinc-300 hover:border-black cursor-pointer flex flex-col items-center justify-center text-zinc-400 hover:text-black transition">

                    <ImagePlus className="w-7 h-7 mb-2" />

                    <span className="text-[10px] font-bold uppercase tracking-wider text-center px-2">
                      Add Image
                    </span>

                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={
                        handleImageChange
                      }
                      className="hidden"
                    />

                  </label>

                )}

              </div>

              {/* Image URL Input */}

              {images.length +
                imageUrls.length <
                MAX_IMAGES && (

                <div className="mt-6 border-t border-zinc-200 pt-6">

                  <div className="mb-3">

                    <p className="text-xs font-bold uppercase tracking-wider">
                      Add Image via URL
                    </p>

                    <p className="text-[11px] text-zinc-500 mt-1">
                      Paste a direct image URL from the web.
                    </p>

                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">

                    <input
                      type="url"
                      value={imageUrlInput}
                      onChange={(event) => {
                        setImageUrlInput(
                          event.target.value
                        );

                        setError('');
                      }}
                      onKeyDown={(event) => {
                        if (
                          event.key ===
                          'Enter'
                        ) {
                          event.preventDefault();
                          addImageUrl();
                        }
                      }}
                      placeholder="https://example.com/product-image.jpg"
                      className="flex-1 border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-black transition"
                    />

                    <button
                      type="button"
                      onClick={addImageUrl}
                      className="px-5 py-3 bg-black text-white text-xs font-bold uppercase tracking-wider hover:bg-zinc-800 transition"
                    >
                      Add URL
                    </button>

                  </div>

                </div>

              )}

              {/* URL Image List */}

              {imageUrls.length > 0 && (

                <div className="mt-6">

                  <p className="text-xs font-bold uppercase tracking-wider mb-3">
                    URL Images
                  </p>

                  <div className="space-y-2">

                    {imageUrls.map(
                      (url, index) => (

                        <div
                          key={`${url}-list-${index}`}
                          className="flex items-center gap-3 border border-zinc-200 px-3 py-2"
                        >

                          <div className="w-12 h-12 bg-zinc-100 overflow-hidden flex-shrink-0">

                            <img
                              src={url}
                              alt={`URL ${index + 1}`}
                              className="w-full h-full object-cover"
                              onError={(event) => {
                                event.currentTarget.style.display =
                                  'none';
                              }}
                            />

                          </div>

                          <p className="flex-1 text-xs text-zinc-600 truncate">
                            {url}
                          </p>

                          <button
                            type="button"
                            onClick={() =>
                              removeImageUrl(
                                index
                              )
                            }
                            className="p-2 text-red-500 hover:bg-red-50 flex-shrink-0"
                            aria-label="Remove URL"
                          >
                            <X className="w-4 h-4" />
                          </button>

                        </div>

                      )
                    )}

                  </div>

                </div>

              )}

            </div>
          </section>

          {/* ==================================================
              SUBMIT
          ================================================== */}

          <section className="bg-white border border-zinc-200 p-5 sm:p-6">

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

              <div>
                <p className="text-xs font-bold uppercase tracking-wider">
                  Ready to create?
                </p>

                <p className="text-xs text-zinc-500 mt-1">
                  Product will be created as unpublished.
                </p>
              </div>

              <div className="flex gap-3">

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      '/seller/dashboard'
                    )
                  }
                  disabled={loading}
                  className="px-5 py-3 border border-zinc-300 text-xs font-bold uppercase tracking-wider hover:border-black transition disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-black text-white text-xs font-bold uppercase tracking-wider hover:bg-zinc-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading
                    ? 'Creating Product...'
                    : 'Create Product'}
                </button>

              </div>

            </div>

          </section>

        </form>
      </main>
    </div>
  );
};

export default SellerAddProductPage;