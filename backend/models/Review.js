import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  productId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Product', 
    required: true 
  },
  reviewerName: { type: String, required: true, minlength: 2, maxlength: 80 },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true, minlength: 10, maxlength: 1000 },
}, { timestamps: true });

const Review = mongoose.model('Review', reviewSchema);
export default Review;
