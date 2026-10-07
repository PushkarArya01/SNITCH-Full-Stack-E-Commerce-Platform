import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Sparkles,
  Flame,
} from 'lucide-react';

import ProductCard from '../components/product/ProductCard';
import { CATEGORIES } from '../utils/constants';
import { productApi } from '../api/productApi';


const HomePage = () => {

  const [trendingProducts, setTrendingProducts] = useState([]);
  const [loading, setLoading] = useState(true);


  // ============================================================
  // FETCH TRENDING PRODUCTS
  // ============================================================

  useEffect(() => {

    const fetchTrendingProducts = async () => {

      try {

        setLoading(true);

        const data = await productApi.getTrendingProducts();

        setTrendingProducts(data);

      } catch (err) {

        console.error(
          'Failed to load trending products:',
          err
        );

        setTrendingProducts([]);

      } finally {

        setLoading(false);

      }

    };


    fetchTrendingProducts();

  }, []);


  return (
    <div className="flex flex-col min-h-screen">

      {/* ======================================================
          HERO SECTION
      ====================================================== */}

      <section className="relative h-[75vh] md:h-[88vh] bg-zinc-950 overflow-hidden flex items-center justify-center">

        <img
          src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop"
          alt="Snitch New Season Campaign"
          className="absolute inset-0 w-full h-full object-cover object-center opacity-65 scale-105 transition-transform duration-1000 ease-out hover:scale-100"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/30" />


        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto space-y-4">

          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-white/20 backdrop-blur-md text-white text-[11px] font-bold tracking-widest uppercase">

            <Sparkles className="w-3.5 h-3.5 text-amber-300" />

            <span>
              Autumn / Winter '26 Drop
            </span>

          </div>


          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-white uppercase tracking-tight leading-none">
            DEFY ORDINARY
          </h1>


          <p className="text-sm sm:text-base text-zinc-200 max-w-xl mx-auto font-light tracking-wide">
            High-fashion silhouettes, heavyweight textiles, and unmatched streetwear tailoring.
          </p>


          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">

            <Link
              to="/shop"
              className="w-full sm:w-auto px-8 py-3.5 bg-white hover:bg-zinc-200 text-black text-xs font-bold uppercase tracking-widest transition cursor-pointer"
            >
              Shop New Arrivals
            </Link>


            <Link
              to="/shop?category=oversized"
              className="w-full sm:w-auto px-8 py-3.5 bg-black/60 hover:bg-black text-white border border-white/50 text-xs font-bold uppercase tracking-widest backdrop-blur-sm transition cursor-pointer"
            >
              Explore Oversized
            </Link>

          </div>

        </div>

      </section>


      {/* ======================================================
          CATEGORY SECTION
      ====================================================== */}

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 w-full">

        <div className="flex items-center justify-between mb-8">

          <div>

            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-zinc-900">
              EXPLORE BY CATEGORY
            </h2>

            <p className="text-xs text-zinc-500 mt-1 uppercase tracking-wider">
              Handpicked edits designed for modern silhouettes
            </p>

          </div>


          <Link
            to="/shop"
            className="text-xs font-bold uppercase tracking-wider text-black flex items-center hover:underline cursor-pointer"
          >
            View All

            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>

        </div>


        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">

          {CATEGORIES.map((cat) => (

            <Link
              key={cat.id}
              to={`/shop?category=${cat.id}`}
              className="group flex flex-col items-center text-center select-none"
            >

              <div className="relative w-full aspect-square overflow-hidden bg-zinc-100 rounded-none border border-zinc-200">

                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />

                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />

              </div>


              <h3 className="mt-2.5 text-xs font-bold uppercase tracking-wider text-zinc-900 group-hover:underline">
                {cat.name}
              </h3>


              <p className="text-[10px] text-zinc-400 truncate max-w-full">
                {cat.tagline}
              </p>

            </Link>

          ))}

        </div>

      </section>


      {/* ======================================================
          TRENDING PRODUCTS
      ====================================================== */}

      <section className="bg-zinc-50 py-16 border-y border-zinc-200">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">

            <div>

              <div className="inline-flex items-center space-x-1.5 text-red-600 text-xs font-black uppercase tracking-widest mb-1">

                <Flame className="w-4 h-4 fill-red-600" />

                <span>
                  HOT & TRENDING RIGHT NOW
                </span>

              </div>


              <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-zinc-900">
                THE VIRAL DROPS
              </h2>

            </div>


            <Link
              to="/shop"
              className="text-xs font-bold uppercase tracking-widest text-black border-b-2 border-black pb-0.5 self-start sm:self-auto hover:text-zinc-600 transition"
            >
              Shop Full Collection
            </Link>

          </div>


          {/* ==================================================
              LOADING
          ================================================== */}

          {loading ? (

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">

              {[1, 2, 3, 4].map((i) => (

                <div
                  key={i}
                  className="animate-pulse space-y-3"
                >

                  <div className="aspect-[3/4] bg-zinc-200" />

                  <div className="h-4 bg-zinc-200 w-3/4" />

                  <div className="h-3 bg-zinc-200 w-1/2" />

                </div>

              ))}

            </div>

          ) : trendingProducts.length > 0 ? (

            /* ==================================================
               TRENDING PRODUCTS
            ================================================== */

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">

              {trendingProducts.map((product) => (

                <ProductCard
                  key={product.id || product._id}
                  product={product}
                />

              ))}

            </div>

          ) : (

            /* ==================================================
               EMPTY STATE
            ================================================== */

            <div className="text-center py-12">

              <p className="text-sm text-zinc-500">
                No trending products available right now.
              </p>

              <Link
                to="/shop"
                className="inline-flex items-center mt-4 px-6 py-3 bg-black text-white text-xs font-bold uppercase tracking-wider hover:bg-zinc-800 transition"
              >
                Browse Products

                <ArrowRight className="w-3.5 h-3.5 ml-2" />
              </Link>

            </div>

          )}

        </div>

      </section>


      {/* ======================================================
          EDITORIAL CAMPAIGN BANNER
      ====================================================== */}

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">

        <div className="relative bg-zinc-900 overflow-hidden text-white">

          <div className="grid grid-cols-1 lg:grid-cols-2">

            <div className="p-8 sm:p-14 lg:p-20 flex flex-col justify-center space-y-6">

              <span className="text-xs font-bold uppercase tracking-[0.25em] text-zinc-400">
                SNITCH LUXE SERIES
              </span>


              <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight leading-tight">
                FRENCH LINEN & TEXTURED WEAVES
              </h2>


              <p className="text-xs sm:text-sm text-zinc-300 font-light leading-relaxed">
                Elevated textures crafted for effortless European vacations and tropical getaways. Unrivaled breathability, sophisticated drape, and tailored relaxed aesthetics.
              </p>


              <div>

                <Link
                  to="/shop?category=co-ords"
                  className="inline-block px-8 py-3.5 bg-white text-black font-bold text-xs uppercase tracking-widest hover:bg-zinc-200 transition cursor-pointer"
                >
                  Discover The Luxe Edit
                </Link>

              </div>

            </div>


            <div className="relative h-72 sm:h-96 lg:h-auto min-h-[360px]">

              <img
                src="https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1200&auto=format&fit=crop"
                alt="Snitch Luxe Campaign"
                className="w-full h-full object-cover"
              />

            </div>

          </div>

        </div>

      </section>

    </div>
  );
};


export default HomePage;