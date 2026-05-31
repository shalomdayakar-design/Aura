import React, { useState } from 'react';
import { db } from '../services/db';
import { Save, Key, CreditCard, RefreshCw } from 'lucide-react';

export default function AdminSettings({ settings, onRefresh }) {
  const [username, setUsername] = useState(settings.username || '');
  const [password, setPassword] = useState(settings.password || '');
  const [supportEmail, setSupportEmail] = useState(settings.supportEmail || 'support@auracuration.com');
  const [upiId, setUpiId] = useState(settings.upiId || '');
  const [bankDetails, setBankDetails] = useState(settings.bankDetails || '');
  const [paymentLink, setPaymentLink] = useState(settings.paymentLink || '');
  const [deliveryFee, setDeliveryFee] = useState(settings.deliveryFee !== undefined ? settings.deliveryFee : 50);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    // Simulate setting write latency
    setTimeout(() => {
      const updated = {
        ...settings,
        username,
        password,
        supportEmail,
        upiId,
        bankDetails,
        paymentLink,
        deliveryFee: parseFloat(deliveryFee) || 0
      };
      
      db.saveAdminSettings(updated);
      setIsSaving(false);
      setShowSuccess(true);
      onRefresh();
      
      setTimeout(() => setShowSuccess(false), 3000);
    }, 1000);
  };

  return (
    <div className="skeuo-outset" style={{ padding: '28px', backgroundColor: '#eef2f7', textAlign: 'left' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>
          ADMIN SETTINGS
        </h3>
        {showSuccess && (
          <div className="led-indicator green" style={{ width: '14px', height: '14px', boxShadow: '0 0 10px var(--accent-green)' }} title="Saved Successfully"></div>
        )}
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Section 1: Credentials */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', borderBottom: '1px dashed rgba(0,0,0,0.1)', paddingBottom: '8px' }}>
            <Key size={16} style={{ color: 'var(--text-secondary)' }} />
            <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Admin Login Details</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-secondary)' }}>USERNAME</label>
              <input
                id="set-username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="skeuo-inset-sm"
                style={{ padding: '10px', border: '1px solid rgba(255,255,255,0.4)', outline: 'none', fontFamily: 'var(--font-sans)', fontSize: '14px' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-secondary)' }}>PASSWORD</label>
              <input
                id="set-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="skeuo-inset-sm"
                style={{ padding: '10px', border: '1px solid rgba(255,255,255,0.4)', outline: 'none', fontFamily: 'var(--font-sans)', fontSize: '14px' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '6px' }}>
            <label style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-secondary)' }}>CUSTOMER SUPPORT EMAIL</label>
            <input
              id="set-support-email"
              type="email"
              required
              value={supportEmail}
              onChange={(e) => setSupportEmail(e.target.value)}
              className="skeuo-inset-sm"
              style={{ padding: '10px', border: '1px solid rgba(255,255,255,0.4)', outline: 'none', fontFamily: 'var(--font-sans)', fontSize: '14px' }}
            />
            <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Customer support emails will be sent here.</span>
          </div>
        </div>

        {/* Section 2: Payments & Delivery Configuration */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', borderBottom: '1px dashed rgba(0,0,0,0.1)', paddingBottom: '8px' }}>
            <CreditCard size={16} style={{ color: 'var(--text-secondary)' }} />
            <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Payment & Delivery Settings</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-secondary)' }}>UPI ID (FOR UPI QR CODE)</label>
              <input
                id="set-upi"
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="UPI ID (e.g. name@upi)"
                className="skeuo-inset-sm"
                style={{ padding: '10px', border: '1px solid rgba(255,255,255,0.4)', outline: 'none', fontFamily: 'var(--font-mono)', fontSize: '14px' }}
              />
              <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>If empty, the app will show a card payment simulator instead.</span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-secondary)' }}>DELIVERY CHARGE FOR ORDERS UNDER ₹1000</label>
              <input
                id="set-delivery-fee"
                type="number"
                min="0"
                required
                value={deliveryFee}
                onChange={(e) => setDeliveryFee(e.target.value)}
                placeholder="50"
                className="skeuo-inset-sm"
                style={{ padding: '10px', border: '1px solid rgba(255,255,255,0.4)', outline: 'none', fontFamily: 'var(--font-mono)', fontSize: '14px' }}
              />
              <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>This fee is added if order total is less than ₹1000. Orders above ₹1000 get Free Delivery.</span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-secondary)' }}>BANK ACCOUNT DETAILS</label>
              <textarea
                id="set-bank"
                rows={3}
                value={bankDetails}
                onChange={(e) => setBankDetails(e.target.value)}
                placeholder="Bank Name: State Bank of India&#10;Account No: 1234567890&#10;IFSC Code: SBIN0001234"
                className="skeuo-inset-sm"
                style={{ padding: '10px', border: '1px solid rgba(255,255,255,0.4)', outline: 'none', fontFamily: 'var(--font-sans)', fontSize: '13px', resize: 'vertical' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-secondary)' }}>PAYMENT LINK (OPTIONAL)</label>
              <input
                id="set-paylink"
                type="url"
                value={paymentLink}
                onChange={(e) => setPaymentLink(e.target.value)}
                placeholder="https://checkout.stripe.com/pay/..."
                className="skeuo-inset-sm"
                style={{ padding: '10px', border: '1px solid rgba(255,255,255,0.4)', outline: 'none', fontFamily: 'var(--font-sans)', fontSize: '14px' }}
              />
              <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Customers can click this link to pay.</span>
            </div>
          </div>
        </div>

        {/* Form Action */}
        <div style={{ borderTop: '1px dashed rgba(0,0,0,0.1)', paddingTop: '20px', display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
          <button
            id="admin-save-settings-btn"
            type="submit"
            className="tactile-button tactile-button-gold"
            disabled={isSaving}
            style={{ padding: '12px 28px', fontSize: '14px', gap: '8px' }}
          >
            {isSaving ? (
              <>
                <RefreshCw size={16} style={{ animation: 'spin 1s linear/infinite' }} />
                <span>Saving Settings...</span>
              </>
            ) : (
              <>
                <Save size={16} />
                <span>Save Settings</span>
              </>
            )}
          </button>
        </div>
      </form>
      
      {showSuccess && (
        <div style={{
          marginTop: '16px',
          padding: '12px',
          backgroundColor: '#ebfdf5',
          border: '1px solid #a7f3d0',
          borderRadius: '8px',
          fontSize: '13px',
          color: '#065f46',
          fontWeight: 600,
          textAlign: 'center'
        }}>
          Settings Saved successfully. Payment details will reflect on customer checkouts immediately.
        </div>
      )}
    </div>
  );
}
