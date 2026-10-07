import React, { useState } from 'react';
import { BrowserRouter } from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';

import TopBanner from './components/layout/TopBanner';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import CartDrawer from './components/cart/CartDrawer';
import SearchModal from './components/common/SearchModal';
import AppRoutes from './routes/AppRoutes';

function App() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <div className="flex flex-col min-h-screen bg-white text-zinc-900 selection:bg-black selection:text-white">

              {/* Top Banner */}
              <TopBanner />

              {/* Navbar */}
              <Navbar
                onOpenSearch={() => setIsSearchOpen(true)}
              />

              {/* Main Content */}
              <main className="flex-1">
                <AppRoutes />
              </main>

              {/* Footer */}
              <Footer />

              {/* Search Modal */}
              <SearchModal
                isOpen={isSearchOpen}
                onClose={() => setIsSearchOpen(false)}
              />

              {/* Cart Drawer */}
              <CartDrawer />

            </div>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;