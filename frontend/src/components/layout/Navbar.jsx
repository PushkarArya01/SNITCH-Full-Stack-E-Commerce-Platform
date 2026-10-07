import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import {
  Search,
  Heart,
  ShoppingBag,
  User,
  Menu,
  X,
  LogOut,
} from 'lucide-react';

import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';

import { NAV_LINKS } from '../../utils/constants';

const Navbar = ({ onOpenSearch }) => {
  const { openCart, totalItemCount } = useCart();

  const { wishlistCount } = useWishlist();

  const {
    user,
    isAuthenticated,
    logout,
  } = useAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const navigate = useNavigate();

  /*
   * Seller check
   *
   * Normal user:
   * user.role === "user"
   *
   * Seller:
   * user.role === "seller"
   */
  const isSeller =
    isAuthenticated && user?.role === 'seller';

  const handleLogout = async () => {
    setUserDropdownOpen(false);

    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
      navigate('/');
    }
  };

  const handleMobileNavigation = () => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  };

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white border-b border-zinc-200">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center justify-between">

            {/* ================================
                MOBILE MENU BUTTON
            ================================= */}
            <button
              type="button"
              onClick={() =>
                setMobileMenuOpen(!mobileMenuOpen)
              }
              className="lg:hidden p-1.5 text-zinc-700 hover:text-black transition cursor-pointer"
              aria-label="Open menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>

            {/* ================================
                LOGO
            ================================= */}
            <Link
              to="/"
              className="text-2xl sm:text-3xl font-black tracking-tighter"
            >
              SNITCH
            </Link>

            {/* ================================
                DESKTOP NAVIGATION
            ================================= */}
            <div className="hidden lg:flex items-center gap-8 ml-10">
              {NAV_LINKS.map((link) => (
                <Link
                  key={
                    link.id ||
                    link.path ||
                    link.label
                  }
                  to={
                    link.path ||
                    link.href ||
                    '#'
                  }
                  className="text-xs font-bold uppercase tracking-wider text-zinc-700 hover:text-black transition"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* ================================
                RIGHT ACTIONS
            ================================= */}
            <div className="flex items-center gap-2 sm:gap-4 ml-auto">

              {/* ================================
                  SEARCH
              ================================= */}
              <button
                type="button"
                onClick={onOpenSearch}
                className="p-1.5 text-zinc-700 hover:text-black transition cursor-pointer"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* ================================
                  WISHLIST
              ================================= */}
              <Link
                to="/wishlist"
                className="relative p-1.5 text-zinc-700 hover:text-black transition"
                aria-label="Wishlist"
              >
                <Heart className="w-5 h-5" />

                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 flex items-center justify-center bg-black text-white text-[9px] font-bold rounded-full">
                    {wishlistCount > 99
                      ? '99+'
                      : wishlistCount}
                  </span>
                )}
              </Link>

              {/* ================================
                  CART
              ================================= */}
              <button
                type="button"
                onClick={openCart}
                className="relative p-1.5 text-zinc-700 hover:text-black transition cursor-pointer"
                aria-label="Shopping bag"
              >
                <ShoppingBag className="w-5 h-5" />

                {totalItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 flex items-center justify-center bg-black text-white text-[9px] font-bold rounded-full">
                    {totalItemCount > 99
                      ? '99+'
                      : totalItemCount}
                  </span>
                )}
              </button>

              {/* ================================
                  USER
              ================================= */}
              {isAuthenticated ? (
                <div className="relative">

                  {/* Account Button */}
                  <button
                    type="button"
                    onClick={() =>
                      setUserDropdownOpen(
                        !userDropdownOpen
                      )
                    }
                    className="flex items-center gap-2 p-1.5 text-zinc-700 hover:text-black transition cursor-pointer"
                    aria-label="Account"
                  >
                    <User className="w-5 h-5" />

                    <span className="hidden md:block text-xs font-bold uppercase tracking-wider max-w-[100px] truncate">
                      {user?.name || 'Account'}
                    </span>
                  </button>

                  {/* ================================
                      ACCOUNT DROPDOWN
                  ================================= */}
                  {userDropdownOpen && (
                    <>
                      {/* Overlay */}
                      <button
                        type="button"
                        aria-label="Close account menu"
                        onClick={() =>
                          setUserDropdownOpen(false)
                        }
                        className="fixed inset-0 z-40 cursor-default"
                      />

                      {/* Dropdown */}
                      <div className="absolute right-0 top-full mt-2 w-60 bg-white border border-zinc-200 shadow-xl z-50">

                        {/* User Information */}
                        <div className="px-4 py-3 border-b border-zinc-200">
                          <p className="text-xs font-bold uppercase tracking-wider text-zinc-900">
                            {user?.name || 'User'}
                          </p>

                          <p className="text-[11px] text-zinc-500 mt-1 truncate">
                            {user?.email || ''}
                          </p>

                          {/* Seller Badge */}
                          {isSeller && (
                            <span className="inline-block mt-2 px-2 py-1 text-[9px] font-bold uppercase tracking-wider bg-black text-white">
                              Seller
                            </span>
                          )}
                        </div>

                        <div className="py-1">

                          {/* ================================
                              CUSTOMER OPTIONS
                          ================================= */}

                          <Link
                            to="/account"
                            onClick={() =>
                              setUserDropdownOpen(false)
                            }
                            className="block px-4 py-3 text-xs font-bold uppercase tracking-wider text-zinc-700 hover:bg-zinc-50 hover:text-black transition"
                          >
                            My Account
                          </Link>

                          <Link
                            to="/wishlist"
                            onClick={() =>
                              setUserDropdownOpen(false)
                            }
                            className="block px-4 py-3 text-xs font-bold uppercase tracking-wider text-zinc-700 hover:bg-zinc-50 hover:text-black transition"
                          >
                            Wishlist
                          </Link>

                          {/* ================================
                              SELLER OPTIONS
                              ONLY SELLER CAN SEE
                          ================================= */}
                          {isSeller && (
                            <>
                              <div className="my-1 border-t border-zinc-200" />

                              <div className="px-4 py-2">
                                <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">
                                  Seller Panel
                                </p>
                              </div>

                              {/* Seller Dashboard */}
                              <Link
                                to="/seller/dashboard"
                                onClick={() =>
                                  setUserDropdownOpen(false)
                                }
                                className="block px-4 py-3 text-xs font-bold uppercase tracking-wider text-zinc-700 hover:bg-zinc-50 hover:text-black transition"
                              >
                                Seller Dashboard
                              </Link>

                              {/* Add Product */}
                              <Link
                                to="/seller/products/new"
                                onClick={() =>
                                  setUserDropdownOpen(false)
                                }
                                className="block px-4 py-3 text-xs font-bold uppercase tracking-wider text-zinc-700 hover:bg-zinc-50 hover:text-black transition"
                              >
                                Add Product
                              </Link>

                              {/* Orders */}
                              <Link
                                to="/seller/orders"
                                onClick={() =>
                                  setUserDropdownOpen(false)
                                }
                                className="block px-4 py-3 text-xs font-bold uppercase tracking-wider text-zinc-700 hover:bg-zinc-50 hover:text-black transition"
                              >
                                Orders
                              </Link>
                            </>
                          )}

                          {/* ================================
                              LOGOUT
                          ================================= */}
                          <div className="my-1 border-t border-zinc-200" />

                          <button
                            type="button"
                            onClick={handleLogout}
                            className="w-full flex items-center gap-2 px-4 py-3 text-xs font-bold uppercase tracking-wider text-red-600 hover:bg-red-50 transition cursor-pointer"
                          >
                            <LogOut className="w-4 h-4" />
                            Logout
                          </button>

                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                /* ================================
                   NOT AUTHENTICATED
                ================================= */
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="p-1.5 text-zinc-700 hover:text-black transition cursor-pointer"
                  aria-label="Sign In"
                >
                  <User className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ================================
            MOBILE NAVIGATION
        ================================= */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-zinc-200 bg-white">
            <div className="px-4 py-4 space-y-1">

              {/* Main Navigation */}
              {NAV_LINKS.map((link) => (
                <Link
                  key={
                    link.id ||
                    link.path ||
                    link.label
                  }
                  to={
                    link.path ||
                    link.href ||
                    '#'
                  }
                  onClick={handleMobileNavigation}
                  className="block px-2 py-3 text-xs font-bold uppercase tracking-wider text-zinc-700 hover:text-black hover:bg-zinc-50 transition"
                >
                  {link.label}
                </Link>
              ))}

              {/* Account Section */}
              <div className="pt-3 mt-3 border-t border-zinc-200">

                {isAuthenticated ? (
                  <>
                    {/* My Account */}
                    <Link
                      to="/account"
                      onClick={handleMobileNavigation}
                      className="block px-2 py-3 text-xs font-bold uppercase tracking-wider text-zinc-700 hover:text-black"
                    >
                      My Account
                    </Link>

                    {/* Wishlist */}
                    <Link
                      to="/wishlist"
                      onClick={handleMobileNavigation}
                      className="block px-2 py-3 text-xs font-bold uppercase tracking-wider text-zinc-700 hover:text-black"
                    >
                      Wishlist
                    </Link>

                    {/* ================================
                        MOBILE SELLER OPTIONS
                    ================================= */}
                    {isSeller && (
                      <>
                        <div className="my-2 border-t border-zinc-200" />

                        <div className="px-2 py-2">
                          <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">
                            Seller Panel
                          </p>
                        </div>

                        {/* Seller Dashboard */}
                        <Link
                          to="/seller/dashboard"
                          onClick={handleMobileNavigation}
                          className="block px-2 py-3 text-xs font-bold uppercase tracking-wider text-zinc-700 hover:text-black hover:bg-zinc-50"
                        >
                          Seller Dashboard
                        </Link>

                        {/* Add Product */}
                        <Link
                          to="/seller/products/new"
                          onClick={handleMobileNavigation}
                          className="block px-2 py-3 text-xs font-bold uppercase tracking-wider text-zinc-700 hover:text-black hover:bg-zinc-50"
                        >
                          Add Product
                        </Link>

                        {/* Orders */}
                        <Link
                          to="/seller/orders"
                          onClick={handleMobileNavigation}
                          className="block px-2 py-3 text-xs font-bold uppercase tracking-wider text-zinc-700 hover:text-black hover:bg-zinc-50"
                        >
                          Orders
                        </Link>
                      </>
                    )}

                    {/* Logout */}
                    <button
                      type="button"
                      onClick={() => {
                        handleMobileNavigation();
                        handleLogout();
                      }}
                      className="w-full flex items-center gap-2 px-2 py-3 text-xs font-bold uppercase tracking-wider text-red-600 hover:bg-red-50 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </>
                ) : (
                  /* ================================
                     MOBILE SIGN IN
                  ================================= */
                  <button
                    type="button"
                    onClick={() => {
                      handleMobileNavigation();
                      navigate('/login');
                    }}
                    className="w-full text-left px-2 py-3 text-xs font-bold uppercase tracking-wider text-zinc-700 hover:text-black hover:bg-zinc-50 cursor-pointer"
                  >
                    Sign In
                  </button>
                )}

              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;