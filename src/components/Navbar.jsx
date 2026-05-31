import React, { useState, useEffect } from 'react';
import { ShoppingBag, Search, Shield, ShoppingCart, LogOut, Phone, Smartphone, X } from 'lucide-react';

export default function Navbar({
  currentView,
  setView,
  cartCount,
  toggleCart,
  searchQuery,
  setSearchQuery
}) {
  const [userPhone, setUserPhone] = useState('');

  // Synchronize user phone verification from session storage
  const syncUserSession = () => {
    const session = sessionStorage.getItem('user_phone_session');
    setUserPhone(session || '');
  };

  useEffect(() => {
    syncUserSession();
    // Watch for custom changes or re-renders
    const interval = setInterval(syncUserSession, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleUserLogout = () => {
    sessionStorage.removeItem('user_phone_session');
    setUserPhone('');
    window.location.reload(); // Refresh to clean state cleanly
  };

  // PWA states & logic
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallBtn, setShowInstallBtn] = useState(false);
  const [showInstallGuide, setShowInstallGuide] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if running in standalone/installed mode
    const checkStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    setIsStandalone(!!checkStandalone);

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBtn(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    const handleAppInstalled = () => {
      console.log('App installed successfully');
      setShowInstallBtn(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowInstallBtn(false);
        setDeferredPrompt(null);
      }
    } else {
      setShowInstallGuide(true);
    }
  };

  return (
    <>
      <header className="metal-steel stitch-border nav-header" style={{
        padding: '16px 24px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '20px',
        borderRadius: '0 0 16px 16px'
      }}>
        {/* Brand Logo */}
        <div 
          onClick={() => setView('store')}
          className="nav-brand"
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}
        >
          <img 
            src="/aura_logo.png" 
            alt="AURA Logo" 
            width="34" 
            height="34" 
            className="aura-pulsing-logo"
            style={{
              borderRadius: '50%',
              objectFit: 'cover',
              border: '2px solid var(--accent-gold)',
              boxShadow: '0 2px 6px rgba(212,175,55,0.4)',
              backgroundColor: 'var(--bg-dark)'
            }}
          />
          <span style={{
            fontFamily: "var(--font-serif)",
            fontSize: '28px',
            fontWeight: 700,
            letterSpacing: '3px',
            color: 'var(--text-primary)',
            textShadow: '1px 1px 0px rgba(255,255,255,0.8)'
          }}>AURA</span>
          <div className="led-indicator green" style={{ marginTop: '2px' }} title="Server Online"></div>
        </div>

        {/* Dynamic Search Box */}
        {currentView === 'store' && (
          <div className="skeuo-inset-sm search-container" style={{
            display: 'flex',
            alignItems: 'center',
            padding: '6px 12px',
            width: '100%',
            maxWidth: '300px',
            gap: '8px',
            backgroundColor: '#e6edf7'
          }}>
            <Search size={18} style={{ color: 'var(--text-secondary)' }} />
            <input
              id="store-search-input"
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                border: 'none',
                background: 'transparent',
                outline: 'none',
                width: '100%',
                fontSize: '14px',
                fontFamily: 'var(--font-sans)',
                color: 'var(--text-primary)'
              }}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 700 }}
              >
                ✕
              </button>
            )}
          </div>
        )}

        {/* Access Panel Buttons */}
        <div className="nav-actions-container" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          
          {/* User Mobile Status Indicators */}
          {userPhone && currentView === 'store' && (
            <div className="skeuo-inset-sm" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: 700,
              backgroundColor: '#e6edf7'
            }}>
              <Phone size={12} style={{ color: 'var(--text-secondary)' }} />
              <span>+91 {userPhone}</span>
              <button 
                onClick={handleUserLogout}
                style={{
                  border: 'none',
                  background: 'none',
                  color: 'var(--accent-red)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  marginLeft: '4px'
                }}
                title="Logout User"
              >
                <LogOut size={12} />
              </button>
            </div>
          )}

          {/* Install PWA Button */}
          {!isStandalone && (
            <button
              id="nav-install-btn"
              onClick={handleInstallClick}
              className="tactile-button-gold"
              style={{ 
                padding: '8px 16px', 
                fontSize: '13px', 
                gap: '6px',
              }}
              title="Download App / Install Web App"
            >
              <Smartphone size={16} />
              <span>Install App</span>
            </button>
          )}

          {/* Toggle Store / Admin */}
          {currentView === 'store' ? (
            <button
              id="nav-admin-btn"
              onClick={() => setView('admin')}
              className="tactile-button"
              style={{ padding: '8px 16px', fontSize: '13px', gap: '6px' }}
            >
              <Shield size={16} />
              <span>Admin Panel</span>
            </button>
          ) : (
            <button
              id="nav-store-btn"
              onClick={() => setView('store')}
              className="tactile-button"
              style={{ padding: '8px 16px', fontSize: '13px', gap: '6px' }}
            >
              <ShoppingBag size={16} />
              <span>Storefront</span>
            </button>
          )}

          {/* Shopping Cart Trigger */}
          {currentView === 'store' && (
            <button
              id="nav-cart-btn"
              onClick={toggleCart}
              className="tactile-button"
              style={{ width: '42px', height: '42px', borderRadius: '50%', position: 'relative' }}
              aria-label="Toggle Shopping Cart"
            >
              <ShoppingCart size={18} />
              {cartCount > 0 && (
                <span 
                  className="led-indicator red"
                  style={{
                    position: 'absolute', top: '-2px', right: '-2px', width: '18px', height: '18px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px',
                    color: 'white', fontWeight: 800, border: '1.5px solid #fff'
                  }}
                >
                  {cartCount}
                </span>
              )}
            </button>
          )}
        </div>
      </header>

      {/* PWA Mobile Installation Guide Modal */}
      {showInstallGuide && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(11, 19, 26, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div className="metal-brushed stitch-border fade-slide-in" style={{
            width: '100%',
            maxWidth: '450px',
            borderRadius: 'var(--border-radius-md)',
            padding: '24px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
            position: 'relative'
          }}>
            {/* Close Button */}
            <button
              onClick={() => setShowInstallGuide(false)}
              className="tactile-button"
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                padding: 0
              }}
              aria-label="Close"
            >
              <X size={16} />
            </button>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{
                backgroundColor: 'rgba(212,175,55,0.1)',
                padding: '10px',
                borderRadius: '50%',
                border: '1.5px solid var(--accent-gold)'
              }}>
                <Smartphone size={24} style={{ color: 'var(--accent-gold)' }} />
              </div>
              <div>
                <h3 style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '20px',
                  color: 'white',
                  fontWeight: 700
                }}>Download Mobile App</h3>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginTop: '2px' }}>
                  Install AURA directly on your phone
                </p>
              </div>
            </div>

            {/* Content */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', color: '#e5e9f0', fontSize: '14px', lineHeight: 1.5 }}>
              <p>
                Get the AURA app experience on your phone. Installing uses minimal storage and works offline!
              </p>

              <div className="skeuo-inset" style={{
                backgroundColor: 'rgba(0,0,0,0.2)',
                padding: '16px',
                borderRadius: 'var(--border-radius-sm)',
                border: '1px solid rgba(255,255,255,0.05)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                <h4 style={{ color: 'var(--accent-gold)', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Installation Guide:
                </h4>
                
                {/* Android Steps */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <span style={{ fontWeight: 700, color: 'var(--accent-gold)' }}>1.</span>
                    <span>Open this website in <strong>Chrome</strong> on your Android phone.</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <span style={{ fontWeight: 700, color: 'var(--accent-gold)' }}>2.</span>
                    <span>Tap the menu icon (3 dots) in the top-right corner.</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <span style={{ fontWeight: 700, color: 'var(--accent-gold)' }}>3.</span>
                    <span>Tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.</span>
                  </div>
                </div>

                <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.1)', margin: '4px 0' }}></div>

                {/* iPhone / iOS Steps */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <span style={{ fontWeight: 700, color: 'var(--accent-gold)' }}>Safari (iOS):</span>
                    <span>Tap the <strong>Share</strong> button at the bottom, then scroll down and select <strong>"Add to Home Screen"</strong>.</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowInstallGuide(false)}
                className="tactile-button-gold"
                style={{ width: '100%', padding: '12px', marginTop: '8px', fontSize: '14px' }}
              >
                Okay, Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
