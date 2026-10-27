import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  CreditCard, 
  Truck, 
  Sparkles, 
  Lock, 
  QrCode, 
  Banknote 
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useCart } from '../context/CartContext';
import { createCheckoutOrder } from '../api/products';
import { getAssetUrl, handleImageError } from '../utils/imageUrl';
import './Checkout.css';

export const Checkout: React.FC = () => {
  const { 
    validatedCart, 
    rawItems, 
    shippingMethod, 
    setShippingMethod, 
    couponCode, 
    clearCart 
  } = useCart();

  const navigate = useNavigate();

  // Step 1: Customer & Shipping
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');
  const [postalCode, setPostalCode] = useState('');

  // Step 2: Payment
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi' | 'cod'>('card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [simulateFailure, setSimulateFailure] = useState(false);
  const [processing, setProcessing] = useState(false);

  const fillTestCard = () => {
    setCardNumber('4242 •••• •••• 4242');
    setCardExpiry('12/28');
    setCardCvv('888');
    toast.success('Test sandbox card details filled.');
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName || !email || !addressLine1 || !city || !postalCode) {
      toast.error('Please complete all required shipping fields.');
      return;
    }

    if (!rawItems || rawItems.length === 0) {
      toast.error('Your shopping bag is empty.');
      navigate('/collections');
      return;
    }

    try {
      setProcessing(true);

      const orderPayload = {
        customerEmail: email.trim(),
        customerPhone: phone.trim(),
        shippingAddress: {
          fullName: fullName.trim(),
          addressLine1: addressLine1.trim(),
          city: city.trim(),
          state: stateName.trim() || 'State',
          postalCode: postalCode.trim(),
          country: 'India'
        },
        items: rawItems,
        discountCode: couponCode || undefined,
        shippingMethod,
        paymentMethod: paymentMethod === 'card' ? 'Credit Card (Sandbox)' : paymentMethod === 'upi' ? 'UPI / NetBanking' : 'Cash on Delivery',
        simulatePaymentFailure: simulateFailure
      };

      const res = await createCheckoutOrder(orderPayload);

      if (res.success && res.data) {
        toast.success('Order placed successfully!');
        const orderNumber = res.data.orderNumber;
        clearCart();
        navigate(`/orders/${orderNumber}`);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Payment or order processing failed.';
      toast.error(msg, { duration: 5000 });
    } finally {
      setProcessing(false);
    }
  };

  if (!rawItems || rawItems.length === 0) {
    return (
      <div className="container checkout-page" style={{ textAlign: 'center', padding: '10rem 0' }}>
        <h2>Your Shopping Bag is Empty</h2>
        <p style={{ marginTop: '0.8rem', color: 'var(--text-muted)' }}>
          Please add a fragrance to your bag before proceeding to checkout.
        </p>
        <Link to="/collections" className="btn-gold" style={{ marginTop: '1.5rem' }}>
          Explore Collections
        </Link>
      </div>
    );
  }

  const subtotal = validatedCart?.subtotal || 0;
  const discount = validatedCart?.discount || 0;
  const shippingFee = shippingMethod === 'express' ? 250 : (subtotal >= 2000 ? 0 : 150);
  const total = Math.max(0, subtotal - discount + shippingFee);

  return (
    <div className="checkout-page">
      <div className="container">
        <div style={{ marginBottom: '2.5rem' }}>
          <span className="section-eyebrow">Secure Commerce</span>
          <h1 style={{ fontSize: '2.6rem' }}>Checkout & Verification</h1>
        </div>

        <form onSubmit={handlePlaceOrder} className="checkout-grid">
          {/* Left Column: Multi-step accordion cards */}
          <div className="checkout-form-container">
            {/* Step 1: Customer & Shipping Address */}
            <div className="checkout-step-card active">
              <div className="step-header">
                <span className="step-num">1</span>
                <h3>Shipping & Contact Protocol</h3>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Full Recipient Name *</label>
                  <input 
                    type="text" 
                    value={fullName} 
                    onChange={e => setFullName(e.target.value)}
                    placeholder="e.g. Rohan Singhal" 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>Email Address (For Tracking & Invoice) *</label>
                  <input 
                    type="email" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)}
                    placeholder="rohan@example.com" 
                    required 
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Contact Phone (For Courier Updates) *</label>
                  <input 
                    type="tel" 
                    value={phone} 
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+91 98765 43210" 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>Postal PIN Code *</label>
                  <input 
                    type="text" 
                    value={postalCode} 
                    onChange={e => setPostalCode(e.target.value)}
                    placeholder="110001" 
                    required 
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Street Address & Residence *</label>
                <input 
                  type="text" 
                  value={addressLine1} 
                  onChange={e => setAddressLine1(e.target.value)}
                  placeholder="Apartment, suite, unit, building, floor" 
                  required 
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>City *</label>
                  <input 
                    type="text" 
                    value={city} 
                    onChange={e => setCity(e.target.value)}
                    placeholder="e.g. New Delhi" 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>State *</label>
                  <input 
                    type="text" 
                    value={stateName} 
                    onChange={e => setStateName(e.target.value)}
                    placeholder="e.g. Delhi" 
                    required 
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Delivery Speed */}
            <div className="checkout-step-card active">
              <div className="step-header">
                <span className="step-num">2</span>
                <h3>Delivery Method</h3>
              </div>

              <div className="shipping-options-list">
                <div 
                  className={`shipping-option-item ${shippingMethod === 'standard' ? 'selected' : ''}`}
                  onClick={() => setShippingMethod('standard')}
                >
                  <div className="shipping-option-left">
                    <Truck size={20} style={{ color: 'var(--gold-primary)' }} />
                    <div>
                      <div style={{ fontWeight: 600, color: '#fff' }}>Standard Express Delivery (3–5 Days)</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Temperature-controlled transit via BlueDart</div>
                    </div>
                  </div>
                  <span style={{ fontWeight: 600, color: subtotal >= 2000 ? '#34d399' : '#fff' }}>
                    {subtotal >= 2000 ? 'FREE' : '₹150'}
                  </span>
                </div>

                <div 
                  className={`shipping-option-item ${shippingMethod === 'express' ? 'selected' : ''}`}
                  onClick={() => setShippingMethod('express')}
                >
                  <div className="shipping-option-left">
                    <Sparkles size={20} style={{ color: 'var(--gold-primary)' }} />
                    <div>
                      <div style={{ fontWeight: 600, color: '#fff' }}>Priority Air Courier (1–2 Days)</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Direct expedited dispatch with fragile insurance</div>
                    </div>
                  </div>
                  <span style={{ fontWeight: 600, color: '#fff' }}>₹250</span>
                </div>
              </div>
            </div>

            {/* Step 3: Payment Sandbox */}
            <div className="checkout-step-card active">
              <div className="step-header">
                <span className="step-num">3</span>
                <h3>Secure Payment Gateway</h3>
              </div>

              <div className="payment-methods-grid">
                <button
                  type="button"
                  className={`payment-tab-btn ${paymentMethod === 'card' ? 'active' : ''}`}
                  onClick={() => setPaymentMethod('card')}
                >
                  <CreditCard size={18} />
                  <span>Card Sandbox</span>
                </button>
                <button
                  type="button"
                  className={`payment-tab-btn ${paymentMethod === 'upi' ? 'active' : ''}`}
                  onClick={() => setPaymentMethod('upi')}
                >
                  <QrCode size={18} />
                  <span>UPI / NetBanking</span>
                </button>
                <button
                  type="button"
                  className={`payment-tab-btn ${paymentMethod === 'cod' ? 'active' : ''}`}
                  onClick={() => setPaymentMethod('cod')}
                >
                  <Banknote size={18} />
                  <span>Cash on Delivery</span>
                </button>
              </div>

              {paymentMethod === 'card' && (
                <div>
                  <div className="sandbox-test-box">
                    <div className="sandbox-test-header">
                      <h5>Sandbox Test Simulator Mode</h5>
                      <button type="button" className="btn-fill-test-card" onClick={fillTestCard}>
                        Prefill Test Card
                      </button>
                    </div>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
                      No real charges will occur. Use this interactive sandbox to simulate authoritative payment authorization.
                    </p>
                  </div>

                  <div className="form-group">
                    <label>Card Number</label>
                    <input 
                      type="text" 
                      value={cardNumber} 
                      onChange={e => setCardNumber(e.target.value)}
                      placeholder="4242 •••• •••• 4242" 
                      required 
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Valid Thru</label>
                      <input 
                        type="text" 
                        value={cardExpiry} 
                        onChange={e => setCardExpiry(e.target.value)}
                        placeholder="MM/YY" 
                        required 
                      />
                    </div>
                    <div className="form-group">
                      <label>CVV / CVC</label>
                      <input 
                        type="text" 
                        value={cardCvv} 
                        onChange={e => setCardCvv(e.target.value)}
                        placeholder="•••" 
                        required 
                      />
                    </div>
                  </div>

                  {/* Failure toggle for verifying error handling */}
                  <div style={{ marginTop: '0.8rem', padding: '0.8rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.82rem', color: 'var(--warning)', cursor: 'pointer' }}>
                      <input 
                        type="checkbox" 
                        checked={simulateFailure} 
                        onChange={e => setSimulateFailure(e.target.checked)} 
                      />
                      <span>Simulate Payment Decline (To test error recovery without loss of data)</span>
                    </label>
                  </div>
                </div>
              )}

              {paymentMethod === 'upi' && (
                <div style={{ textAlign: 'center', padding: '2rem 1rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-sm)' }}>
                  <QrCode size={48} style={{ color: 'var(--gold-primary)', margin: '0 auto 0.8rem' }} />
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                    Instant zero-fee payment via Google Pay, PhonePe, Paytm, or BHIM UPI ID.
                  </p>
                </div>
              )}

              {paymentMethod === 'cod' && (
                <div style={{ padding: '1.5rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-sm)' }}>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: 0 }}>
                    Pay with Cash or UPI upon courier arrival. Complimentary 2ml tester vial still included inside the delivery box!
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Authoritative Order Summary */}
          <div className="checkout-summary-sidebar">
            <h3>Order Summary ({validatedCart?.items?.length || 0})</h3>

            <div className="checkout-items-list">
              {validatedCart?.items?.map(it => (
                <div key={it.variantId} className="checkout-mini-item">
                  <img 
                    src={getAssetUrl(it.imageUrl)} 
                    alt={it.productName} 
                    className="checkout-mini-img" 
                    onError={handleImageError}
                  />
                  <div className="checkout-mini-info">
                    <h5 className="checkout-mini-title">{it.productName}</h5>
                    <div className="checkout-mini-meta">
                      {it.sizeMl}ml • Qty: {it.quantity}
                    </div>
                  </div>
                  <span style={{ fontWeight: 600, fontSize: '0.92rem' }}>
                    ₹{it.lineTotal.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            <div className="cart-summary-line">
              <span>Subtotal</span>
              <span>₹{subtotal.toLocaleString()}</span>
            </div>

            {discount > 0 && (
              <div className="cart-summary-line discount">
                <span>Promotional Discount</span>
                <span>-₹{discount.toLocaleString()}</span>
              </div>
            )}

            <div className="cart-summary-line">
              <span>Shipping Fee</span>
              <span>{shippingFee === 0 ? 'FREE' : `₹${shippingFee.toLocaleString()}`}</span>
            </div>

            <div className="cart-total-line">
              <span>Total Payable</span>
              <span>₹{total.toLocaleString()}</span>
            </div>

            <button 
              type="submit" 
              className="btn-gold" 
              style={{ width: '100%', padding: '0.95rem' }}
              disabled={processing}
            >
              {processing ? 'Authorizing Payment...' : `Complete Order • ₹${total.toLocaleString()}`}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', marginTop: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <Lock size={12} /> 256-bit Encrypted SSL Commerce
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
