import React, { useState } from 'react';
import ProductCard from './ProductCard';
import { SlidersHorizontal, ArrowUpDown, HelpCircle } from 'lucide-react';

export default function Storefront({ products, onViewDetails, onAddToCart, searchQuery }) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('featured'); // 'featured', 'price-low', 'price-high', 'rating'
  const [showInStockOnly, setShowInStockOnly] = useState(false);

  // Dynamically extract unique categories defined by the admin from products list
  const categories = ['All', ...new Set(products.map(p => p.category).filter(Boolean))];

  // Filter and sort products
  const filteredProducts = products
    .filter(product => {
      const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            product.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStock = !showInStockOnly || product.stock > 0;
      return matchesCategory && matchesSearch && matchesStock;
    })
    .sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      // Default: featured first, then name
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return a.name.localeCompare(b.name);
    });

  return (
    <main className="container" style={{ padding: '32px 24px', flexGrow: 1 }}>
      {/* Premium Hero Panel */}
      <section 
        className="skeuo-outset" 
        style={{
          padding: '40px 32px',
          marginBottom: '32px',
          textAlign: 'center',
          background: 'linear-gradient(135deg, #eef3fc 0%, #d8e3f5 100%)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{
          position: 'absolute',
          top: '-50px',
          right: '-50px',
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.4) 0%, transparent 70%)',
          pointerEvents: 'none'
        }}></div>

        <h1 style={{
          fontFamily: 'var(--font-serif)',
          fontSize: '44px',
          fontWeight: 700,
          color: 'var(--text-primary)',
          marginBottom: '12px',
          letterSpacing: '1px',
          textShadow: '1px 1px 0px #fff'
        }}>
          Premium Product Sales
        </h1>
        <p style={{
          fontSize: '18px',
          color: 'var(--text-secondary)',
          maxWidth: '650px',
          margin: '0 auto',
          lineHeight: '1.6'
        }}>
          Welcome to AURA, your best shop for premium and high-quality items. Explore our selection of watches, speakers, office items, and daily accessories that last a long time.
        </p>

        {/* Vintage Dial Indicators mock */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '24px',
          marginTop: '24px',
          borderTop: '1px dashed rgba(0,0,0,0.1)',
          paddingTop: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="led-indicator green"></div>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Handcrafted Quality</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="led-indicator yellow"></div>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Limited Batches</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="led-indicator green"></div>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Lifetime Value</span>
          </div>
        </div>
      </section>

      {/* Control Console: Categories and Filters */}
      <section 
        className="skeuo-outset" 
        style={{
          padding: '20px',
          marginBottom: '32px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          backgroundColor: '#e6edf7'
        }}
      >
        {/* Category Switches */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <span style={{
            fontSize: '13px',
            fontWeight: 800,
            color: 'var(--text-secondary)',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            marginRight: '8px'
          }}>
            Filter Categories:
          </span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {categories.map(category => {
              const isActive = selectedCategory === category;
              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`tactile-button ${isActive ? 'active' : ''}`}
                  style={{
                    padding: '8px 16px',
                    fontSize: '13px',
                    borderRadius: '20px',
                    backgroundColor: isActive ? '#d1dceb' : 'var(--bg-base)',
                    fontWeight: 700
                  }}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </div>

        {/* Sort & Secondary Controls */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          borderTop: '1px dashed rgba(0,0,0,0.1)',
          paddingTop: '16px'
        }}>
          {/* Sorting dial dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
              <ArrowUpDown size={16} />
              <span style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase' }}>Sort By:</span>
            </div>
            
            <div className="skeuo-inset-sm" style={{ padding: '2px 4px', backgroundColor: '#e6edf7' }}>
              <select
                id="store-sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  padding: '6px 12px',
                  fontSize: '13px',
                  fontFamily: 'var(--font-sans)',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="featured">Featured Products</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Customer Rating</option>
              </select>
            </div>
          </div>

          {/* Toggle Switch for Availability */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)' }}>In Stock Only</span>
            <label className="skeuo-toggle">
              <input
                id="store-instock-toggle"
                type="checkbox"
                checked={showInStockOnly}
                onChange={(e) => setShowInStockOnly(e.target.checked)}
              />
              <span className="skeuo-slider"></span>
            </label>
          </div>
        </div>
      </section>

      {/* Catalog Display */}
      {filteredProducts.length > 0 ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '24px'
        }}>
          {filteredProducts.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onViewDetails={onViewDetails}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>
      ) : (
        /* Empty State designed like a paper document slot */
        <div 
          className="skeuo-inset" 
          style={{
            padding: '60px 40px',
            textAlign: 'center',
            backgroundColor: '#e6edf7'
          }}
        >
          <HelpCircle size={48} style={{ color: 'var(--text-secondary)', marginBottom: '16px', opacity: 0.7 }} />
          <h3 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
            No Products Found
          </h3>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', margin: '0 auto', fontSize: '14px', lineHeight: '1.5' }}>
            We could not find any products matching your category or search keyword. Try changing your filters.
          </p>
        </div>
      )}
    </main>
  );
}
