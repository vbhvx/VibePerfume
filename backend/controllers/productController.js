import { db } from '../data/db.js';
import { validationResult } from 'express-validator';

export const getProducts = (req, res) => {
  try {
    const products = db.getProducts(req.query);
    res.json({
      success: true,
      message: 'Products retrieved successfully',
      data: products,
      total: products.length
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message, data: [] });
  }
};

export const getProductById = (req, res) => {
  try {
    const product = db.getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found', data: null });
    }
    res.json({ success: true, message: 'Product found', data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message, data: null });
  }
};

export const createProduct = (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array().map(e => ({ field: e.path, message: e.msg }))
      });
    }

    const created = db.createProduct(req.body);
    res.status(201).json({ success: true, message: 'Product created successfully', data: created });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateProduct = (req, res) => {
  try {
    const updated = db.updateProduct(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, message: 'Product updated successfully', data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteProduct = (req, res) => {
  try {
    const deleted = db.deleteProduct(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getProductReviews = (req, res) => {
  try {
    const reviews = db.getReviewsForProduct(req.params.id);
    res.json({ success: true, message: 'Reviews retrieved', data: reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message, data: [] });
  }
};

export const addProductReview = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({ field: err.path, message: err.msg }))
    });
  }

  try {
    const { reviewerName, rating, title, comment } = req.body;
    const newReview = db.addReview({
      productId: req.params.id,
      reviewerName,
      rating,
      title,
      body: comment,
      verificationStatus: req.body.isVerifiedPurchase ? 'verified_purchase' : 'unverified'
    });

    res.status(201).json({
      success: true,
      message: 'Thank you! Your fragrance review has been published.',
      data: newReview
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
