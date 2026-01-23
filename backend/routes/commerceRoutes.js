import express from 'express';
import { db } from '../data/db.js';

const router = express.Router();

// Cart revalidation & authoritative total calculations
router.post('/cart/validate', (req, res) => {
  try {
    const { items = [], couponCode = '', shippingMethod = 'standard' } = req.body;
    const validatedCart = db.validateCart(items, couponCode, shippingMethod);
    res.json({ success: true, data: validatedCart });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Coupon validation
router.get('/coupons/validate', (req, res) => {
  try {
    const { code, subtotal = 0 } = req.query;
    const result = db.validateCoupon(code, Number(subtotal));
    if (!result.valid) {
      return res.status(400).json({ success: false, message: result.message });
    }
    res.json({ success: true, data: result.coupon });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Checkout order creation
router.post('/checkout/orders', (req, res) => {
  try {
    const {
      customerEmail,
      customerPhone,
      shippingAddress,
      items,
      discountCode,
      shippingMethod,
      paymentMethod,
      simulatePaymentFailure
    } = req.body;

    if (!customerEmail || !shippingAddress || !items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Missing essential order details: email, address, or cart items.'
      });
    }

    // Payment simulation check
    if (simulatePaymentFailure === true) {
      return res.status(402).json({
        success: false,
        code: 'PAYMENT_DECLINED',
        message: 'Card issuer declined the transaction (Simulated Sandbox Error). Please verify your card details or select an alternative payment method.'
      });
    }

    const order = db.createOrder({
      customerEmail,
      customerPhone,
      shippingAddress,
      items,
      discountCode,
      shippingMethod,
      paymentMethod: paymentMethod || 'Credit Card',
      paymentStatus: 'paid'
    });

    res.status(201).json({
      success: true,
      message: 'Your fragrance order has been successfully placed and confirmed.',
      data: order
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

function maskEmail(email) {
  if (!email || !email.includes('@')) return '••••••';
  const [local, domain] = email.split('@');
  if (local.length <= 2) return `${local[0]}*@${domain}`;
  return `${local.slice(0, 2)}${'*'.repeat(Math.max(1, local.length - 2))}@${domain}`;
}

function maskPhone(phone) {
  if (!phone) return '••••••';
  const clean = phone.trim();
  if (clean.length < 4) return '••••••';
  return `${clean.slice(0, 3)} ••• ••${clean.slice(-2)}`;
}

function maskName(name) {
  if (!name) return 'Customer';
  const parts = name.trim().split(/\s+/);
  return parts.map(p => p[0] + '*'.repeat(Math.max(1, p.length - 1))).join(' ');
}

// Order lookup for tracking with PII privacy protection
router.get('/orders/:orderNumber', (req, res) => {
  try {
    const order = db.getOrder(req.params.orderNumber);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order reference not found' });
    }

    // If customer email provided, verify match for full unmasked access
    if (req.query.email) {
      const emailQuery = req.query.email.trim().toLowerCase();
      if (order.customerEmail.toLowerCase() !== emailQuery) {
        return res.status(403).json({ success: false, message: 'Email address does not match this order.' });
      }
      return res.json({ success: true, data: order, authenticated: true });
    }

    // Default: Return tracking milestones and items with sensitive personal PII masked
    const maskedOrder = {
      ...order,
      isMasked: true,
      customerEmail: maskEmail(order.customerEmail),
      customerPhone: maskPhone(order.customerPhone),
      shippingAddress: {
        ...order.shippingAddress,
        fullName: maskName(order.shippingAddress?.fullName),
        addressLine1: '•••••••• (Masked for privacy - provide order email to view full address)',
        addressLine2: undefined
      }
    };

    res.json({ success: true, data: maskedOrder, authenticated: false });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Order cancellation
router.post('/orders/:orderNumber/cancel', (req, res) => {
  try {
    const { reason } = req.body;
    const cancelled = db.cancelOrder(req.params.orderNumber, reason);
    if (!cancelled) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.json({
      success: true,
      message: 'Order has been successfully cancelled and inventory restocked.',
      data: cancelled
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

export default router;
