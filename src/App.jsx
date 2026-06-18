import { useState, useCallback } from 'react';
import { useCart } from './context/CartContext';
import { ProductsProvider } from './context/ProductsContext';
import Header from './components/Header';
import Hero from './components/Hero';
import ProductGrid from './components/ProductGrid';
import Features from './components/Features';
import ImaginePanel from './components/ImaginePanel';
import CartDrawer from './components/CartDrawer';
import Footer from './components/Footer';
import AdminPanel from './components/AdminPanel';

function AppContent() {
  const { cartCount } = useCart();
  const [cartOpen, setCartOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [activeSection, setActiveSection] = useState('');
  const [toast, setToast] = useState('');

  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  }, []);

  const navigate = (section) => {
    setActiveSection(section);
    const el = document.getElementById(section);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <Header
        cartCount={cartCount}
        onCartOpen={() => setCartOpen(true)}
        activeSection={activeSection}
        onNavigate={navigate}
        search={search}
        onSearch={setSearch}
      />
      <Hero onNavigate={navigate} />
      <ProductGrid search={search} onAdded={showToast} />
      <Features />
      <ImaginePanel />
      <Footer />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      <AdminPanel />
      <div className={`toast ${toast ? 'show' : ''}`}>{toast}</div>
    </>
  );
}

export default function App() {
  return (
    <ProductsProvider>
      <AppContent />
    </ProductsProvider>
  );
}
