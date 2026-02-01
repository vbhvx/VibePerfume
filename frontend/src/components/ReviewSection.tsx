import type { Review } from '../types';
import { Star } from 'lucide-react';
import './ReviewSection.css';

interface ReviewSectionProps {
  reviews: Review[];
}

const ReviewSection = ({ reviews }: ReviewSectionProps) => {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star 
        key={i} 
        size={16} 
        className={i < rating ? 'star-filled' : 'star-empty'} 
      />
    ));
  };

  return (
    <div className="reviews-list">
      <h3>Customer Reviews ({reviews.length})</h3>
      
      {reviews.length === 0 ? (
        <p className="no-reviews">No reviews yet. Be the first to share your thoughts!</p>
      ) : (
        reviews.map((review) => (
          <div key={review._id} className="review-item fade-in">
            <div className="review-header">
              <span className="reviewer-name">{review.reviewerName}</span>
              <span className="review-date">{formatDate(review.createdAt)}</span>
            </div>
            <div className="review-rating">
              {renderStars(review.rating)}
            </div>
            <p className="review-comment">{review.comment}</p>
          </div>
        ))
      )}
    </div>
  );
};

export default ReviewSection;
