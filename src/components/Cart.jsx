import React from 'react';
import { X, Trash2, ShoppingBag, CreditCard, ArrowRight } from 'lucide-react';

export default function Cart({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout
}) {
  if (!isOpen) return null;

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.08; // 8% simulated tax
  const total = subtotal + tax;

  return (
    <div 
      className="overlay-animate"
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        zIndex: 999,
        display: 'flex',
        justifyContent: 'flex-end'
      }}
    >
      {/* Sliding Sidebar panel */}
      <div 
        className="metal-steel stitch-border"
        style={{
          width: '100%',
          maxWidth: '440px',
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-10px 0px 30px rgba(0,0,0,0.25)',
          animation: 'slideLeft 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          borderRadius: '16px 0 0 16px'
        }}
      >
        {/* Drawer Header */}
        <div style={{
          padding: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px dashed rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', fontWeight: 700 }}>Shopping Cart</span>
            <div className="led-indicator green"></div>
          </div>
          <button
            id="cart-close-btn"
            onClick={onClose}
            className="tactile-button"
            style={{ width: '32px', height: '32px', borderRadius: '50%', padding: 0 }}
            aria-label="Close cart"
          >
            <X size={16} />
          </button>
        </div>

        {/* Paper Receipt Box (Scrollable) */}
        <div style={{
          flexGrow: 1,
          padding: '24px 16px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          backgroundColor: '#d8e3f5'
        }}>
          {cartItems.length > 0 ? (
            /* The Physical Receipt Ticket */
            <div 
              className="paper-texture receipt-tear" 
              style={{
                padding: '28px 20px 40px 20px',
                color: '#333333',
                fontFamily: 'var(--font-mono)',
                fontSize: '13px',
                boxShadow: '0 8px 16px rgba(0,0,0,0.15)'
              }}
            >
              {/* Receipt Header details */}
              <div style={{ textAlign: 'center', marginBottom: '20px', borderBottom: '1.5px dashed #aaa', paddingBottom: '12px' }}>
                <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', fontWeight: 700, margin: '4px 0', letterSpacing: '2px' }}>A U R A</h4>
                <p style={{ fontSize: '11px', color: '#666' }}>SECURE CHECKOUT</p>
                <p style={{ fontSize: '11px', color: '#666' }}>{new Date().toLocaleString()}</p>
              </div>

              {/* Items List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
                {cartItems.map(item => (
                  <div key={item.id} style={{ display: 'flex', flexDirection: 'column', gap: '4px', borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                      <span style={{ fontWeight: 700, fontFamily: 'var(--font-sans)', color: 'var(--text-primary)' }}>{item.name}</span>
                      <span style={{ fontWeight: 800 }}>₹{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                      <span style={{ fontSize: '11px', color: '#666' }}>₹{item.price.toFixed(2)} each</span>
                      
                      {/* Quantity Controller & Delete */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#eef2f7', border: '1px solid #ddd', borderRadius: '4px' }}>
                          <button
                            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                            style={{ width: '22px', height: '22px', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold' }}
                          >
                            -
                          </button>
                          <span style={{ width: '20px', textAlign: 'center', fontSize: '12px', fontWeight: 'bold' }}>{item.quantity}</span>
                          <button
                            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                            style={{ width: '22px', height: '22px', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold' }}
                          >
                            +
                          </button>
                        </div>
                        
                        <button
                          onClick={() => onRemoveItem(item.id)}
                          style={{ border: 'none', background: 'none', color: 'var(--accent-red)', cursor: 'pointer', padding: '2px' }}
                          title="Remove item"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Receipt Summary Calculation */}
              <div style={{ borderTop: '1.5px dashed #aaa', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>ITEMS TOTAL</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>GST (8.0%)</span>
                  <span>₹{tax.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 800, marginTop: '4px', borderTop: '1px solid #eee', paddingTop: '6px' }}>
                  <span>GRAND TOTAL</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          ) : (
            /* Empty Basket State */
            <div className="skeuo-inset" style={{
              padding: '40px 20px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '16px',
              height: '100%',
              backgroundColor: '#e6edf7'
            }}>
              <ShoppingBag size={48} style={{ color: 'var(--text-secondary)', opacity: 0.6 }} />
              <div>
                <h4 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>Cart is Empty</h4>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                  Your cart is empty. Please add some products to buy.
                </p>
              </div>
              <button 
                onClick={onClose}
                className="tactile-button" 
                style={{ padding: '8px 16px', fontSize: '13px', marginTop: '8px' }}
              >
                Browse Catalog
              </button>
            </div>
          )}
        </div>

        {/* Cart Drawer Footer Button Area */}
        {cartItems.length > 0 && (
          <div style={{
            padding: '24px',
            borderTop: '1px dashed rgba(0,0,0,0.1)',
            backgroundColor: 'var(--bg-base)'
          }}>
            <button
              id="cart-checkout-btn"
              onClick={onCheckout}
              className="tactile-button tactile-button-gold"
              style={{
                width: '100%',
                padding: '16px',
                fontSize: '16px',
                gap: '8px',
                fontWeight: 700
              }}
            >
              <CreditCard size={18} />
              <span>Proceed to Checkout</span>
              <ArrowRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Embedded CSS Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideLeft {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
