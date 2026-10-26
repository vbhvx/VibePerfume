import express from 'express';
import { body } from 'express-validator';
import { 
  getProducts, 
  getProductById, 
  createProduct,
  updateProduct,
  deleteProduct,
  getProductReviews, 
  addProductReview 
} from '../controllers/productController.js';

const router = express.Router();

router.get('/', getProducts);
router.get('/:id', getProductById);
router.post('/', [
  body('name').isString().notEmpty().withMessage('Product name is required'),
  body('brandName').isString().notEmpty().withMessage('Brand name is required'),
  body('fragranceFamily').isString().notEmpty().withMessage('Fragrance family is required')
], createProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);

router.get('/:id/reviews', getProductReviews);
router.post('/:id/reviews', [
  body('reviewerName').isString().isLength({ min: 2, max: 80 }).withMessage('Name must be 2-80 characters'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').isString().isLength({ min: 5, max: 1000 }).withMessage('Review comment must be 5-1000 characters')
], addProductReview);

export default router;
