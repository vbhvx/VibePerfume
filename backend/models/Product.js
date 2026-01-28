import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  brand: { type: String, required: true },
  category: { 
    type: String, 
    required: true,
    enum: ['woody', 'floral', 'citrus', 'oriental', 'fresh'] 
  },
  shortDescription: { type: String, required: true, maxlength: 120 },
  description: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  currency: { type: String, default: 'INR' },
  images: { type: [String], required: true },
  sizes: { type: [String], required: true },
  notes: {
    top: [String],
    heart: [String],
    base: [String],
  }
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);
export default Product;
