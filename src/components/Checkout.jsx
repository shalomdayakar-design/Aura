import React, { useState, useEffect } from 'react';
import { ShieldCheck, Calendar, User, CreditCard, ChevronRight, ChevronLeft, Printer, RefreshCw, Smartphone, Check, QrCode, ExternalLink } from 'lucide-react';
import { db } from '../services/db';

export default function Checkout({ cartItems, onPlaceOrder, onCancel }) {
  const [step, setStep] = useState(1); // 1: Shipping, 2: Phone Verification, 3: Payment, 4: Success
  const [adminSettings, setAdminSettings] = useState({});
  
  // Shipping info
  const [shippingInfo, setShippingInfo] = useState({
    name: '',
    email: '',
    address: '',
    city: '',
    zip: ''
  });
  
  // Mobile Verification State
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [simulatedOtp, setSimulatedOtp] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [otpError, setOtpError] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [userPhoneSession, setUserPhoneSession] = useState('');

  // Payment Form States
  const [cardInfo, setCardInfo] = useState({ number: '', name: '', expiry: '', cvv: '' });
  const [transactionId, setTransactionId] = useState('');
  const [isFlipped, setIsFlipped] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shippingSpeed, setShippingSpeed] = useState('Standard');
  const [paymentType, setPaymentType] = useState('Online'); // 'Online' | 'COD'
  const [paymentScreenshot, setPaymentScreenshot] = useState('');
  
  // Geolocation lookup states
  const [isLocating, setIsLocating] = useState(false);
  const [locationStatus, setLocationStatus] = useState('');

  // Leaflet Map Refs
  const mapRef = React.useRef(null);
  const markerRef = React.useRef(null);

  const updateMapMarker = (lat, lng) => {
    if (mapRef.current && markerRef.current && window.L) {
      const latlng = window.L.latLng(lat, lng);
      markerRef.current.setLatLng(latlng);
      mapRef.current.setView(latlng, 15);
    }
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert('Your phone/browser does not support geolocation.');
      return;
    }

    setIsLocating(true);
    setLocationStatus('Getting your location coordinates...');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        let latitude = position.coords.latitude;
        let longitude = position.coords.longitude;
        
        const inIndia = (latitude >= 8 && latitude <= 38) && (longitude >= 68 && longitude <= 98);
        if (!inIndia) {
          latitude = 18.9218;
          longitude = 72.8330;
        }
        
        setLocationStatus('Finding address from location...');
        
        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`);
          const data = await response.json();
          setIsLocating(false);
          setLocationStatus('');

          if (data && data.address) {
            const addr = data.address;
            const house = addr.house_number || '';
            const road = addr.road || addr.suburb || '';
            const streetAddress = [house, road].filter(Boolean).join(' ') || data.display_name.split(',')[0] || 'Detected Location';
            
            const city = addr.city || addr.town || addr.village || addr.county || '';
            const zip = addr.postcode || '';

            setShippingInfo(prev => ({
              ...prev,
              address: streetAddress,
              city: city,
              zip: zip
            }));
            updateMapMarker(latitude, longitude);
          } else {
            alert('Could not find address details for this location.');
          }
        } catch (err) {
          console.error(err);
          setIsLocating(false);
          setLocationStatus('');
          alert('Error loading address.');
        }
      },
      (err) => {
        console.error(err);
        setIsLocating(false);
        setLocationStatus('');
        alert(`Could not read location: ${err.message}`);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Initialize Leaflet Map
  useEffect(() => {
    if (step === 1 && window.L) {
      const timer = setTimeout(() => {
        const defaultLat = 18.9218; // Taj Mahal Palace, Mumbai
        const defaultLng = 72.8330;

        if (mapRef.current) {
          mapRef.current.remove();
          mapRef.current = null;
        }

        const mapInstance = window.L.map('checkout-address-map').setView([defaultLat, defaultLng], 14);
        mapRef.current = mapInstance;

        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(mapInstance);

        const marker = window.L.marker([defaultLat, defaultLng], { draggable: true }).addTo(mapInstance);
        markerRef.current = marker;

        const geocodeLatLng = async (lat, lng) => {
          setLocationStatus('Loading address from map pointer...');
          try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
            const data = await response.json();
            setLocationStatus('');
            if (data && data.address) {
              const addr = data.address;
              const house = addr.house_number || '';
              const road = addr.road || addr.suburb || '';
              const streetAddress = [house, road].filter(Boolean).join(' ') || data.display_name.split(',')[0] || 'Selected Location';
              const city = addr.city || addr.town || addr.village || addr.county || '';
              const zip = addr.postcode || '';

              setShippingInfo(prev => ({
                ...prev,
                address: streetAddress,
                city: city,
                zip: zip
              }));
            }
          } catch (e) {
            console.error(e);
            setLocationStatus('');
          }
        };

        marker.on('dragend', () => {
          const position = marker.getLatLng();
          geocodeLatLng(position.lat, position.lng);
        });

        mapInstance.on('click', (e) => {
          marker.setLatLng(e.latlng);
          geocodeLatLng(e.latlng.lat, e.latlng.lng);
        });
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [step]);

  // Load Admin Settings & Session
  useEffect(() => {
    setAdminSettings(db.getAdminSettings());
    const savedSession = sessionStorage.getItem('user_phone_session');
    if (savedSession) {
      setUserPhoneSession(savedSession);
    }
  }, []);

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.08;
  const shippingCost = subtotal >= 1000 ? 0.00 : (adminSettings.deliveryFee !== undefined ? parseFloat(adminSettings.deliveryFee) : 50.00);
  const total = subtotal + tax + shippingCost;

  // Format inputs
  const handleCardNumberChange = (e) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 16) val = val.substring(0, 16);
    let formatted = val.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardInfo({ ...cardInfo, number: formatted });
  };

  const handleExpiryChange = (e) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 4) val = val.substring(0, 4);
    if (val.length > 2) {
      val = val.substring(0, 2) + '/' + val.substring(2);
    }
    setCardInfo({ ...cardInfo, expiry: val });
  };

  // Simulated OTP sender
  const handleSendOtp = () => {
    if (phoneNumber.length < 10) return;
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setSimulatedOtp(code);
    setOtpSent(true);
    setOtpError(false);
    
    // Alert the user in a beautiful alert window simulation
    alert(`[AURA SECURE SYSTEM]\nOTP sent to +91 ${phoneNumber}.\nOTP Code: ${code}`);
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    setIsVerifyingOtp(true);
    
    setTimeout(() => {
      if (otpInput === simulatedOtp) {
        setUserPhoneSession(phoneNumber);
        sessionStorage.setItem('user_phone_session', phoneNumber);
        setIsVerifyingOtp(false);
        setStep(3); // Proceed to payment page
      } else {
        setOtpError(true);
        setOtpInput('');
        setIsVerifyingOtp(false);
      }
    }, 1000);
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    if (step === 1) {
      if (userPhoneSession) {
        setStep(3); // Already verified phone number, jump directly to payment
      } else {
        setStep(2); // Verify phone number
      }
    }
  };

  const handlePaymentSubmit = (e) => {
    e.preventDefault();

    if (paymentType === 'Online' && !paymentScreenshot) {
      alert("Please upload a payment verification screenshot before completing your online order.");
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const orderRecord = {
        customer: {
          name: shippingInfo.name,
          email: shippingInfo.email,
          address: `${shippingInfo.address}, ${shippingInfo.city}, ${shippingInfo.zip}`,
          phone: userPhoneSession,
          cardName: paymentType === 'COD' ? 'Cash on Delivery' : (cardInfo.name || shippingInfo.name),
          transactionId: paymentType === 'COD' ? 'COD-' + Date.now().toString().slice(-6) : (transactionId || 'SIM-' + Date.now().toString().slice(-6)),
          paymentScreenshot: paymentType === 'Online' ? paymentScreenshot : null
        },
        items: cartItems,
        shippingSpeed,
        shippingCost,
        total,
        paymentMethod: paymentType === 'COD' ? 'COD' : ((adminSettings.upiId || adminSettings.paymentLink || adminSettings.bankDetails) ? 'Custom Online' : 'Card Online')
      };
      
      const createdOrder = onPlaceOrder(orderRecord);
      setPlacedOrder(createdOrder);
      setIsSubmitting(false);
      setStep(4);
    }, 2000);
  };

  // Render payment methods dynamically based on Admin configuration
  const renderPaymentOptions = () => {
    const hasUpi = !!adminSettings.upiId;
    const hasBank = !!adminSettings.bankDetails;
    const hasLink = !!adminSettings.paymentLink;

    if (hasUpi || hasBank || hasLink) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Custom QR / Invoice layout */}
          {hasUpi && (
            <div className="skeuo-inset-sm" style={{ padding: '16px', backgroundColor: '#e6edf7', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', textAlign: 'center' }}>
              <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-secondary)' }}>SCAN WITH ANY UPI APP TO PAY</span>
              
              {/* Draw a gorgeous mock QR Code using SVG */}
              <div className="skeuo-outset-sm" style={{ padding: '10px', backgroundColor: '#fff', width: '130px', height: '130px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="110" height="110" viewBox="0 0 100 100" style={{ shapeRendering: 'crispEdges' }}>
                  {/* Outer position detection corners */}
                  <rect x="0" y="0" width="30" height="30" fill="#1e2530" />
                  <rect x="5" y="5" width="20" height="20" fill="#fff" />
                  <rect x="10" y="10" width="10" height="10" fill="#1e2530" />

                  <rect x="70" y="0" width="30" height="30" fill="#1e2530" />
                  <rect x="75" y="5" width="20" height="20" fill="#fff" />
                  <rect x="80" y="10" width="10" height="10" fill="#1e2530" />

                  <rect x="0" y="70" width="30" height="30" fill="#1e2530" />
                  <rect x="5" y="75" width="20" height="20" fill="#fff" />
                  <rect x="10" y="80" width="10" height="10" fill="#1e2530" />

                  {/* Simulated QR bits grid pattern */}
                  <rect x="40" y="5" width="10" height="10" fill="#1e2530" />
                  <rect x="50" y="15" width="10" height="10" fill="#1e2530" />
                  <rect x="45" y="25" width="10" height="10" fill="#1e2530" />
                  <rect x="60" y="10" width="10" height="10" fill="#1e2530" />
                  
                  <rect x="40" y="40" width="20" height="20" fill="#1e2530" />
                  <rect x="45" y="45" width="10" height="10" fill="#fff" />
                  
                  <rect x="15" y="40" width="10" height="15" fill="#1e2530" />
                  <rect x="5" y="50" width="15" height="10" fill="#1e2530" />
                  <rect x="80" y="40" width="15" height="15" fill="#1e2530" />
                  <rect x="70" y="50" width="10" height="10" fill="#1e2530" />

                  <rect x="40" y="70" width="15" height="10" fill="#1e2530" />
                  <rect x="55" y="80" width="15" height="15" fill="#1e2530" />
                  <rect x="45" y="85" width="15" height="10" fill="#1e2530" />
                  <rect x="80" y="75" width="10" height="15" fill="#1e2530" />
                </svg>
              </div>

              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)' }}>
                UPI ID: <span style={{ color: 'var(--accent-gold-dark)' }}>{adminSettings.upiId}</span>
              </div>
            </div>
          )}

          {hasBank && (
            <div className="skeuo-inset-sm" style={{ padding: '16px', backgroundColor: '#e6edf7', textAlign: 'left' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>BANK WIRE DETAILS</span>
              <pre style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '13px',
                fontWeight: 700,
                color: 'var(--text-primary)',
                whiteSpace: 'pre-wrap',
                margin: 0,
                lineHeight: '1.4'
              }}>
                {adminSettings.bankDetails}
              </pre>
            </div>
          )}

          {hasLink && (
            <a 
              href={adminSettings.paymentLink} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="tactile-button tactile-button-gold"
              style={{
                width: '100%',
                padding: '14px',
                fontSize: '14px',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <ExternalLink size={16} />
              <span>Launch Custom Gateway Link</span>
            </a>
          )}

          {/* Reference transaction code receipt */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left', marginTop: '10px' }}>
            <label style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-secondary)' }}>ENTER UPI TRANSACTION ID / REF NO.</label>
            <input
              id="pay-transaction-id"
              type="text"
              required
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              placeholder="e.g. 12-digit Ref No."
              className="skeuo-inset-sm"
              style={{ padding: '12px', border: '1px solid rgba(255,255,255,0.4)', outline: 'none', fontFamily: 'var(--font-mono)', fontSize: '14px' }}
            />
            <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Once payment is done, enter the UPI Ref No. or Transaction ID here to confirm.</span>
          </div>
        </div>
      );
    }

    /* Fallback standard Credit Card Simulator */
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {/* Card Component */}
        <div className="card-container" style={{ perspective: '1000px', width: '100%', height: '180px' }}>
          <div className="card-inner" style={{
            position: 'relative', width: '100%', height: '100%', transformStyle: 'preserve-3d',
            transition: 'transform 0.6s', transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
          }}>
            {/* Front */}
            <div className="metal-brushed stitch-border-light" style={{
              position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden',
              borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', textAlign: 'left'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', fontWeight: 700 }}>A U R A</span>
                <div style={{ width: '35px', height: '25px', background: 'linear-gradient(135deg, #f1c40f, #f39c12)', borderRadius: '4px', border: '1px solid rgba(0,0,0,0.1)' }}></div>
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '18px', letterSpacing: '2px', textAlign: 'center', textShadow: '1px 2px 2px rgba(0,0,0,0.8)' }}>
                {cardInfo.number || '•••• •••• •••• ••••'}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                <div>
                  <span style={{ fontSize: '7px', color: '#9cb0cc', display: 'block' }}>CARDHOLDER</span>
                  <strong>{cardInfo.name.toUpperCase() || 'YOUR NAME'}</strong>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '7px', color: '#9cb0cc', display: 'block' }}>EXPIRES</span>
                  <strong style={{ fontFamily: 'var(--font-mono)' }}>{cardInfo.expiry || 'MM/YY'}</strong>
                </div>
              </div>
            </div>
            {/* Back */}
            <div className="metal-brushed stitch-border-light" style={{
              position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden',
              borderRadius: '12px', transform: 'rotateY(180deg)', padding: '20px 0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', textAlign: 'left'
            }}>
              <div style={{ width: '100%', height: '35px', backgroundColor: '#0a0d14' }}></div>
              <div style={{ padding: '0 20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ flexGrow: 1, height: '28px', backgroundColor: '#fff', borderRadius: '2px' }}></div>
                <div style={{ width: '45px', height: '28px', backgroundColor: '#eee', color: '#333', fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, borderRadius: '2px' }}>
                  {cardInfo.cvv || '•••'}
                </div>
              </div>
              <div style={{ padding: '0 20px', fontSize: '8px', color: '#9cb0cc', textAlign: 'center' }}>Secure simulated credit vault active.</div>
            </div>
          </div>
        </div>

        {/* Inputs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'left' }}>
          <label style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-secondary)' }}>CARDHOLDER NAME</label>
          <input
            id="pay-cardname"
            type="text"
            required
            value={cardInfo.name}
            onChange={(e) => setCardInfo({ ...cardInfo, name: e.target.value })}
            placeholder="Johnathan Doe"
            className="skeuo-inset-sm"
            style={{ padding: '10px', border: '1px solid rgba(255,255,255,0.4)', outline: 'none', fontSize: '13px' }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'left' }}>
          <label style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-secondary)' }}>CARD NUMBER</label>
          <input
            id="pay-cardnumber"
            type="text"
            required
            value={cardInfo.number}
            onChange={handleCardNumberChange}
            placeholder="4532 9840 2194 0029"
            className="skeuo-inset-sm"
            style={{ padding: '10px', border: '1px solid rgba(255,255,255,0.4)', outline: 'none', fontSize: '13px', fontFamily: 'var(--font-mono)' }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'left' }}>
            <label style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-secondary)' }}>EXPIRY</label>
            <input
              id="pay-cardexpiry"
              type="text"
              required
              value={cardInfo.expiry}
              onChange={handleExpiryChange}
              placeholder="MM/YY"
              className="skeuo-inset-sm"
              style={{ padding: '10px', border: '1px solid rgba(255,255,255,0.4)', outline: 'none', fontSize: '13px', fontFamily: 'var(--font-mono)' }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'left' }}>
            <label style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-secondary)' }}>CVV</label>
            <input
              id="pay-cardcvv"
              type="password"
              required
              value={cardInfo.cvv}
              onChange={(e) => setCardInfo({ ...cardInfo, cvv: e.target.value.replace(/\D/g, '').substring(0,3) })}
              onFocus={() => setIsFlipped(true)}
              onBlur={() => setIsFlipped(false)}
              placeholder="•••"
              className="skeuo-inset-sm"
              style={{ padding: '10px', border: '1px solid rgba(255,255,255,0.4)', outline: 'none', fontSize: '13px', fontFamily: 'var(--font-mono)' }}
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <main className="container" style={{ padding: '32px 24px', flexGrow: 1 }}>
      <div 
        className="skeuo-outset checkout-container" 
        style={{
          padding: '32px',
          backgroundColor: 'var(--bg-base)',
          display: 'grid',
          gridTemplateColumns: step === 4 ? '1fr' : 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '32px',
          maxWidth: step === 4 ? '600px' : '100%',
          margin: '0 auto'
        }}
      >
        {step < 4 ? (
          <>
            {/* Left Column: Checkout Steps */}
            <div>
              {/* Stepper Status Screen */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '28px' }}>
                <span className="lcd-screen" style={{ padding: '2px 8px', fontSize: '13px', color: '#39ff14', backgroundColor: '#0b131a', borderWidth: '1.5px' }}>
                  STEP 0{step}
                </span>
                <span style={{ fontSize: '15px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-primary)' }}>
                  {step === 1 ? 'Delivery Address' : step === 2 ? 'Verify Mobile Number (OTP)' : 'Select Payment Method'}
                </span>
              </div>

              {step === 1 && (
                /* Step 1: Shipping Form */
                <form id="checkout-step1-form" onSubmit={handleNextStep} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'left' }}>
                    <label style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-secondary)' }}>FULL NAME</label>
                    <input
                      id="ship-name"
                      type="text"
                      required
                      placeholder="Enter your full name"
                      value={shippingInfo.name}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, name: e.target.value })}
                      className="skeuo-inset-sm"
                      style={{ padding: '12px', border: '1px solid rgba(255,255,255,0.4)', outline: 'none', fontSize: '14px' }}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'left' }}>
                    <label style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-secondary)' }}>EMAIL ADDRESS</label>
                    <input
                      id="ship-email"
                      type="email"
                      required
                      placeholder="Enter your email address"
                      value={shippingInfo.email}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, email: e.target.value })}
                      className="skeuo-inset-sm"
                      style={{ padding: '12px', border: '1px solid rgba(255,255,255,0.4)', outline: 'none', fontSize: '14px' }}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'left' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                      <label style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-secondary)' }}>STREET ADDRESS</label>
                      <button
                        id="detect-location-btn"
                        type="button"
                        onClick={handleDetectLocation}
                        disabled={isLocating}
                        className="tactile-button"
                        style={{ padding: '4px 10px', fontSize: '10px', gap: '4px' }}
                      >
                        {isLocating ? (
                          <>
                            <RefreshCw size={10} style={{ animation: 'spin 1s linear/infinite' }} />
                            <span>Locating...</span>
                          </>
                        ) : (
                          <span>📍 Detect My Location</span>
                        )}
                      </button>
                    </div>
                    {locationStatus && (
                      <span style={{ fontSize: '10px', color: 'var(--accent-gold-dark)', fontWeight: 'bold', marginBottom: '4px' }}>
                        {locationStatus}
                      </span>
                    )}
                    <input
                      id="ship-address"
                      type="text"
                      required
                      placeholder="Enter street, area, house details"
                      value={shippingInfo.address}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, address: e.target.value })}
                      className="skeuo-inset-sm"
                      style={{ padding: '12px', border: '1px solid rgba(255,255,255,0.4)', outline: 'none', fontSize: '14px' }}
                    />
                    
                    {/* Interactive Map Selector */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '6px' }}>
                      <span style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: 700 }}>OR SELECT POSITION ON MAP:</span>
                      <div 
                        id="checkout-address-map" 
                        className="skeuo-inset-sm" 
                        style={{ height: '180px', width: '100%', zIndex: 10, borderRadius: 'var(--border-radius-sm)', overflow: 'hidden' }}
                      ></div>
                      <span style={{ fontSize: '9px', color: 'var(--text-secondary)' }}>Drag the pin or click on the map to set your address.</span>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'left' }}>
                      <label style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-secondary)' }}>CITY</label>
                      <input
                        id="ship-city"
                        type="text"
                        required
                        placeholder="Enter City"
                        value={shippingInfo.city}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, city: e.target.value })}
                        className="skeuo-inset-sm"
                        style={{ padding: '12px', border: '1px solid rgba(255,255,255,0.4)', outline: 'none', fontSize: '14px' }}
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'left' }}>
                      <label style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-secondary)' }}>PIN CODE</label>
                      <input
                        id="ship-zip"
                        type="text"
                        required
                        placeholder="Enter Pin Code"
                        value={shippingInfo.zip}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, zip: e.target.value })}
                        className="skeuo-inset-sm"
                        style={{ padding: '12px', border: '1px solid rgba(255,255,255,0.4)', outline: 'none', fontSize: '14px' }}
                      />
                    </div>
                  </div>

                  <div style={{ padding: '12px', backgroundColor: '#e6edf7', borderRadius: 'var(--border-radius-sm)', textAlign: 'left', marginTop: '8px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>DELIVERY FEE</span>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {subtotal >= 1000 ? "🎉 FREE DELIVERY (Orders above ₹1000 get free delivery!)" : `Delivery Charge: ₹${shippingCost.toFixed(2)} (Shop for ₹1000 or more to get Free Delivery!)`}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                    <button type="button" onClick={onCancel} className="tactile-button" style={{ padding: '12px 24px', fontSize: '14px' }}>
                      <ChevronLeft size={16} />
                      <span>Back to Cart</span>
                    </button>
                    <button type="submit" className="tactile-button tactile-button-gold" style={{ padding: '12px 24px', fontSize: '14px', flexGrow: 1 }}>
                      <span>Next Step</span>
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </form>
              )}

              {step === 2 && (
                /* Step 2: Phone Verification (OTP) */
                <form id="checkout-step2-form" onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                    Please enter your 10-digit mobile number to verify. We will send you an OTP code.
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-secondary)' }}>PHONE NUMBER</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <div className="skeuo-inset-sm" style={{ display: 'flex', alignItems: 'center', padding: '12px', gap: '8px', backgroundColor: '#e6edf7', flexGrow: 1 }}>
                        <Smartphone size={16} style={{ color: 'var(--text-secondary)' }} />
                        <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-secondary)' }}>+91</span>
                        <input
                          id="user-phone-input"
                          type="tel"
                          required
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').substring(0, 10))}
                          disabled={otpSent}
                          placeholder="9876543210"
                          style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontFamily: 'var(--font-mono)', fontSize: '14px' }}
                        />
                      </div>
                      
                      {!otpSent ? (
                        <button
                          id="send-otp-btn"
                          type="button"
                          onClick={handleSendOtp}
                          disabled={phoneNumber.length < 10}
                          className="tactile-button tactile-button-gold"
                          style={{ padding: '0 20px', fontSize: '13px' }}
                        >
                          Send OTP
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setOtpSent(false);
                            setOtpInput('');
                          }}
                          className="tactile-button"
                          style={{ padding: '0 12px', fontSize: '12px' }}
                        >
                          Change
                        </button>
                      )}
                    </div>
                  </div>

                  {otpSent && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', animation: 'fadeInScale 0.3s ease-out' }}>
                      <label style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-secondary)' }}>ENTER 4-DIGIT OTP</label>
                      <input
                        id="user-otp-input"
                        type="text"
                        required
                        value={otpInput}
                        onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, '').substring(0, 4))}
                        placeholder="••••"
                        className="skeuo-inset-sm"
                        style={{ padding: '12px', border: '1px solid rgba(255,255,255,0.4)', outline: 'none', fontSize: '16px', letterSpacing: '10px', textAlign: 'center', fontFamily: 'var(--font-mono)' }}
                      />
                      {otpError && (
                        <span style={{ fontSize: '11px', color: 'var(--accent-red)', fontWeight: 700 }}>
                          ✕ Invalid code. Check the simulated SMS code in the popup.
                        </span>
                      )}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                    <button type="button" onClick={() => setStep(1)} className="tactile-button" style={{ padding: '12px 24px', fontSize: '14px' }}>
                      <ChevronLeft size={16} />
                      <span>Back</span>
                    </button>
                    
                    <button 
                      id="verify-otp-btn"
                      type="submit" 
                      className="tactile-button tactile-button-gold" 
                      style={{ padding: '12px 24px', fontSize: '14px', flexGrow: 1 }}
                      disabled={!otpSent || otpInput.length < 4 || isVerifyingOtp}
                    >
                      {isVerifyingOtp ? 'Verifying...' : 'Verify & Continue'}
                    </button>
                  </div>
                </form>
              )}

              {step === 3 && (
                /* Step 3: Payment Page */
                <form id="checkout-step3-form" onSubmit={handlePaymentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* Payment Option Switch */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left', marginBottom: '8px' }}>
                    <label style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-secondary)' }}>CHOOSE PAYMENT METHOD</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <button
                        type="button"
                        onClick={() => setPaymentType('Online')}
                        className={`tactile-button ${paymentType === 'Online' ? 'active' : ''}`}
                        style={{
                          padding: '12px',
                          fontSize: '13px',
                          fontWeight: 700,
                          backgroundColor: paymentType === 'Online' ? '#d1dceb' : 'var(--bg-base)'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                          <div className={`led-indicator ${paymentType === 'Online' ? 'green' : 'off'}`}></div>
                          <span>Pay Online</span>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentType('COD')}
                        className={`tactile-button ${paymentType === 'COD' ? 'active' : ''}`}
                        style={{
                          padding: '12px',
                          fontSize: '13px',
                          fontWeight: 700,
                          backgroundColor: paymentType === 'COD' ? '#d1dceb' : 'var(--bg-base)'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                          <div className={`led-indicator ${paymentType === 'COD' ? 'green' : 'off'}`}></div>
                          <span>Cash on Delivery (COD)</span>
                        </div>
                      </button>
                    </div>
                  </div>

                  {paymentType === 'COD' ? (
                    <div className="skeuo-inset-sm" style={{ padding: '20px', backgroundColor: '#e6edf7', textAlign: 'center' }}>
                      <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '8px' }}>CASH ON DELIVERY ACTIVE</span>
                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.5' }}>
                        You will pay in cash to the delivery boy when the items are delivered to your home. No advance payment is needed.
                      </p>
                    </div>
                  ) : (
                    <>
                      {renderPaymentOptions()}

                      {/* Payment Screenshot Uploader */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left', marginTop: '12px' }}>
                        <label style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-secondary)' }}>UPLOAD PAYMENT SCREENSHOT (REQUIRED)</label>
                        <label className="tactile-button" style={{ padding: '10px', fontSize: '12px', cursor: 'pointer', textAlign: 'center', display: 'block', margin: 0 }}>
                          Select Screenshot Image
                          <input
                            id="checkout-screenshot-upload"
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  setPaymentScreenshot(reader.result);
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                            style={{ display: 'none' }}
                          />
                        </label>
                        {paymentScreenshot && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px' }}>
                            <div className="skeuo-inset-sm" style={{ width: '60px', height: '60px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <img src={paymentScreenshot} alt="Payment Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Image uploaded.</span>
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                    <button 
                      type="button" 
                      onClick={() => setStep(userPhoneSession ? 1 : 2)}
                      className="tactile-button" 
                      style={{ padding: '12px 24px', fontSize: '14px' }}
                      disabled={isSubmitting}
                    >
                      <ChevronLeft size={16} />
                      <span>Back</span>
                    </button>
                    
                    <button 
                      id="submit-payment-btn"
                      type="submit" 
                      className="tactile-button tactile-button-gold" 
                      style={{ padding: '12px 24px', fontSize: '14px', flexGrow: 1, gap: '10px' }}
                      disabled={
                        isSubmitting || 
                        (paymentType === 'Online' && (adminSettings.upiId || adminSettings.paymentLink || adminSettings.bankDetails) && !transactionId) || 
                        (paymentType === 'Online' && !paymentScreenshot)
                      }
                    >
                      {isSubmitting ? (
                        <>
                          <RefreshCw size={16} style={{ animation: 'spin 1s linear/infinite' }} />
                          <span>Placing Order...</span>
                        </>
                      ) : (
                        <>
                          <span>Confirm Order: ₹{total.toFixed(2)}</span>
                          <ChevronRight size={16} />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Right Column: Order Summary */}
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '16px', textAlign: 'left' }}>
                Order Summary
              </h3>
              
              <div 
                className="paper-texture receipt-tear" 
                style={{
                  padding: '24px 20px 40px 20px',
                  color: '#333333',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '13px',
                  boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                }}
              >
                {/* Cart list items */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                  {cartItems.map(item => (
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: '8px' }}>
                      <span style={{ textAlign: 'left', fontFamily: 'var(--font-sans)' }}>
                        {item.name} <strong style={{ fontFamily: 'var(--font-mono)' }}>x{item.quantity}</strong>
                      </span>
                      <span style={{ fontWeight: 700 }}>₹{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                {/* Calculation blocks */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', borderTop: '1.5px dashed #aaa', paddingTop: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Items Total</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>GST (8%)</span>
                    <span>₹{tax.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Delivery Fee</span>
                    <span>{shippingCost === 0 ? "FREE" : `₹${shippingCost.toFixed(2)}`}</span>
                  </div>
                  
                  {userPhoneSession && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                      <span>Phone Number</span>
                      <span>+91 {userPhoneSession}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                    <span>Payment Method</span>
                    <span>{paymentType === 'COD' ? 'Cash on Delivery' : 'Pay Online'}</span>
                  </div>

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '16px',
                    fontWeight: 800,
                    marginTop: '8px',
                    borderTop: '1px solid #ddd',
                    paddingTop: '8px'
                  }}>
                    <span>Grand Total</span>
                    <span>₹{total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* Step 4: Success Printed Receipt page */
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <div className="led-indicator green" style={{ width: '20px', height: '20px', boxShadow: '0 0 15px var(--accent-green)' }}></div>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '26px', fontWeight: 700, color: 'var(--text-primary)' }}>
                Order Placed!
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', maxWidth: '400px' }}>
                Thank you! Your order is placed. You can view or print your bill below.
              </p>
            </div>

            {/* Printed Invoice */}
            <div 
              className="paper-texture receipt-tear receipt-tear-top" 
              style={{
                width: '100%',
                padding: '32px 24px 40px 24px',
                color: '#333333',
                fontFamily: 'var(--font-mono)',
                fontSize: '13px',
                textAlign: 'left',
                boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                margin: '10px 0'
              }}
            >
              <div style={{ textAlign: 'center', marginBottom: '20px', borderBottom: '1.5px dashed #aaa', paddingBottom: '12px' }}>
                <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', fontWeight: 700, margin: '4px 0', letterSpacing: '2px' }}>AURA STORE BILL</h4>
                <p style={{ fontSize: '11px', color: '#666' }}>ORDER BILL</p>
                <p style={{ fontSize: '12px', fontWeight: 800, marginTop: '8px', color: '#1e2530' }}>
                  ORDER ID: {placedOrder?.id}
                </p>
                <p style={{ fontSize: '11px', color: '#666' }}>DATE: {new Date(placedOrder?.date).toLocaleString()}</p>
              </div>

              {/* Delivery Info */}
              <div style={{ marginBottom: '16px', borderBottom: '1px solid #eee', paddingBottom: '12px' }}>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#666', display: 'block', marginBottom: '4px' }}>DELIVER TO:</span>
                <span style={{ fontWeight: 700 }}>{shippingInfo.name}</span>
                <p style={{ margin: '2px 0' }}>{shippingInfo.address}</p>
                <p style={{ margin: '0' }}>{shippingInfo.city}, {shippingInfo.zip}</p>
                <p style={{ margin: '2px 0' }}>Mobile: +91 {userPhoneSession}</p>
                <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#666' }}>Delivery: Home Delivery</p>
              </div>

              {/* Items Detail */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#666', display: 'block' }}>ITEMS ORDERED:</span>
                {cartItems.map(item => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>{item.name} x{item.quantity}</span>
                    <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {/* Calculations */}
              <div style={{ borderTop: '1.5px dashed #aaa', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>ITEMS TOTAL</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>GST (8%)</span>
                  <span>₹{tax.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>DELIVERY FEE</span>
                  <span>{shippingCost === 0 ? "FREE" : `₹${shippingCost.toFixed(2)}`}</span>
                </div>
                {placedOrder?.customer?.transactionId && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#666' }}>
                    <span>Transaction ID</span>
                    <span style={{ fontSize: '11px' }}>{placedOrder.customer.transactionId}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#666' }}>
                  <span>PAYMENT METHOD</span>
                  <span style={{ fontSize: '12px', fontWeight: 800 }}>{placedOrder?.paymentMethod}</span>
                </div>
                
                {placedOrder?.customer?.paymentScreenshot && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '10px', borderTop: '1px solid #eee', paddingTop: '10px' }}>
                    <span style={{ fontSize: '11px', color: '#666', fontWeight: 800 }}>PAYMENT PHOTO PROOF:</span>
                    <div style={{ width: '100%', maxHeight: '150px', overflow: 'hidden', borderRadius: '4px', border: '1px solid #ddd', backgroundColor: '#fafafa', display: 'flex', justifyContent: 'center' }}>
                      <img src={placedOrder.customer.paymentScreenshot} alt="Uploaded Payment Screenshot" style={{ maxWidth: '100%', maxHeight: '150px', objectFit: 'contain' }} />
                    </div>
                  </div>
                )}

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '15px',
                  fontWeight: 800,
                  marginTop: '8px',
                  borderTop: '1.5px solid #111',
                  paddingTop: '8px'
                }}>
                  <span>GRAND TOTAL</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
              </div>

              {/* Conditional PAID / COD stamp */}
              {placedOrder?.paymentMethod === 'COD' ? (
                <div style={{
                  marginTop: '28px', border: '3px double #f39c12', color: '#f39c12', padding: '6px 12px',
                  width: 'fit-content', margin: '0 auto', transform: 'rotate(-4deg)', fontWeight: 800,
                  fontSize: '14px', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '1px'
                }}>
                  ✦ PAY CASH ON DELIVERY ✦
                </div>
              ) : (
                <div style={{
                  marginTop: '28px', border: '3px double #e74c3c', color: '#e74c3c', padding: '6px 12px',
                  width: 'fit-content', margin: '0 auto', transform: 'rotate(-4deg)', fontWeight: 800,
                  fontSize: '14px', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '1px'
                }}>
                  ✦ PAID ✦
                </div>
              )}
            </div>

            {/* Back controls */}
            <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
              <button onClick={() => window.print()} className="tactile-button" style={{ padding: '12px 24px', fontSize: '14px', flexGrow: 1, gap: '8px' }}>
                <Printer size={16} />
                <span>Print Bill</span>
              </button>
              <button onClick={onCancel} className="tactile-button tactile-button-gold" style={{ padding: '12px 24px', fontSize: '14px', flexGrow: 1 }}>
                <span>Shop More</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </main>
  );
}
