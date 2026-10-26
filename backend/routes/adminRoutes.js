import express from 'express';
import { db } from '../data/db.js';

const router = express.Router();

// Admin metrics
router.get('/metrics', (req, res) => {
  try {
    const products = db.getProducts();
    const orders = db.getAllOrders();
    const reviews = db.getAllReviews();

    const totalSales = orders
      .filter(o => o.orderStatus !== 'cancelled')
      .reduce((sum, o) => sum + (o.total || 0), 0);

    const pendingReviews = reviews.filter(r => r.moderationStatus === 'pending').length;

    let lowStockCount = 0;
    for (const p of products) {
      for (const v of p.variants || []) {
        if (v.stockQuantity <= 10) lowStockCount++;
      }
    }

    res.json({
      success: true,
      data: {
        totalRevenue: totalSales,
        totalOrders: orders.length,
        activeProducts: products.length,
        pendingReviews,
        lowStockVariants: lowStockCount,
        averageOrderValue: orders.length > 0 ? Math.round(totalSales / orders.length) : 0
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin orders
router.get('/orders', (req, res) => {
  try {
    const orders = db.getAllOrders();
    res.json({ success: true, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.patch('/orders/:id/status', (req, res) => {
  try {
    const { status, note } = req.body;
    if (!status) {
      return res.status(400).json({ success: false, message: 'Status is required' });
    }
    const updated = db.updateOrderStatus(req.params.id, status, note);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.json({ success: true, message: `Order status changed to ${status}`, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin reviews moderation
router.get('/reviews', (req, res) => {
  try {
    const reviews = db.getAllReviews();
    res.json({ success: true, data: reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.patch('/reviews/:id/moderation', (req, res) => {
  try {
    const { moderationStatus, verificationStatus } = req.body;
    const updated = db.updateReviewModeration(req.params.id, moderationStatus, verificationStatus);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }
    res.json({ success: true, message: 'Review moderation updated', data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin inventory adjust
router.patch('/inventory', (req, res) => {
  try {
    const { variantId, quantityDelta, reason } = req.body;
    if (!variantId || quantityDelta === undefined) {
      return res.status(400).json({ success: false, message: 'variantId and quantityDelta are required' });
    }
    const updated = db.adjustInventory(variantId, quantityDelta, reason);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Variant not found' });
    }
    res.json({ success: true, message: 'Inventory adjusted successfully', data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
