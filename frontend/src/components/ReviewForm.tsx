import { useState } from 'react';
import { Star } from 'lucide-react';
import { toast } from 'react-hot-toast';
import './ReviewForm.css';

interface ReviewFormProps {
  productId: string;
  onSuccess: () => void;
}

const ReviewForm = ({ productId, onSuccess }: ReviewFormProps) => {
  const [name, setName] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.length < 2) return toast.error('Name too short');
    if (comment.length < 10) return toast.error('Review must be at least 10 characters');

    setIsSubmitting(true);
    try {
      // In a real app, this would call addReview API
      // Since I don't have the API running yet, I'll mock it if needed
      // but I'll write the actual code.
      const { addReview } = await import('../api/products');
      const response = await addReview(productId, { reviewerName: name, rating, comment });
      
      if (response.success) {
        toast.success('Review submitted successfully!');
        setName('');
        setComment('');
        setRating(5);
        onSuccess();
      } else {
        toast.error(response.message || 'Submission failed');
      }
    } catch (err) {
      toast.error('Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="review-form-container">
      <h3>Add a Review</h3>
      <form onSubmit={handleSubmit} className="review-form">
        <div className="form-group">
          <label>Your Name</label>
          <input 
            type="text" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            placeholder="e.g. John Doe"
            required
            disabled={isSubmitting}
          />
        </div>

        <div className="form-group">
          <label>Rating</label>
          <div className="star-selector">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={24}
                className={(hoverRating || rating) >= star ? 'star-filled' : 'star-empty'}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
              />
            ))}
          </div>
        </div>

        <div className="form-group">
          <label>Your Review</label>
          <textarea 
            value={comment} 
            onChange={(e) => setComment(e.target.value)} 
            placeholder="Share your experience with this fragrance..."
            rows={4}
            required
            disabled={isSubmitting}
          ></textarea>
        </div>

        <button type="submit" className="btn-submit" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit Review'}
        </button>
      </form>
    </div>
  );
};

export default ReviewForm;
