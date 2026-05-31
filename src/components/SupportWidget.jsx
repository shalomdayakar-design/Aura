import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { MessageSquare, Send, X, Radio } from 'lucide-react';

export default function SupportWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [supportEmail, setSupportEmail] = useState('support@auracuration.com');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [query, setQuery] = useState('');

  useEffect(() => {
    // Load admin's configured support email
    const s = db.getAdminSettings();
    if (s && s.supportEmail) {
      setSupportEmail(s.supportEmail);
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !email || !query) return;

    // Build the mailto link pre-addressed to the admin
    const subject = encodeURIComponent(`AURA Store - Customer Support Request [${name}]`);
    const body = encodeURIComponent(
      `Customer Name: ${name}\n` +
      `Customer Email: ${email}\n\n` +
      `Support Message:\n` +
      `---------------------------------\n` +
      `${query}\n` +
      `---------------------------------\n\n` +
      `Submitted via AURA Support on ${new Date().toLocaleString()}`
    );

    const mailtoLink = `mailto:${supportEmail}?subject=${subject}&body=${body}`;
    
    // Launch mail client
    window.open(mailtoLink, '_blank');
    
    // Reset forms
    setName('');
    setEmail('');
    setQuery('');
    setIsOpen(false);
    alert('Support Email Ready!\nOpening email application to send details to: ' + supportEmail);
  };

  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999, fontFamily: 'var(--font-sans)' }}>
      {/* Floating Transceiver Walkie-Talkie Button */}
      {!isOpen && (
        <button
          id="transceiver-widget-btn"
          onClick={() => setIsOpen(true)}
          className="metal-brushed stitch-border-light"
          style={{
            width: '60px',
            height: '80px',
            borderRadius: '10px 10px 6px 6px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            cursor: 'pointer',
            padding: '8px',
            boxShadow: '0 6px 12px rgba(0,0,0,0.3), inset 1px 1px 1px rgba(255,255,255,0.2)'
          }}
          title="Open Customer Support"
        >
          {/* Antenna */}
          <div style={{
            position: 'absolute', top: '-24px', left: '12px', width: '6px', height: '24px',
            backgroundColor: '#1b212c', borderRadius: '3px 3px 0 0', border: '1px solid #323d4c'
          }}></div>
          
          {/* Knob */}
          <div style={{
            position: 'absolute', top: '-6px', right: '10px', width: '12px', height: '8px',
            backgroundColor: '#0a0d14', borderRadius: '2px 2px 0 0'
          }}></div>

          {/* Glowing LED */}
          <div className="led-indicator green" style={{ position: 'absolute', top: '10px', right: '10px', width: '8px', height: '8px' }}></div>
          
          {/* Speaker Grille Mock lines */}
          <div style={{ width: '100%', height: '14px', display: 'flex', flexDirection: 'column', gap: '2px', margin: '4px 0 8px 0' }}>
            {[...Array(4)].map((_, i) => (
              <div key={i} style={{ height: '2px', backgroundColor: '#0a0d14', width: '100%', borderRadius: '1px' }}></div>
            ))}
          </div>

          {/* Icon */}
          <Radio size={20} style={{ color: 'var(--accent-gold)' }} />
          <span style={{ fontSize: '7px', fontWeight: 800, marginTop: '4px', letterSpacing: '0.5px', color: '#9cb0cc' }}>SUPPORT</span>
        </button>
      )}

      {/* Support Transceiver Dialogue Box */}
      {isOpen && (
        <div 
          className="metal-brushed stitch-border-light" 
          style={{
            width: '100%',
            maxWidth: '320px',
            padding: '20px',
            borderRadius: 'var(--border-radius-md)',
            animation: 'fadeInScale 0.25s ease-out',
            boxShadow: '0 10px 25px rgba(0,0,0,0.4)',
            textAlign: 'left'
          }}
        >
          {/* Close Trigger */}
          <button
            onClick={() => setIsOpen(false)}
            style={{
              position: 'absolute', top: '12px', right: '12px', border: 'none', background: 'none',
              color: '#9cb0cc', cursor: 'pointer', padding: '4px'
            }}
          >
            <X size={16} />
          </button>

          {/* Dialogue Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', borderBottom: '1px dashed rgba(255,255,255,0.1)', paddingBottom: '8px' }}>
            <Radio size={16} style={{ color: 'var(--accent-gold)' }} />
            <div>
              <strong style={{ fontSize: '12px', color: 'white', display: 'block', letterSpacing: '1px' }}>CUSTOMER SUPPORT</strong>
              <span style={{ fontSize: '8px', color: '#9cb0cc' }}>SEND TO: {supportEmail}</span>
            </div>
            <div className="led-indicator green" style={{ width: '8px', height: '8px', marginLeft: 'auto' }}></div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <label style={{ fontSize: '9px', color: '#9cb0cc', fontWeight: 800 }}>YOUR NAME</label>
              <input
                id="support-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                style={{ padding: '8px', border: '1px solid #323d54', borderRadius: '4px', backgroundColor: '#131924', color: 'white', fontSize: '13px', outline: 'none' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <label style={{ fontSize: '9px', color: '#9cb0cc', fontWeight: 800 }}>YOUR EMAIL</label>
              <input
                id="support-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@email.com"
                style={{ padding: '8px', border: '1px solid #323d54', borderRadius: '4px', backgroundColor: '#131924', color: 'white', fontSize: '13px', outline: 'none' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <label style={{ fontSize: '9px', color: '#9cb0cc', fontWeight: 800 }}>WRITE YOUR MESSAGE</label>
              <textarea
                id="support-query"
                rows={3}
                required
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter details here..."
                style={{ padding: '8px', border: '1px solid #323d54', borderRadius: '4px', backgroundColor: '#131924', color: 'white', fontSize: '12px', outline: 'none', resize: 'none' }}
              />
            </div>

            <button
              id="support-submit-btn"
              type="submit"
              className="tactile-button tactile-button-gold"
              style={{
                width: '100%', padding: '10px', fontSize: '13px', marginTop: '6px', gap: '6px', fontWeight: 700
              }}
            >
              <Send size={12} />
              <span>Send Message</span>
            </button>
          </form>
        </div>
      )}

      <style>{`
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
