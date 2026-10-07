import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, RefreshCw, Truck, Check } from 'lucide-react';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="bg-black text-white pt-16 pb-12 border-t border-zinc-800">
      {/* Brand Value Props Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 border-b border-zinc-800">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          <div className="flex items-center space-x-4 justify-center md:justify-start">
            <div className="p-3 bg-zinc-900 border border-zinc-700 rounded-full">
              <Truck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider">Fast & Free Shipping</h4>
              <p className="text-xs text-zinc-400 mt-0.5">Complimentary delivery on prepaid orders above ₹999</p>
            </div>
          </div>

          <div className="flex items-center space-x-4 justify-center md:justify-start">
            <div className="p-3 bg-zinc-900 border border-zinc-700 rounded-full">
              <RefreshCw className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider">7 Days Hassle-Free Returns</h4>
              <p className="text-xs text-zinc-400 mt-0.5">Seamless pickup and immediate store credit or exchange</p>
            </div>
          </div>

          <div className="flex items-center space-x-4 justify-center md:justify-start">
            <div className="p-3 bg-zinc-900 border border-zinc-700 rounded-full">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider">100% Authentic Menswear</h4>
              <p className="text-xs text-zinc-400 mt-0.5">Original designs produced with premium textiles</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand & Newsletter */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-2xl font-black tracking-[0.25em] uppercase">SNITCH</h3>
            <p className="text-xs text-zinc-400 max-w-sm leading-relaxed">
              Encapsulating inspirations from around the globe, SNITCH crafts contemporary menswear with a distinctive aesthetic. Designed in India for the world.
            </p>

            <div className="pt-2">
              <p className="text-xs font-bold uppercase tracking-wider mb-2">Get 10% Off Your First Purchase</p>
              {subscribed ? (
                <div className="p-2.5 bg-zinc-900 border border-emerald-500/50 text-emerald-400 text-xs flex items-center">
                  <Check className="w-4 h-4 mr-2" /> Thanks for subscribing! Use code <strong>SNITCH10</strong>.
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex max-w-md">
                  <input
                    type="email"
                    required
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 bg-zinc-900 border border-zinc-700 px-3 py-2 text-xs text-white placeholder:text-zinc-500 outline-none focus:border-white transition"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-white text-black text-xs font-bold uppercase tracking-wider hover:bg-zinc-200 transition cursor-pointer flex items-center"
                  >
                    Subscribe <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </button>
                </form>
              )}
            </div>

            {/* Social Icons */}
            <div className="flex space-x-4 pt-2 text-zinc-400">
              <a href="#" className="hover:text-white transition" aria-label="Instagram">
                <svg className="w-4 h-4 fill-currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
              <a href="#" className="hover:text-white transition" aria-label="Facebook">
                <svg className="w-4 h-4 fill-currentColor" viewBox="0 0 24 24"><path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.5 5H18V0h-3.808C10.595 0 9 1.583 9 4.615V8z"/></svg>
              </a>
              <a href="#" className="hover:text-white transition" aria-label="Twitter">
                <svg className="w-4 h-4 fill-currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href="#" className="hover:text-white transition" aria-label="YouTube">
                <svg className="w-4 h-4 fill-currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </a>
            </div>
          </div>

          {/* Quick Categories */}
          <div>
            <h4 className="text-xs font-bold tracking-widest uppercase mb-4 text-white">Categories</h4>
            <ul className="space-y-2 text-xs text-zinc-400">
              <li><Link to="/shop?category=shirts" className="hover:text-white transition">Shirts</Link></li>
              <li><Link to="/shop?category=oversized" className="hover:text-white transition">Oversized T-Shirts</Link></li>
              <li><Link to="/shop?category=bottoms" className="hover:text-white transition">Jeans & Cargos</Link></li>
              <li><Link to="/shop?category=co-ords" className="hover:text-white transition">Co-ord Sets</Link></li>
              <li><Link to="/shop?category=perfumes" className="hover:text-white transition">Fragrances & Perfumes</Link></li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h4 className="text-xs font-bold tracking-widest uppercase mb-4 text-white">Customer Care</h4>
            <ul className="space-y-2 text-xs text-zinc-400">
              <li><a href="#" className="hover:text-white transition">Track Your Order</a></li>
              <li><a href="#" className="hover:text-white transition">Return & Exchange Portal</a></li>
              <li><a href="#" className="hover:text-white transition">Shipping Policy</a></li>
              <li><a href="#" className="hover:text-white transition">Contact Us & FAQs</a></li>
              <li><a href="#" className="hover:text-white transition">Store Locator</a></li>
            </ul>
          </div>

          {/* Legal / Company */}
          <div>
            <h4 className="text-xs font-bold tracking-widest uppercase mb-4 text-white">About & Legal</h4>
            <ul className="space-y-2 text-xs text-zinc-400">
              <li><a href="#" className="hover:text-white transition">Our Story</a></li>
              <li><a href="#" className="hover:text-white transition">Terms & Conditions</a></li>
              <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Copyright */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-zinc-800 text-center text-[11px] text-zinc-500 flex flex-col sm:flex-row justify-between items-center gap-4">
        <p>© {new Date().getFullYear()} SNITCH Inc. All Rights Reserved.</p>
        <div className="flex items-center space-x-2">
        </div>
      </div>
    </footer>
  );
};

export default Footer;
