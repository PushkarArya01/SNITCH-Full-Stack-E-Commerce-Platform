import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import sellerApi from '../api/sellerApi';

const CATEGORIES = [
  'shirts',
  't-shirts',
  'bottoms',
  'oversized',
  'luxe',
  'co-ords',
  'perfumes',
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

const SellerEditProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { user, isAuthenticated } = useAuth();

  const isSeller =
    isAuthenticated && user?.role === 'seller';

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('INR');

  const [sizes, setSizes] = useState(
    CLOTHING_SIZES.map((size) => ({
      size,
      stock: 0,
    }))
  );

  const [imageUrls, setImageUrls] = useState([]);
  const [images, setImages] = useState([]);

  const [newImageUrl, setNewImageUrl] = useState('');

  const availableVariants =
    category === 'perfumes'
      ? PERFUME_VOLUMES
      : CLOTHING_SIZES;

  /*
   * --------------------------------
   * LOAD PRODUCT
   * --------------------------------
   */

  useEffect(() => {
    const loadProduct = async () => {
      if (!isSeller) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');

        const products = await sellerApi.getProducts();

        const product = products.find(
          (item) =>
            String(item._id || item.id) === String(id)
        );

        if (!product) {
          setError('Product not found.');
          return;
        }

        setTitle(product.title || '');
        setDescription(product.description || '');
        setCategory(product.category || '');
        setAmount(product.price?.amount ?? '');
        setCurrency(
          product.price?.currency || 'INR'
        );

        const productSizes = Array.isArray(
          product.sizes
        )
          ? product.sizes
          : [];

        const productVariants =
          product.category === 'perfumes'
            ? PERFUME_VOLUMES
            : CLOTHING_SIZES;

        setSizes(
          productVariants.map((variant) => {
            const existingVariant =
              productSizes.find(
                (item) =>
                  item.size === variant
              );

            return {
              size: variant,
              stock:
                existingVariant?.stock ?? 0,
            };
          })
        );

        setImageUrls(
          Array.isArray(product.images)
            ? product.images
            : []
        );
      } catch (err) {
        console.error(
          'Failed to load product:',
          err
        );

        setError(
          err?.response?.data?.message ||
            'Failed to load product.'
        );
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id, isSeller]);

  /*
   * --------------------------------
   * TOTAL IMAGE COUNT
   * --------------------------------
   */

  const totalImageCount = useMemo(() => {
    return imageUrls.length + images.length;
  }, [imageUrls.length, images.length]);

  /*
   * --------------------------------
   * CATEGORY CHANGE
   * --------------------------------
   */

  const handleCategoryChange = (event) => {
    const nextCategory = event.target.value;

    setCategory(nextCategory);

    const nextVariants =
      nextCategory === 'perfumes'
        ? PERFUME_VOLUMES
        : CLOTHING_SIZES;

    setSizes((previous) =>
      nextVariants.map((variant) => {
        const existingVariant =
          previous.find(
            (item) =>
              item.size === variant
          );

        return {
          size: variant,
          stock:
            existingVariant?.stock ?? 0,
        };
      })
    );
  };

  /*
   * --------------------------------
   * STOCK
   * --------------------------------
   */

  const updateStock = (size, value) => {
    const stock = Math.max(
      0,
      Number(value) || 0
    );

    setSizes((previous) =>
      previous.map((item) =>
        item.size === size
          ? {
              ...item,
              stock,
            }
          : item
      )
    );
  };

  /*
   * --------------------------------
   * LOCAL IMAGE ADD
   * --------------------------------
   */

  const handleImageChange = (event) => {
    const selectedFiles = Array.from(
      event.target.files || []
    );

    if (!selectedFiles.length) {
      return;
    }

    const remainingSlots =
      MAX_IMAGES - totalImageCount;

    if (remainingSlots <= 0) {
      setError(
        `You can add maximum ${MAX_IMAGES} images.`
      );

      event.target.value = '';
      return;
    }

    const validFiles = selectedFiles
      .filter((file) =>
        file.type.startsWith('image/')
      )
      .filter(
        (file) =>
          file.size <=
          5 * 1024 * 1024
      )
      .slice(0, remainingSlots);

    if (
      validFiles.length <
      selectedFiles.length
    ) {
      setError(
        'Some images were skipped. Only image files under 5MB are allowed and maximum 5 total images are supported.'
      );
    } else {
      setError('');
    }

    setImages((previous) => [
      ...previous,
      ...validFiles,
    ]);

    event.target.value = '';
  };

  /*
   * --------------------------------
   * REMOVE LOCAL IMAGE
   * --------------------------------
   */

  const removeLocalImage = (index) => {
    setImages((previous) =>
      previous.filter(
        (_, itemIndex) =>
          itemIndex !== index
      )
    );
  };

  /*
   * --------------------------------
   * REMOVE EXISTING IMAGE
   * --------------------------------
   */

  const removeImageUrl = (index) => {
    setImageUrls((previous) =>
      previous.filter(
        (_, itemIndex) =>
          itemIndex !== index
      )
    );
  };

  /*
   * --------------------------------
   * ADD IMAGE URL
   * --------------------------------
   */

  const addImageUrl = () => {
    const url = newImageUrl.trim();

    if (!url) {
      setError(
        'Please enter an image URL.'
      );
      return;
    }

    if (
      !/^https?:\/\/.+/i.test(url)
    ) {
      setError(
        'Please enter a valid http/https image URL.'
      );
      return;
    }

    if (imageUrls.includes(url)) {
      setError(
        'This image URL is already added.'
      );
      return;
    }

    if (
      totalImageCount >= MAX_IMAGES
    ) {
      setError(
        `You can add maximum ${MAX_IMAGES} images.`
      );
      return;
    }

    setImageUrls((previous) => [
      ...previous,
      url,
    ]);

    setNewImageUrl('');
    setError('');
  };

  /*
   * --------------------------------
   * FORM SUBMIT
   * --------------------------------
   */

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError('');
    setSuccess('');

    if (!title.trim()) {
      setError(
        'Product title is required.'
      );
      return;
    }

    if (
      description.trim().length < 20
    ) {
      setError(
        'Description must contain at least 20 characters.'
      );
      return;
    }

    if (!category) {
      setError(
        'Please select a category.'
      );
      return;
    }

    if (
      amount === '' ||
      Number(amount) <= 0
    ) {
      setError(
        'Please enter a valid price.'
      );
      return;
    }

    if (
      totalImageCount > MAX_IMAGES
    ) {
      setError(
        `Maximum ${MAX_IMAGES} images are allowed.`
      );
      return;
    }

    const formattedSizes =
      sizes.map((item) => ({
        size: item.size,
        stock: Math.max(
          0,
          Number(item.stock) || 0
        ),
      }));

    try {
      setSaving(true);

      await sellerApi.updateProduct({
        productId: id,
        title: title.trim(),
        description: description.trim(),
        category,
        amount,
        currency,
        sizes: formattedSizes,
        images,
        imageUrls,
      });

      setSuccess(
        'Product updated successfully.'
      );

      setTimeout(() => {
        navigate('/seller/dashboard');
      }, 800);
    } catch (err) {
      console.error(
        'Update product error:',
        err
      );

      setError(
        err?.response?.data?.message ||
          'Failed to update product.'
      );
    } finally {
      setSaving(false);
    }
  };

  /*
   * --------------------------------
   * AUTH CHECK
   * --------------------------------
   */

  if (!isAuthenticated) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold">
            Please login first
          </h1>

          <button
            onClick={() =>
              navigate('/login')
            }
            className="mt-5 rounded-full bg-black px-6 py-3 text-sm font-medium text-white"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  if (!isSeller) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold">
            Access Denied
          </h1>

          <p className="mt-2 text-zinc-500">
            Seller access is required.
          </p>

          <button
            onClick={() =>
              navigate('/')
            }
            className="mt-5 rounded-full bg-black px-6 py-3 text-sm font-medium text-white"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-zinc-500">
          Loading product...
        </p>
      </div>
    );
  }

  if (error && !title) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold">
            Product Not Found
          </h1>

          <p className="mt-2 text-red-500">
            {error}
          </p>

          <button
            onClick={() =>
              navigate('/seller/dashboard')
            }
            className="mt-5 rounded-full bg-black px-6 py-3 text-sm font-medium text-white"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">

        {/* Header */}

        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
              Seller Panel
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight">
              Edit Product
            </h1>

            <p className="mt-2 text-sm text-zinc-500">
              Update your product information,
              stock and images.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              navigate('/seller/dashboard')
            }
            className="rounded-full border border-zinc-300 bg-white px-5 py-2.5 text-sm font-medium hover:bg-zinc-100"
          >
            Back to Dashboard
          </button>
        </div>

        {/* Messages */}

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {success}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >

          {/* Product Information */}

          <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold">
              Product Information
            </h2>

            <div className="mt-6 space-y-5">

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Product Title
                </label>

                <input
                  type="text"
                  value={title}
                  onChange={(event) =>
                    setTitle(
                      event.target.value
                    )
                  }
                  className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-black"
                  placeholder="Enter product title"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Description
                </label>

                <textarea
                  value={description}
                  onChange={(event) =>
                    setDescription(
                      event.target.value
                    )
                  }
                  rows={5}
                  className="w-full resize-none rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-black"
                  placeholder="Enter product description"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Category
                </label>

                <select
                  value={category}
                  onChange={
                    handleCategoryChange
                  }
                  className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 outline-none focus:border-black"
                >
                  <option value="">
                    Select Category
                  </option>

                  {CATEGORIES.map(
                    (item) => (
                      <option
                        key={item}
                        value={item}
                      >
                        {item}
                      </option>
                    )
                  )}
                </select>
              </div>

            </div>
          </section>

          {/* Pricing */}

          <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold">
              Pricing
            </h2>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Price
                </label>

                <input
                  type="number"
                  min="0"
                  value={amount}
                  onChange={(event) =>
                    setAmount(
                      event.target.value
                    )
                  }
                  className="w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-black"
                  placeholder="Enter price"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Currency
                </label>

                <select
                  value={currency}
                  onChange={(event) =>
                    setCurrency(
                      event.target.value
                    )
                  }
                  className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 outline-none focus:border-black"
                >
                  <option value="INR">
                    INR
                  </option>

                  <option value="USD">
                    USD
                  </option>
                </select>
              </div>

            </div>
          </section>

          {/* Sizes / Volume & Stock */}

          <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">

            <h2 className="text-xl font-semibold">
              {category === 'perfumes'
                ? 'Volume & Stock'
                : 'Sizes & Stock'}
            </h2>

            <p className="mt-1 text-sm text-zinc-500">
              {category === 'perfumes'
                ? 'Manage stock for each perfume volume.'
                : 'Manage stock for each clothing size.'}
            </p>

            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">

              {availableVariants.map(
                (variant) => {
                  const item =
                    sizes.find(
                      (sizeItem) =>
                        sizeItem.size ===
                        variant
                    ) || {
                      size: variant,
                      stock: 0,
                    };

                  return (
                    <div
                      key={variant}
                      className="rounded-xl border border-zinc-200 p-4"
                    >
                      <p className="text-sm font-semibold">
                        {variant}
                      </p>

                      <label className="mt-3 block text-xs text-zinc-500">
                        Stock
                      </label>

                      <input
                        type="number"
                        min="0"
                        value={item.stock}
                        onChange={(event) =>
                          updateStock(
                            variant,
                            event.target.value
                          )
                        }
                        className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-black"
                      />
                    </div>
                  );
                }
              )}

            </div>
          </section>

          {/* Images */}

          <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

              <div>
                <h2 className="text-xl font-semibold">
                  Product Images
                </h2>

                <p className="mt-1 text-sm text-zinc-500">
                  Maximum {MAX_IMAGES} images.
                </p>
              </div>

              <span className="text-sm font-medium text-zinc-600">
                {totalImageCount}/
                {MAX_IMAGES}
              </span>

            </div>

            {/* Existing Images */}

            {imageUrls.length > 0 && (
              <div className="mt-6">

                <p className="mb-3 text-sm font-medium">
                  Current Images
                </p>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">

                  {imageUrls.map(
                    (url, index) => (
                      <div
                        key={`${url}-${index}`}
                        className="group relative aspect-square overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100"
                      >
                        <img
                          src={url}
                          alt={`Product ${
                            index + 1
                          }`}
                          className="h-full w-full object-cover"
                          onError={(event) => {
                            event.currentTarget.style.display =
                              'none';
                          }}
                        />

                        <button
                          type="button"
                          onClick={() =>
                            removeImageUrl(
                              index
                            )
                          }
                          className="absolute right-2 top-2 rounded-full bg-black px-2.5 py-1 text-xs font-medium text-white"
                        >
                          Remove
                        </button>
                      </div>
                    )
                  )}

                </div>
              </div>
            )}

            {/* New Local Images */}

            {images.length > 0 && (
              <div className="mt-6">

                <p className="mb-3 text-sm font-medium">
                  New Images
                </p>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">

                  {images.map(
                    (file, index) => (
                      <div
                        key={`${file.name}-${index}`}
                        className="group relative aspect-square overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100"
                      >
                        <img
                          src={URL.createObjectURL(
                            file
                          )}
                          alt={file.name}
                          className="h-full w-full object-cover"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            removeLocalImage(
                              index
                            )
                          }
                          className="absolute right-2 top-2 rounded-full bg-black px-2.5 py-1 text-xs font-medium text-white"
                        >
                          Remove
                        </button>
                      </div>
                    )
                  )}

                </div>
              </div>
            )}

            {/* Upload */}

            <div className="mt-6">

              <label className="mb-2 block text-sm font-medium">
                Upload New Images
              </label>

              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                disabled={
                  totalImageCount >=
                  MAX_IMAGES
                }
                className="block w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm"
              />

              <p className="mt-2 text-xs text-zinc-500">
                Maximum 5MB per image.
              </p>

            </div>

            {/* URL */}

            <div className="mt-6">

              <label className="mb-2 block text-sm font-medium">
                Add Image URL
              </label>

              <div className="flex flex-col gap-3 sm:flex-row">

                <input
                  type="url"
                  value={newImageUrl}
                  onChange={(event) =>
                    setNewImageUrl(
                      event.target.value
                    )
                  }
                  className="flex-1 rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-black"
                  placeholder="https://example.com/image.jpg"
                />

                <button
                  type="button"
                  onClick={addImageUrl}
                  disabled={
                    totalImageCount >=
                    MAX_IMAGES
                  }
                  className="rounded-xl bg-black px-6 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Add URL
                </button>

              </div>
            </div>

          </section>

          {/* Submit */}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

            <button
              type="button"
              onClick={() =>
                navigate('/seller/dashboard')
              }
              className="rounded-xl border border-zinc-300 bg-white px-6 py-3 text-sm font-medium hover:bg-zinc-100"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-black px-7 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? 'Saving Changes...'
                : 'Save Changes'}
            </button>

          </div>

        </form>
      </div>
    </div>
  );
};

export default SellerEditProductPage;