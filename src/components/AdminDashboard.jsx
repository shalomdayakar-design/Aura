import React, { useState, useEffect } from 'react';
import { Lock, Unlock, TrendingUp, Package, ShoppingCart, LogOut, Settings, Key, User, ShieldCheck, Smartphone, Sparkles, KeyRound, Mail, AlertTriangle } from 'lucide-react';
import { db } from '../services/db';
import AdminOverview from './AdminOverview';
import AdminProducts from './AdminProducts';
import AdminOrders from './AdminOrders';
import AdminSettings from './AdminSettings';

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [settings, setSettings] = useState({});
  const [gateTab, setGateTab] = useState('login'); // 'login' | 'register'
  
  // Login Form States
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // overview, products, orders, settings

  // Register Form States
  const [setupStep, setSetupStep] = useState(1); // 1: Credentials, 2: Mobile OTP verification, 3: Payments Setup
  const [setupUsername, setSetupUsername] = useState('');
  const [setupPassword, setSetupPassword] = useState('');
  const [setupPhone, setSetupPhone] = useState('');
  const [setupEmail, setSetupEmail] = useState('');
  const [usernameTakenError, setUsernameTakenError] = useState(false);
  
  // Register OTP States
  const [otpSent, setOtpSent] = useState(false);
  const [simulatedOtp, setSimulatedOtp] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [otpError, setOtpError] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);

  // Register Payments States
  const [setupUpi, setSetupUpi] = useState('');
  const [setupBank, setSetupBank] = useState('');
  const [setupLink, setSetupLink] = useState('');
  const [isSettingUp, setIsSettingUp] = useState(false);

  // Stats Database States
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({});

  const refreshData = () => {
    const s = db.getAdminSettings();
    setSettings(s);
    setProducts(db.getProducts());
    setOrders(db.getOrders());
    setStats(db.getStats());

    // Auto-select correct tab on first load if no users exist
    const users = db.getAdminUsers();
    if (users.length === 0) {
      setGateTab('register');
    }
  };

  useEffect(() => {
    refreshData();
  }, [isAuthenticated]);

  const [notifications, setNotifications] = useState([]);

  const triggerNotification = (order) => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      
      // First Tone (Ding - C5)
      const osc1 = audioCtx.createOscillator();
      const gain1 = audioCtx.createGain();
      osc1.connect(gain1);
      gain1.connect(audioCtx.destination);
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(523.25, audioCtx.currentTime); 
      gain1.gain.setValueAtTime(0.05, audioCtx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.50);
      osc1.start(audioCtx.currentTime);
      osc1.stop(audioCtx.currentTime + 0.50);
      
      // Second Tone (Dong - E5)
      const osc2 = audioCtx.createOscillator();
      const gain2 = audioCtx.createGain();
      osc2.connect(gain2);
      gain2.connect(audioCtx.destination);
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.15); 
      gain2.gain.setValueAtTime(0.05, audioCtx.currentTime + 0.15);
      gain2.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.65);
      osc2.start(audioCtx.currentTime + 0.15);
      osc2.stop(audioCtx.currentTime + 0.65);
    } catch (e) {
      console.warn("Audio Context sound blocked or not supported", e);
    }

    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification("AURA: New Order Received!", {
        body: `Order ${order.id} (₹${order.total.toFixed(2)}) by ${order.customer.name}`,
        icon: '/aura_logo.png'
      });
    }

    setNotifications(prev => [
      ...prev,
      {
        id: order.id,
        title: "New Order Received!",
        message: `Order ${order.id} (₹${order.total.toFixed(2)}) from ${order.customer.name}`,
        order: order
      }
    ]);
  };

  useEffect(() => {
    if (isAuthenticated) {
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;

    let lastCount = db.getOrders().length;

    const interval = setInterval(() => {
      const currentOrders = db.getOrders();
      if (currentOrders.length > lastCount) {
        const newOrders = currentOrders.slice(lastCount);
        newOrders.forEach(order => triggerNotification(order));
        lastCount = currentOrders.length;
        refreshData();
      } else if (currentOrders.length < lastCount) {
        lastCount = currentOrders.length;
      }
    }, 3000);

    const handleStorageChange = (e) => {
      if (e.key === 'aura_orders') {
        const currentOrders = db.getOrders();
        if (currentOrders.length > lastCount) {
          const newOrders = currentOrders.slice(lastCount);
          newOrders.forEach(order => triggerNotification(order));
          lastCount = currentOrders.length;
          refreshData();
        } else {
          lastCount = currentOrders.length;
          refreshData();
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [isAuthenticated]);

  // Credentials login check using database list
  const handleCredentialsLogin = (e) => {
    e.preventDefault();
    const success = db.verifyAdminCredentials(usernameInput, passwordInput);
    if (success) {
      setIsAuthenticated(true);
      setLoginError(false);
    } else {
      setLoginError(true);
      setPasswordInput('');
      setTimeout(() => setLoginError(false), 2500);
    }
  };

  // Trigger Send OTP for Admin registration
  const handleSendSetupOtp = async () => {
    if (setupUsername.trim() === '' || setupPhone.length < 10) return;
    
    // Validate username uniqueness
    if (db.checkUsernameTaken(setupUsername)) {
      setUsernameTakenError(true);
      return;
    }
    
    setUsernameTakenError(false);
    setIsSendingOtp(true);
    setOtpError(false);

    try {
      const response = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: setupPhone })
      });

      const data = await response.json();
      setIsSendingOtp(false);

      if (response.ok && data.success) {
        setOtpSent(true);
        alert(`[AURA SECURE SYSTEM]\nVerification code delivered to +91 ${setupPhone}.`);
      } else {
        const code = Math.floor(1000 + Math.random() * 9000).toString();
        setSimulatedOtp(code);
        setOtpSent(true);
        alert(`[AURA SECURE SYSTEM - SIMULATOR]\nTwilio keys not configured. Local verification bypass active.\nOTP code sent to +91 ${setupPhone}:\nCode: ${code}`);
      }
      setSetupStep(2);
    } catch (err) {
      console.error('Send OTP Error:', err);
      const code = Math.floor(1000 + Math.random() * 9000).toString();
      setSimulatedOtp(code);
      setOtpSent(true);
      setIsSendingOtp(false);
      alert(`[AURA SECURE SYSTEM - SIMULATOR]\nConnection error. Local verification bypass active.\nOTP code: ${code}`);
      setSetupStep(2);
    }
  };

  // Verify OTP for Admin registration
  const handleVerifySetupOtp = async (e) => {
    e.preventDefault();
    setIsVerifyingOtp(true);
    setOtpError(false);

    try {
      if (simulatedOtp) {
        setTimeout(() => {
          setIsVerifyingOtp(false);
          if (otpInput === simulatedOtp) {
            setSetupStep(3);
          } else {
            setOtpError(true);
            setOtpInput('');
          }
        }, 1000);
        return;
      }

      const response = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: setupPhone, code: otpInput })
      });

      const data = await response.json();
      setIsVerifyingOtp(false);

      if (response.ok && data.success) {
        setSetupStep(3);
      } else {
        setOtpError(true);
        setOtpInput('');
      }
    } catch (err) {
      console.error('Verify OTP Error:', err);
      setOtpError(true);
      setOtpInput('');
      setIsVerifyingOtp(false);
    }
  };

  // Complete registry and login
  const handleCompleteSetup = (e) => {
    e.preventDefault();
    setIsSettingUp(true);

    setTimeout(() => {
      const config = {
        hasConfigured: true,
        username: setupUsername,
        password: setupPassword,
        mobileNumber: setupPhone,
        supportEmail: setupEmail || 'support@auracuration.com',
        upiId: setupUpi,
        bankDetails: setupBank,
        paymentLink: setupLink,
        googleAccount: null
      };

      db.saveAdminSettings(config);
      setIsSettingUp(false);
      setIsAuthenticated(true);
      refreshData();
      
      // Reset registration form
      setSetupStep(1);
      setSetupUsername('');
      setSetupPassword('');
      setSetupPhone('');
      setSetupEmail('');
      setSetupUpi('');
      setSetupBank('');
      setSetupLink('');
    }, 1500);
  };

  return (
    <div className="container" style={{ padding: '32px 24px', flexGrow: 1 }}>
      {!isAuthenticated ? (
        /* Safe Setup/Authentication gate with Liquid Glass theme */
        <div className="liquid-glass-viewport" style={{ width: '100%', position: 'relative' }}>
          {/* Floating Liquid Blobs */}
          <div className="liquid-blob liquid-blob-gold"></div>
          <div className="liquid-blob liquid-blob-teal"></div>
          <div className="liquid-blob liquid-blob-pink"></div>
          
          <div 
            className="liquid-glass-card" 
            style={{
              width: '100%',
              maxWidth: '430px',
              padding: '32px 24px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px'
            }}
          >
            {/* LEDs header */}
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', justifyContent: 'center' }}>
              <div className={`led-indicator ${loginError || usernameTakenError ? 'red' : 'off'}`}></div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Lock size={20} style={{ color: 'var(--accent-gold)', marginBottom: '2px' }} />
                <span style={{ fontSize: '11px', fontWeight: 850, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#9cb0cc' }}>
                  ADMIN LOGIN
                </span>
              </div>
              <div className={`led-indicator yellow`}></div>
            </div>

            {/* Toggle Tabs */}
            <div style={{ display: 'flex', gap: '8px', background: 'rgba(255,255,255,0.05)', padding: '6px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <button
                id="admin-tab-login"
                type="button"
                onClick={() => setGateTab('login')}
                className={`tactile-button ${gateTab === 'login' ? 'active liquid-glass-tab-active' : ''}`}
                style={{
                  flexGrow: 1, padding: '10px', fontSize: '13px',
                  backgroundColor: gateTab === 'login' ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                  color: '#ffffff', border: 'none', borderRadius: '6px',
                  boxShadow: 'none'
                }}
              >
                Admin Login
              </button>
              <button
                id="admin-tab-register"
                type="button"
                onClick={() => setGateTab('register')}
                className={`tactile-button ${gateTab === 'register' ? 'active liquid-glass-tab-active' : ''}`}
                style={{
                  flexGrow: 1, padding: '10px', fontSize: '13px',
                  backgroundColor: gateTab === 'register' ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                  color: '#ffffff', border: 'none', borderRadius: '6px',
                  boxShadow: 'none'
                }}
              >
                Register Admin
              </button>
            </div>

            {gateTab === 'register' ? (
              /* Register Tab Panel */
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px', justifyContent: 'center' }}>
                  <span className="lcd-screen" style={{ padding: '2px 8px', fontSize: '11px', color: '#39ff14', backgroundColor: '#0a0f1d' }}>
                    STEP 0{setupStep}
                  </span>
                </div>

                {setupStep === 1 && (
                  <form id="register-step1-form" onSubmit={(e) => { e.preventDefault(); handleSendSetupOtp(); }} style={{ display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'left' }}>
                    
                    {usernameTakenError && (
                      <div className="skeuo-inset-sm" style={{ display: 'flex', gap: '8px', alignItems: 'center', padding: '10px', backgroundColor: 'rgba(231,76,60,0.1)', color: 'var(--accent-red)', fontSize: '12px', fontWeight: 'bold' }}>
                        <AlertTriangle size={16} />
                        <span>Username already taken!</span>
                      </div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '10px', color: '#9cb0cc', fontWeight: 800 }}>CHOOSE USERNAME</label>
                      <div className="liquid-glass-input" style={{ display: 'flex', alignItems: 'center', padding: '10px', gap: '8px' }}>
                        <User size={14} style={{ color: '#9cb0cc' }} />
                        <input
                          id="reg-username"
                          type="text"
                          required
                          value={setupUsername}
                          onChange={(e) => {
                            setSetupUsername(e.target.value);
                            setUsernameTakenError(false);
                          }}
                          placeholder="Choose unique username"
                          style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', color: '#fff', fontSize: '14px' }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '10px', color: '#9cb0cc', fontWeight: 800 }}>CHOOSE PASSWORD</label>
                      <div className="liquid-glass-input" style={{ display: 'flex', alignItems: 'center', padding: '10px', gap: '8px' }}>
                        <KeyRound size={14} style={{ color: '#9cb0cc' }} />
                        <input
                          id="reg-password"
                          type="password"
                          required
                          value={setupPassword}
                          onChange={(e) => setSetupPassword(e.target.value)}
                          placeholder="Choose password"
                          style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', color: '#fff', fontSize: '14px' }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '10px', color: '#9cb0cc', fontWeight: 800 }}>MOBILE NUMBER</label>
                      <div className="liquid-glass-input" style={{ display: 'flex', alignItems: 'center', padding: '10px', gap: '8px' }}>
                        <Smartphone size={14} style={{ color: '#9cb0cc' }} />
                        <input
                          id="reg-phone"
                          type="tel"
                          required
                          value={setupPhone}
                          onChange={(e) => setSetupPhone(e.target.value.replace(/\D/g, '').substring(0, 10))}
                          placeholder="9876543210"
                          style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', color: '#fff', fontSize: '14px', fontFamily: 'var(--font-mono)' }}
                        />
                      </div>
                    </div>

                    <button
                      id="reg-submit-btn"
                      type="submit"
                      className="tactile-button tactile-button-gold"
                      style={{ padding: '12px', fontSize: '14px', width: '100%', marginTop: '10px' }}
                      disabled={setupUsername.trim() === '' || setupPhone.length < 10 || isSendingOtp}
                    >
                      {isSendingOtp ? 'Sending code...' : 'Send OTP Code'}
                    </button>
                  </form>
                )}

                {setupStep === 2 && (
                  <form id="register-step2-form" onSubmit={handleVerifySetupOtp} style={{ display: 'flex', flexDirection: 'column', gap: '14px', textAlign: 'left' }}>
                    <p style={{ fontSize: '12px', color: '#9cb0cc', lineHeight: '1.4' }}>
                      Enter code sent to: **+91 {setupPhone}**
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '10px', color: '#9cb0cc', fontWeight: 800 }}>ENTER OTP CODE</label>
                      <input
                        id="reg-otp-input"
                        type="text"
                        required
                        value={otpInput}
                        onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, '').substring(0, 4))}
                        placeholder="••••"
                        className="liquid-glass-input"
                        style={{
                          padding: '12px',
                          outline: 'none', fontSize: '16px', letterSpacing: '10px', textAlign: 'center', fontFamily: 'var(--font-mono)'
                        }}
                      />
                      {otpError && (
                        <span style={{ fontSize: '11px', color: 'var(--accent-red)', fontWeight: 700, marginTop: '4px' }}>
                          ✕ Invalid code. Check the simulator pop-up.
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                      <button type="button" onClick={() => setSetupStep(1)} className="tactile-button" style={{ flexGrow: 1, padding: '10px' }}>
                        Back
                      </button>
                      <button
                        id="reg-verify-otp"
                        type="submit"
                        className="tactile-button tactile-button-gold"
                        style={{ flexGrow: 2, padding: '10px' }}
                        disabled={otpInput.length < 4 || isVerifyingOtp}
                      >
                        {isVerifyingOtp ? 'Verifying...' : 'Verify & Continue'}
                      </button>
                    </div>
                  </form>
                )}

                {setupStep === 3 && (
                  <form id="register-step3-form" onSubmit={handleCompleteSetup} style={{ display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'left' }}>
                    <div className="skeuo-inset-sm" style={{ padding: '8px 12px', backgroundColor: '#242c3d', color: '#ffd043', fontSize: '11px', fontWeight: 'bold' }}>
                      ✓ Mobile Verified: +91 {setupPhone}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '10px', color: '#9cb0cc', fontWeight: 800 }}>CUSTOMER SUPPORT EMAIL</label>
                      <div className="liquid-glass-input" style={{ display: 'flex', alignItems: 'center', padding: '10px', gap: '8px' }}>
                        <Mail size={14} style={{ color: '#9cb0cc' }} />
                        <input
                          id="reg-support-email"
                          type="email"
                          required
                          value={setupEmail}
                          onChange={(e) => setSetupEmail(e.target.value)}
                          placeholder="admin@yourbusiness.com"
                          style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', color: '#fff', fontSize: '14px' }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '10px', color: '#9cb0cc', fontWeight: 800 }}>UPI ID (FOR PAYMENTS)</label>
                      <input
                        id="reg-payment-upi"
                        type="text"
                        value={setupUpi}
                        onChange={(e) => setSetupUpi(e.target.value)}
                        placeholder="e.g. boss@ybl"
                        className="liquid-glass-input"
                        style={{ padding: '10px', outline: 'none', fontSize: '14px', fontFamily: 'var(--font-mono)' }}
                      />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '10px', color: '#9cb0cc', fontWeight: 800 }}>BANK ACCOUNT DETAILS</label>
                      <textarea
                        id="reg-payment-bank"
                        rows={2}
                        value={setupBank}
                        onChange={(e) => setSetupBank(e.target.value)}
                        placeholder="Bank details"
                        className="liquid-glass-input"
                        style={{ padding: '10px', outline: 'none', fontSize: '13px', resize: 'vertical' }}
                      />
                    </div>

                    <button
                      id="reg-finish-btn"
                      type="submit"
                      className="tactile-button tactile-button-gold"
                      style={{ padding: '12px', fontSize: '14px', width: '100%', marginTop: '10px', gap: '6px' }}
                      disabled={isSettingUp}
                    >
                      <Sparkles size={14} />
                      <span>{isSettingUp ? 'Saving Admin Profile...' : 'Complete Setup & Open Store'}</span>
                    </button>
                  </form>
                )}
              </div>
            ) : (
              /* Login Tab Panel */
              <form id="admin-login-form" onSubmit={handleCredentialsLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
                
                {db.getAdminUsers().length === 0 && (
                  <div style={{
                    padding: '12px', backgroundColor: 'rgba(241,196,15,0.15)', border: '1px solid var(--accent-gold)',
                    color: 'var(--accent-gold-dark)', borderRadius: '6px', fontSize: '12px', textAlign: 'center', fontWeight: 700, lineHeight: '1.4'
                  }}>
                    NOTICE: No credentials registered yet. Click "Register Admin" tab to create your admin profile.
                  </div>
                )}

                {loginError && (
                  <div style={{
                    padding: '10px', backgroundColor: 'rgba(231,76,60,0.15)', border: '1px solid var(--accent-red)',
                    color: 'var(--accent-red)', borderRadius: '6px', fontSize: '12px', textAlign: 'center', fontWeight: 600
                  }}>
                    INCORRECT USERNAME OR PASSWORD
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '10px', color: '#9cb0cc', fontWeight: 800 }}>USERNAME</label>
                  <div className="liquid-glass-input" style={{ display: 'flex', alignItems: 'center', padding: '10px', gap: '8px' }}>
                    <User size={16} style={{ color: '#9cb0cc' }} />
                    <input
                      id="login-username"
                      type="text"
                      required
                      value={usernameInput}
                      onChange={(e) => setUsernameInput(e.target.value)}
                      placeholder="Enter Username"
                      disabled={db.getAdminUsers().length === 0}
                      style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', color: '#fff', fontSize: '14px' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '10px', color: '#9cb0cc', fontWeight: 800 }}>PASSWORD</label>
                  <div className="liquid-glass-input" style={{ display: 'flex', alignItems: 'center', padding: '10px', gap: '8px' }}>
                    <Key size={16} style={{ color: '#9cb0cc' }} />
                    <input
                      id="login-password"
                      type="password"
                      required
                      value={passwordInput}
                      disabled={db.getAdminUsers().length === 0}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      placeholder="••••••••"
                      style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', color: '#fff', fontSize: '14px' }}
                    />
                  </div>
                </div>

                <button
                  id="admin-login-submit"
                  type="submit"
                  className="tactile-button tactile-button-gold"
                  disabled={db.getAdminUsers().length === 0}
                  style={{ padding: '12px', fontSize: '14px', width: '100%', marginTop: '10px' }}
                >
                  Login
                </button>
              </form>
            )}
          </div>
        </div>
      ) : (
        /* Authenticated Main dashboard views - Skeuomorphic Theme */
        <div>
          {/* Console Header */}
          <section 
            className="metal-brushed stitch-border-light" 
            style={{
              padding: '20px 24px', borderRadius: 'var(--border-radius-md)', marginBottom: '32px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', textAlign: 'left' }}>
              <div className="led-indicator green" style={{ width: '16px', height: '16px', boxShadow: '0 0 10px var(--accent-green)' }}></div>
              <div>
                <h1 style={{
                  fontFamily: 'var(--font-mono)', fontSize: '20px', fontWeight: 700, color: 'white', margin: 0,
                  textTransform: 'uppercase', letterSpacing: '1px'
                }}>
                  ADMIN DASHBOARD
                </h1>
                <p style={{ fontSize: '11px', color: '#9cb0cc', margin: 0 }}>
                  LOGGED IN AS: {settings.username.toUpperCase()} (MOBILE: +91 {settings.mobileNumber}) // EMAIL: {settings.supportEmail}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {[
                { id: 'overview', label: 'Overview', icon: <TrendingUp size={14} /> },
                { id: 'products', label: 'Products', icon: <Package size={14} /> },
                { id: 'orders', label: 'Orders', icon: <ShoppingCart size={14} /> },
                { id: 'settings', label: 'Settings', icon: <Settings size={14} /> }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="tactile-button"
                  style={{
                    padding: '8px 16px', fontSize: '13px', borderRadius: '8px',
                    backgroundColor: activeTab === tab.id ? '#ffffff' : '#242c3d',
                    color: activeTab === tab.id ? 'var(--text-primary)' : '#c8d3e6', border: '1px solid #323d54',
                    boxShadow: activeTab === tab.id ? 'inset 2px 2px 4px rgba(0,0,0,0.1)' : '2px 2px 4px rgba(0,0,0,0.4)', fontWeight: 700
                  }}
                >
                  {tab.icon}
                  <span style={{ marginLeft: '6px' }}>{tab.label}</span>
                </button>
              ))}

              <button
                onClick={() => setIsAuthenticated(false)}
                className="tactile-button"
                style={{ padding: '8px 12px', backgroundColor: '#3a1e1e', color: '#e74c3c', border: '1px solid #5a3131', boxShadow: '2px 2px 4px rgba(0,0,0,0.4)' }}
                title="Logout"
              >
                <LogOut size={14} />
              </button>
            </div>
          </section>

          {activeTab === 'overview' && <AdminOverview stats={stats} />}
          {activeTab === 'products' && <AdminProducts products={products} onRefresh={refreshData} />}
          {activeTab === 'orders' && <AdminOrders orders={orders} onRefresh={refreshData} />}
          {activeTab === 'settings' && <AdminSettings settings={settings} onRefresh={refreshData} />}
        </div>
      )}

      {/* Floating Notifications UI */}
      {isAuthenticated && notifications.length > 0 && (
        <div style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          zIndex: 1200,
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          maxWidth: '320px',
          width: '100%'
        }}>
          {notifications.map(notif => (
            <div 
              key={notif.id}
              className="skeuo-outset" 
              style={{
                padding: '16px',
                backgroundColor: '#fff7e6',
                border: '2px solid var(--accent-gold)',
                boxShadow: '0 10px 20px rgba(0,0,0,0.15)',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                position: 'relative',
                animation: 'fadeSlideIn 0.3s cubic-bezier(0.25, 1, 0.5, 1) forwards',
                textAlign: 'left'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div className="led-indicator yellow" style={{ animation: 'blink 1s infinite' }}></div>
                <strong style={{ fontSize: '12px', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {notif.title}
                </strong>
                <button 
                  onClick={() => setNotifications(prev => prev.filter(n => n.id !== notif.id))}
                  style={{
                    position: 'absolute', top: '12px', right: '12px', background: 'none', border: 'none',
                    cursor: 'pointer', fontWeight: 'bold', color: 'var(--text-secondary)'
                  }}
                >
                  ✕
                </button>
              </div>
              <p style={{ fontSize: '13px', margin: 0, color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                {notif.message}
              </p>
              <button
                onClick={() => {
                  setNotifications(prev => prev.filter(n => n.id !== notif.id));
                  setActiveTab('orders');
                }}
                className="tactile-button tactile-button-gold"
                style={{ padding: '6px 12px', fontSize: '11px', alignSelf: 'flex-start', marginTop: '4px' }}
              >
                View Orders
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
