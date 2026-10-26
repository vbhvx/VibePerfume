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

// Order lookup for tracking
router.get('/orders/:orderNumber', (req, res) => {
  try {
    const order = db.getOrder(req.params.orderNumber);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order reference not found' });
    }

    // Optional email verification if passed
    if (req.query.email) {
      const emailQuery = req.query.email.trim().toLowerCase();
      if (order.customerEmail.toLowerCase() !== emailQuery) {
        return res.status(403).json({ success: false, message: 'Email address does not match this order.' });
      }
    }

    res.json({ success: true, data: order });
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
