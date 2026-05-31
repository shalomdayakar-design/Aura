import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Storefront from './components/Storefront';
import ProductDetail from './components/ProductDetail';
import Cart from './components/Cart';
import Checkout from './components/Checkout';
import AdminDashboard from './components/AdminDashboard';
import { db } from './services/db';
import SupportWidget from './components/SupportWidget';

export default function App() {
  const [view, setView] = useState('store'); // 'store' | 'admin' | 'checkout'
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Load products from DB
  useEffect(() => {
    let active = true;
    db.syncWithServer().then(() => {
      if (active) {
        setProducts(db.getProducts());
      }
    });
    return () => {
      active = false;
    };
  }, [view]);

  // Load cart from LocalStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('aura_cart');
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
  }, []);

  // Sync cart to LocalStorage
  const saveCart = (newCart) => {
    setCartItems(newCart);
    localStorage.setItem('aura_cart', JSON.stringify(newCart));
  };

  // Add Item to Cart
  const handleAddToCart = (product, quantity = 1) => {
    const existingIndex = cartItems.findIndex(item => item.id === product.id);
    let updatedCart = [...cartItems];

    if (existingIndex !== -1) {
      // Limit to available stock
      const newQty = Math.min(product.stock, updatedCart[existingIndex].quantity + quantity);
      updatedCart[existingIndex].quantity = newQty;
    } else {
      updatedCart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: Math.min(product.stock, quantity)
      });
    }

    saveCart(updatedCart);
    setIsCartOpen(true); // Proactively open cart to show it was added
  };

  // Update Cart Quantity
  const handleUpdateCartQuantity = (id, newQty) => {
    const product = db.getProductById(id);
    const maxStock = product ? product.stock : 999;
    
    if (newQty <= 0) {
      handleRemoveCartItem(id);
      return;
    }

    const updated = cartItems.map(item => {
      if (item.id === id) {
        return { ...item, quantity: Math.min(maxStock, newQty) };
      }
      return item;
    });

    saveCart(updated);
  };

  // Remove Cart Item
  const handleRemoveCartItem = (id) => {
    const updated = cartItems.filter(item => item.id !== id);
    saveCart(updated);
  };

  // Checkout Initiation
  const handleCheckoutInitiate = () => {
    setIsCartOpen(false);
    setView('checkout');
  };

  // Place Order completion
  const handlePlaceOrder = (orderData) => {
    const placed = db.addOrder(orderData);
    // Clear cart upon successful payment checkout
    saveCart([]);
    return placed;
  };

  const handleCancelCheckout = () => {
    setView('store');
  };

  // Cart badge count
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Dynamic Header */}
      <Navbar 
        currentView={view}
        setView={(v) => {
          setView(v);
          setSearchQuery(''); // Clear search on switch
        }}
        cartCount={cartCount}
        toggleCart={() => setIsCartOpen(!isCartOpen)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Main Views Container */}
      <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {view === 'store' && (
          <div className="fade-slide-in" style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
            <Storefront
              products={products}
              onViewDetails={(p) => setSelectedProduct(p)}
              onAddToCart={handleAddToCart}
              searchQuery={searchQuery}
            />
          </div>
        )}

        {view === 'checkout' && (
          <div className="fade-slide-in" style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
            <Checkout
              cartItems={cartItems}
              onPlaceOrder={handlePlaceOrder}
              onCancel={handleCancelCheckout}
            />
          </div>
        )}

        {view === 'admin' && (
          <div className="fade-slide-in" style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
            <AdminDashboard />
          </div>
        )}
      </div>

      {/* Product Details Modal popup */}
      {selectedProduct && (
        <ProductDetail
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={handleAddToCart}
        />
      )}

      {/* Cart Drawer sliding sidebar */}
      <Cart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onCheckout={handleCheckoutInitiate}
      />

      {/* Support Walkie-Talkie Intercom */}
      {view === 'store' && <SupportWidget />}

      {/* Premium Footer with skeuomorphic branding */}
      <footer className="footer-skeuo stitch-border" style={{ marginTop: 'auto', borderRadius: '16px 16px 0 0' }}>
        <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ fontSize: '20px', fontFamily: 'var(--font-serif)', fontWeight: 700, letterSpacing: '1px' }}>
            A U R A
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            © 2026 AURA Inc. Engineered with modern skeuomorphic layouts. All rights reserved.
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', fontSize: '12px', fontWeight: 700 }}>
            <span style={{ cursor: 'pointer', hover: { textDecoration: 'underline' } }} onClick={() => setView('store')}>Storefront</span>
            <span>•</span>
            <span style={{ cursor: 'pointer' }} onClick={() => setView('admin')}>Admin Panel</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
