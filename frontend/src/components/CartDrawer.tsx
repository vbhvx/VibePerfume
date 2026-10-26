import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Trash2, ShoppingBag, Sparkles, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import './CartDrawer.css';

export const CartDrawer: React.FC = () => {
  const {
    isCartOpen,
    closeCart,
    validatedCart,
    rawItems,
    updateQuantity,
    removeFromCart,
    applyCoupon,
    removeCoupon,
    isLoading
  } = useCart();

  const [inputCoupon, setInputCoupon] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const navigate = useNavigate();

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCoupon.trim()) return;
    setIsApplying(true);
    const success = await applyCoupon(inputCoupon);
    if (success) setInputCoupon('');
    setIsApplying(false);
  };

  const handleProceedToCheckout = () => {
    closeCart();
    navigate('/checkout');
  };

  const subtotal = validatedCart?.subtotal || 0;
  const freeThreshold = validatedCart?.freeShippingThreshold || 2000;
  const progressPercent = Math.min(100, Math.round((subtotal / freeThreshold) * 100));
  const amountToFree = Math.max(0, freeThreshold - subtotal);

  return (
    <>
      <div 
        className={`cart-overlay ${isCartOpen ? 'open' : ''}`} 
        onClick={closeCart}
        aria-hidden="true"
      />
      <div className={`cart-drawer ${isCartOpen ? 'open' : ''}`} role="dialog" aria-modal="true" aria-label="Shopping Bag">
        {/* Header */}
        <div className="cart-header">
          <div className="cart-title-wrap">
            <h3>Shopping Bag</h3>
            <span className="cart-count-badge">{rawItems.length} items</span>
          </div>
          <button className="cart-close-btn" onClick={closeCart} aria-label="Close Shopping Bag">
            <X size={20} />
          </button>
        </div>

        {/* Free Shipping Tracker */}
        <div className="shipping-progress-banner">
          <div className="shipping-progress-text">
            {amountToFree === 0 ? (
              <span>✨ <strong>Complimentary Express Delivery</strong> unlocked on your order!</span>
            ) : (
              <span>Add <strong>₹{amountToFree.toLocaleString()}</strong> more to enjoy Free Express Shipping</span>
            )}
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>

        {/* Items List */}
        <div className="cart-items-container">
          {(!validatedCart?.items || validatedCart.items.length === 0) ? (
            <div className="cart-empty-state">
              <ShoppingBag className="cart-empty-icon" />
              <h3>Your bag is empty</h3>
              <p>Explore our curated olfactory collection to find your signature fragrance.</p>
              <button 
                className="btn-gold" 
                onClick={() => { closeCart(); navigate('/collections'); }}
              >
                Discover Scents
              </button>
            </div>
          ) : (
            validatedCart.items.map(item => (
              <div key={item.variantId} className="cart-item-card">
                <img src={item.imageUrl} alt={item.productName} className="cart-item-image" />
                <div className="cart-item-details">
                  <div>
                    <span className="cart-item-brand">{item.brandName}</span>
                    <h4 className="cart-item-name">{item.productName}</h4>
                    <div className="cart-item-meta">
                      {item.sizeMl}ml • {item.concentration}
                    </div>
                  </div>

                  <div className="cart-item-bottom">
                    <div className="qty-control">
                      <button 
                        className="qty-btn"
                        onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                        aria-label="Decrease quantity"
                      >
                        -
                      </button>
                      <span className="qty-value">{item.quantity}</span>
                      <button 
                        className="qty-btn"
                        onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>

                    <span className="cart-item-price">
                      ₹{item.lineTotal.toLocaleString()}
                    </span>
                  </div>
                </div>

                <button 
                  className="cart-item-remove-btn"
                  onClick={() => removeFromCart(item.variantId)}
                  title="Remove from bag"
                  aria-label="Remove item"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}

          {validatedCart?.items && validatedCart.items.length > 0 && (
            <div className="cart-sample-callout">
              <Sparkles size={16} />
              <span>Complimentary 2ml tester vial included with each bottle. Test risk-free before opening the box!</span>
            </div>
          )}
        </div>

        {/* Coupon Section */}
        {validatedCart?.items && validatedCart.items.length > 0 && (
          <div className="cart-coupon-area">
            {validatedCart.coupon ? (
              <div className="active-coupon-badge">
                <span>Code <strong>{validatedCart.coupon.code}</strong> applied (-₹{validatedCart.discount.toLocaleString()})</span>
                <button onClick={removeCoupon} title="Remove coupon">
                  <X size={15} />
                </button>
              </div>
            ) : (
              <form className="coupon-form" onSubmit={handleApplyCoupon}>
                <input 
                  type="text"
                  placeholder="PROMO CODE (e.g. VIBE10)"
                  value={inputCoupon}
                  onChange={e => setInputCoupon(e.target.value)}
                  className="coupon-input"
                />
                <button type="submit" className="btn-apply-coupon" disabled={isApplying}>
                  {isApplying ? 'Applying...' : 'Apply'}
                </button>
              </form>
            )}
          </div>
        )}

        {/* Footer */}
        {validatedCart?.items && validatedCart.items.length > 0 && (
          <div className="cart-footer">
            <div className="cart-summary-line">
              <span>Subtotal</span>
              <span>₹{(validatedCart.subtotal || 0).toLocaleString()}</span>
            </div>

            {validatedCart.discount > 0 && (
              <div className="cart-summary-line discount">
                <span>Promotional Savings</span>
                <span>-₹{validatedCart.discount.toLocaleString()}</span>
              </div>
            )}

            <div className="cart-summary-line">
              <span>Shipping</span>
              <span>
                {validatedCart.shippingFee === 0 ? 'FREE' : `₹${validatedCart.shippingFee.toLocaleString()}`}
              </span>
            </div>

            <div className="cart-total-line">
              <span>Estimated Total</span>
              <span>₹{(validatedCart.total || 0).toLocaleString()}</span>
            </div>

            <button 
              className="btn-gold cart-checkout-btn" 
              onClick={handleProceedToCheckout}
              disabled={isLoading}
            >
              Proceed to Secure Checkout <ArrowRight size={17} />
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;
