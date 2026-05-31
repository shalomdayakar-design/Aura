import React from 'react';
import { Star, Eye, ShoppingCart } from 'lucide-react';

export default function ProductCard({ product, onViewDetails, onAddToCart }) {
  const isOutOfStock = product.stock <= 0;

  return (
    <div 
      className="skeuo-outset" 
      style={{
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        position: 'relative',
        transition: 'transform var(--transition-normal), box-shadow var(--transition-normal)',
        height: '100%'
      }}
    >
      {/* Product Image Slot with Inset shadow */}
      <div 
        className="skeuo-inset-sm" 
        style={{
          width: '100%',
          aspectRatio: '1',
          overflow: 'hidden',
          backgroundColor: '#e6edf7',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative'
        }}
      >
        <img 
          src={product.image} 
          alt={product.name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform var(--transition-normal)'
          }}
          className="product-card-img"
        />
        {product.featured && <span className="ribbon-tag">Featured</span>}
        {isOutOfStock && (
          <div style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(30, 37, 48, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 800,
            fontSize: '16px',
            textTransform: 'uppercase',
            letterSpacing: '1.5px',
            backdropFilter: 'blur(2px)'
          }}>
            Sold Out
          </div>
        )}
      </div>

      {/* Info Section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flexGrow: 1, textAlign: 'left' }}>
        <span style={{
          fontSize: '11px',
          fontWeight: 700,
          color: 'var(--text-secondary)',
          textTransform: 'uppercase',
          letterSpacing: '1px'
        }}>
          {product.category}
        </span>
        <h3 style={{
          fontSize: '17px',
          fontWeight: 600,
          color: 'var(--text-primary)',
          lineHeight: '1.3',
          minHeight: '44px',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {product.name}
        </h3>
        
        {/* Rating gauge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: '4px 0' }}>
          <div style={{ display: 'flex', color: 'var(--accent-gold)' }}>
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                size={14} 
                fill={i < Math.floor(product.rating) ? 'var(--accent-gold)' : 'none'} 
                style={{ opacity: i < Math.floor(product.rating) ? 1 : 0.3 }}
              />
            ))}
          </div>
          <span className="lcd-screen" style={{
            padding: '2px 6px',
            fontSize: '11px',
            lineHeight: '1',
            borderRadius: '4px',
            color: '#ffb000',
            textShadow: '0 0 2px rgba(255, 176, 0, 0.4)',
            borderWidth: '1.5px',
            backgroundColor: '#0b131a'
          }}>
            {product.rating.toFixed(1)}
          </span>
        </div>
      </div>

      {/* Price & Action Section */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'between',
        borderTop: '1px dashed rgba(0,0,0,0.1)',
        paddingTop: '12px',
        marginTop: 'auto',
        gap: '10px'
      }}>
        {/* Price display */}
        <div style={{ flexGrow: 1, textAlign: 'left' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block' }}>PRICE</span>
          <span style={{
            fontSize: '20px',
            fontFamily: 'var(--font-mono)',
            fontWeight: 700,
            color: 'var(--text-primary)'
          }}>
            ₹{product.price.toFixed(2)}
          </span>
        </div>

        {/* Tactile buttons */}
        <div style={{ display: 'flex', gap: '6px' }}>
          <button 
            onClick={() => onViewDetails(product)}
            className="tactile-button"
            style={{ width: '38px', height: '38px', padding: 0 }}
            title="View Details"
          >
            <Eye size={16} />
          </button>
          
          <button 
            onClick={() => onAddToCart(product)}
            className="tactile-button tactile-button-gold"
            disabled={isOutOfStock}
            style={{ width: '38px', height: '38px', padding: 0 }}
            title="Add to Cart"
          >
            <ShoppingCart size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
