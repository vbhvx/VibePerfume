import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { CompareProvider } from './context/CompareContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import CompareBar from './components/CompareBar';

import Home from './pages/Home';
import Collections from './pages/Collections';
import ProductDetail from './pages/ProductDetail';
import ScentFinder from './pages/ScentFinder';
import Compare from './pages/Compare';
import NoteGlossary from './pages/NoteGlossary';
import Wishlist from './pages/Wishlist';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import TrackOrder from './pages/TrackOrder';
import AdminDashboard from './pages/AdminDashboard';
import Policies from './pages/Policies';
import AiSommelier from './pages/AiSommelier';
import AiSommelierWidget from './components/AiSommelierWidget';

function App() {
  return (
    <CartProvider>
      <WishlistProvider>
        <CompareProvider>
          <div className="app">
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 3500,
                style: {
                  background: '#181822',
                  color: '#f8f8fa',
                  border: '1px solid rgba(212, 175, 55, 0.3)',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6)',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '0.88rem'
                },
                success: {
                  iconTheme: {
                    primary: '#d4af37',
                    secondary: '#0a0a0e'
                  }
                }
              }}
            />
            <Navbar />
            <main>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/collections" element={<Collections />} />
                <Route path="/fragrances" element={<Collections />} />
                <Route path="/products/:id" element={<ProductDetail />} />
                <Route path="/scent-finder" element={<ScentFinder />} />
                <Route path="/ai-sommelier" element={<AiSommelier />} />
                <Route path="/compare" element={<Compare />} />
                <Route path="/notes" element={<NoteGlossary />} />
                <Route path="/wishlist" element={<Wishlist />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/orders/:orderNumber" element={<OrderConfirmation />} />
                <Route path="/track-order" element={<TrackOrder />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/policies" element={<Policies />} />
                {/* Fallback to Home */}
                <Route path="*" element={<Home />} />
              </Routes>
            </main>
            <CartDrawer />
            <CompareBar />
            <AiSommelierWidget />
            <Footer />
          </div>
        </CompareProvider>
      </WishlistProvider>
    </CartProvider>
  );
}

export default App;
