import React, { useState } from 'react';
import { Star, X, ShoppingCart, Info, Award } from 'lucide-react';

export default function ProductDetail({ product, onClose, onAddToCart }) {
  const [activeTab, setActiveTab] = useState('specs'); // 'specs' | 'reviews'
  const [quantity, setQuantity] = useState(1);
  const isOutOfStock = product.stock <= 0;
  
  // LED indicator color based on stock level
  const getStockLedClass = () => {
    if (product.stock <= 0) return 'red';
    if (product.stock <= 5) return 'yellow';
    return 'green';
  };

  const getStockLabel = () => {
    if (product.stock <= 0) return 'Sold Out';
    if (product.stock <= 5) return `Critical Stock: Only ${product.stock} left`;
    return `In Stock: ${product.stock} units ready`;
  };

  return (
    <div 
      className="overlay-animate"
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px'
      }}
    >
      {/* Detail Container Box */}
      <div 
        className="skeuo-outset" 
        style={{
          width: '100%',
          maxWidth: '960px',
          maxHeight: '90vh',
          overflowY: 'auto',
          backgroundColor: 'var(--bg-base)',
          position: 'relative',
          padding: '32px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
          gap: '32px',
          animation: 'fadeInScale 0.3s ease-out'
        }}
      >
        {/* Close Button */}
        <button
          id="detail-close-btn"
          onClick={onClose}
          className="tactile-button"
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            padding: 0,
            zIndex: 10
          }}
          aria-label="Close details"
        >
          <X size={16} />
        </button>

        {/* Left Side: Product Image Display */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div 
            className="skeuo-inset" 
            style={{
              padding: '16px',
              backgroundColor: '#e6edf7',
              borderRadius: 'var(--border-radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              aspectRatio: '1',
              overflow: 'hidden'
            }}
          >
            <img 
              src={product.image} 
              alt={product.name}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: '8px',
                boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
              }}
            />
          </div>

          {/* Quick trust metrics */}
          <div className="skeuo-outset-sm" style={{ padding: '16px', display: 'flex', gap: '12px', alignItems: 'center', backgroundColor: '#eef2f7' }}>
            <Award size={24} style={{ color: 'var(--accent-gold)' }} />
            <div>
              <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>LIFETIME WARRANTY</h4>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Each product has a serial number and a guarantee card.</p>
            </div>
          </div>
        </div>

        {/* Right Side: Configuration & Buy Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'left' }}>
          <div>
            <span style={{
              fontSize: '12px',
              fontWeight: 800,
              color: 'var(--accent-gold-dark)',
              textTransform: 'uppercase',
              letterSpacing: '1.5px'
            }}>
              {product.category}
            </span>
            <h2 style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '28px',
              fontWeight: 700,
              color: 'var(--text-primary)',
              marginTop: '4px',
              lineHeight: '1.2'
            }}>
              {product.name}
            </h2>

            {/* Rating display */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
              <div style={{ display: 'flex', color: 'var(--accent-gold)' }}>
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    size={16} 
                    fill={i < Math.floor(product.rating) ? 'var(--accent-gold)' : 'none'} 
                    style={{ opacity: i < Math.floor(product.rating) ? 1 : 0.3 }}
                  />
                ))}
              </div>
              <span className="lcd-screen" style={{
                padding: '2px 8px',
                fontSize: '12px',
                borderRadius: '4px',
                color: '#ffb000',
                borderWidth: '1.5px',
                backgroundColor: '#0b131a'
              }}>
                {product.rating.toFixed(1)} / 5.0
              </span>
            </div>
          </div>

          {/* Description */}
          <p style={{
            fontSize: '14px',
            lineHeight: '1.6',
            color: 'var(--text-secondary)'
          }}>
            {product.description}
          </p>

          {/* Glowing Stock LED */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '10px 14px',
            borderRadius: 'var(--border-radius-sm)',
            backgroundColor: '#e6edf7'
          }} className="skeuo-inset-sm">
            <div className={`led-indicator ${getStockLedClass()}`}></div>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
              {getStockLabel()}
            </span>
          </div>

          {/* Tabs Selector: Specs vs Reviews */}
          <div>
            <div style={{ display: 'flex', gap: '8px', borderBottom: '2px dashed rgba(0,0,0,0.1)', paddingBottom: '8px' }}>
              <button
                id="tab-specs-btn"
                onClick={() => setActiveTab('specs')}
                className={`tactile-button ${activeTab === 'specs' ? 'active' : ''}`}
                style={{ padding: '6px 16px', fontSize: '13px' }}
              >
                Specifications
              </button>
              <button
                id="tab-reviews-btn"
                onClick={() => setActiveTab('reviews')}
                className={`tactile-button ${activeTab === 'reviews' ? 'active' : ''}`}
                style={{ padding: '6px 16px', fontSize: '13px' }}
              >
                User Reviews ({product.reviews ? product.reviews.length : 0})
              </button>
            </div>

            {/* Tab Contents */}
            <div style={{ marginTop: '12px', minHeight: '120px' }}>
              {activeTab === 'specs' ? (
                /* Specifications Table */
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <tbody>
                    {Object.entries(product.specifications || {}).map(([key, value]) => (
                      <tr key={key} style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                        <td style={{ padding: '6px 0', fontWeight: 700, color: 'var(--text-secondary)', width: '40%' }}>{key}</td>
                        <td style={{ padding: '6px 0', color: 'var(--text-primary)' }}>{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                /* Reviews List */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '150px', overflowY: 'auto' }}>
                  {product.reviews && product.reviews.length > 0 ? (
                    product.reviews.map((rev, idx) => (
                      <div key={idx} className="skeuo-inset-sm" style={{ padding: '10px', backgroundColor: '#eef2f7', fontSize: '13px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span style={{ fontWeight: 700 }}>{rev.user}</span>
                          <span className="lcd-screen" style={{ color: '#39ff14', padding: '1px 4px', fontSize: '10px', height: '18px' }}>
                            {rev.rating}★
                          </span>
                        </div>
                        <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>"{rev.comment}"</p>
                      </div>
                    ))
                  ) : (
                    <p style={{ fontStyle: 'italic', color: 'var(--text-secondary)', fontSize: '13px' }}>No reviews yet. Be the first to review.</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Pricing & Add to Cart Section */}
          <div style={{
            marginTop: 'auto',
            borderTop: '1px dashed rgba(0,0,0,0.1)',
            paddingTop: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px'
          }}>
            <div>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>TOTAL PRICE</span>
              <div style={{
                fontSize: '28px',
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                color: 'var(--text-primary)'
              }}>
                ₹{(product.price * quantity).toFixed(2)}
              </div>
            </div>

            {/* Quantity Selector Dial */}
            {!isOutOfStock && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>QTY:</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }} className="skeuo-outset-sm">
                  <button 
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="tactile-button"
                    style={{ width: '28px', height: '28px', border: 'none', borderRadius: '4px 0 0 4px', fontSize: '14px' }}
                  >
                    -
                  </button>
                  <span style={{
                    width: '32px',
                    textAlign: 'center',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                    fontSize: '14px'
                  }}>
                    {quantity}
                  </span>
                  <button 
                    onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                    className="tactile-button"
                    style={{ width: '28px', height: '28px', border: 'none', borderRadius: '0 4px 4px 0', fontSize: '14px' }}
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* Action Trigger */}
            <button
              id="detail-add-to-cart-btn"
              onClick={() => {
                onAddToCart(product, quantity);
                onClose();
              }}
              className="tactile-button tactile-button-gold"
              disabled={isOutOfStock}
              style={{
                padding: '12px 24px',
                fontSize: '15px',
                flexGrow: 1,
                maxWidth: '220px',
                gap: '8px'
              }}
            >
              <ShoppingCart size={18} />
              <span>Add to Cart</span>
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}
