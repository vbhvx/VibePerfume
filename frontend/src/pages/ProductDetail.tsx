import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Star, 
  Heart, 
  Scale, 
  Share2, 
  ChevronRight, 
  Sparkles, 
  Clock, 
  Wind, 
  Activity, 
  Calendar, 
  CheckCircle2, 
  MessageSquarePlus, 
  X 
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { fetchProductById, fetchProductReviews, addReview, fetchProducts } from '../api/products';
import type { Product, ProductVariant, Review } from '../types';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useCompare } from '../context/CompareContext';
import ProductCard from '../components/ProductCard';
import { getAssetUrl, handleImageError } from '../utils/imageUrl';
import './ProductDetail.css';

export const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  // Review Form State
  const [revName, setRevName] = useState('');
  const [revRating, setRevRating] = useState(5);
  const [revTitle, setRevTitle] = useState('');
  const [revComment, setRevComment] = useState('');
  const [revIsVerified, setRevIsVerified] = useState(true);
  const [submittingReview, setSubmittingReview] = useState(false);

  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToCompare, removeFromCompare, isInCompare } = useCompare();

  const loadProductData = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const [prodRes, revRes] = await Promise.all([
        fetchProductById(id),
        fetchProductReviews(id)
      ]);

      if (prodRes.success && prodRes.data) {
        const prod = prodRes.data;
        setProduct(prod);

        // Default variant
        const def = (prod.variants || []).find((v: ProductVariant) => v.id === prod.defaultVariantId) || prod.variants[0];
        setSelectedVariant(def || null);
        setSelectedImage(prod.mainImageUrl);

        // Load related fragrances from same family
        const relatedRes = await fetchProducts({ family: prod.fragranceFamily, limit: 4 });
        if (relatedRes.success && relatedRes.data) {
          setRelatedProducts(relatedRes.data.filter(p => p.id !== prod.id));
        }
      }

      if (revRes.success && revRes.data) {
        setReviews(revRes.data);
      }
    } catch (err) {
      console.error(err);
      toast.error('Could not load fragrance details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProductData();
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) {
    return (
      <div className="container pdp-page" style={{ textAlign: 'center', padding: '10rem 0' }}>
        <Sparkles size={36} style={{ color: 'var(--gold-primary)', animation: 'pulseGold 1.5s infinite' }} />
        <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Decrypting master olfactory formulation...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container pdp-page" style={{ textAlign: 'center', padding: '8rem 0' }}>
        <h2>Fragrance Not Found</h2>
        <p>The formulation you are searching for may be archived or unavailable.</p>
        <Link to="/collections" className="btn-gold" style={{ marginTop: '1.5rem' }}>
          Browse Curated Collections
        </Link>
      </div>
    );
  }

  const isFavorited = isInWishlist(product.id);
  const isCompared = isInCompare(product.id);

  const price = selectedVariant?.price || 0;
  const comparePrice = selectedVariant?.compareAtPrice;
  const sizeMl = selectedVariant?.sizeMl || 50;
  const pricePerMl = sizeMl > 0 ? Math.round(price / sizeMl) : null;

  const handleShare = async () => {
    const shareData = {
      title: `${product.name} — ${product.brandName}`,
      text: product.shortDescription,
      url: window.location.href
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // User dismissed
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Fragrance link copied to clipboard.');
    }
  };

  const handleAddToCart = () => {
    if (!selectedVariant) return;
    addToCart(product, selectedVariant, quantity);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!revName.trim() || !revComment.trim()) {
      toast.error('Please provide your name and review impressions.');
      return;
    }

    try {
      setSubmittingReview(true);
      const res = await addReview(product.id, {
        reviewerName: revName.trim(),
        rating: revRating,
        title: revTitle.trim(),
        comment: revComment.trim(),
        isVerifiedPurchase: revIsVerified
      });

      if (res.success) {
        toast.success(res.message || 'Review submitted successfully!');
        setIsReviewModalOpen(false);
        setRevName('');
        setRevTitle('');
        setRevComment('');
        loadProductData();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  // Histogram calculation
  const totalReviews = reviews.length;
  const ratingCounts = [5, 4, 3, 2, 1].map(star => {
    const count = reviews.filter(r => r.rating === star).length;
    const pct = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
    return { star, count, pct };
  });

  return (
    <div className="pdp-page">
      <div className="container">
        {/* Breadcrumbs */}
        <nav className="pdp-breadcrumbs" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <ChevronRight size={13} />
          <Link to="/collections">Collections</Link>
          <ChevronRight size={13} />
          <Link to={`/collections?family=${product.fragranceFamily.toLowerCase()}`}>
            {product.fragranceFamily}
          </Link>
          <ChevronRight size={13} />
          <span className="current">{product.name}</span>
        </nav>

        {/* Main PDP Grid */}
        <div className="pdp-main-grid">
          {/* Gallery Column */}
          <div className="pdp-gallery-wrap">
            <div className="pdp-main-image-box">
              <img 
                src={getAssetUrl(selectedImage || product.mainImageUrl)} 
                alt={product.name} 
                className="pdp-main-image" 
                onError={handleImageError}
              />
            </div>

            {product.galleryImages && product.galleryImages.length > 1 && (
              <div className="pdp-thumbs-row">
                {product.galleryImages.map((imgUrl, i) => (
                  <button 
                    key={i} 
                    className={`pdp-thumb-btn ${selectedImage === imgUrl ? 'active' : ''}`}
                    onClick={() => setSelectedImage(imgUrl)}
                    aria-label={`View photo ${i + 1}`}
                  >
                    <img 
                      src={getAssetUrl(imgUrl)} 
                      alt={`Thumbnail ${i + 1}`} 
                      className="pdp-thumb-img" 
                      onError={handleImageError}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info Column */}
          <div className="pdp-info-wrap">
            <div className="pdp-header-top">
              <span className="pdp-brand-name">{product.brandName} • {product.genderPresentation || 'Unisex'}</span>
              <div className="pdp-quick-actions">
                <button 
                  className={`btn-pdp-action ${isFavorited ? 'active' : ''}`}
                  onClick={() => toggleWishlist(product.id, product.name)}
                  title={isFavorited ? 'Saved in Wishlist' : 'Add to Wishlist'}
                  aria-label="Wishlist"
                >
                  <Heart size={18} fill={isFavorited ? 'currentColor' : 'none'} />
                </button>
                <button 
                  className={`btn-pdp-action ${isCompared ? 'active' : ''}`}
                  onClick={() => isCompared ? removeFromCompare(product.id) : addToCompare(product)}
                  title={isCompared ? 'In Comparison' : 'Add to Compare'}
                  aria-label="Compare"
                >
                  <Scale size={18} />
                </button>
                <button 
                  className="btn-pdp-action"
                  onClick={handleShare}
                  title="Share fragrance"
                  aria-label="Share"
                >
                  <Share2 size={18} />
                </button>
              </div>
            </div>

            <h1 className="pdp-title">{product.name}</h1>

            <div className="pdp-rating-row">
              <div className="pdp-stars">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star 
                    key={i} 
                    size={16} 
                    fill={i < Math.floor(product.rating || 5) ? 'currentColor' : 'none'} 
                  />
                ))}
              </div>
              <span><strong>{product.rating ? product.rating.toFixed(1) : '5.0'}</strong> ({reviews.length} verified ratings)</span>
              <span>•</span>
              <span className="badge-family">{product.fragranceFamily}</span>
            </div>

            {/* Pricing Box */}
            <div className="pdp-pricing-box">
              <div className="pdp-price-amount">
                <span>₹{price.toLocaleString()}</span>
                {comparePrice && comparePrice > price && (
                  <span className="pdp-price-compare">₹{comparePrice.toLocaleString()}</span>
                )}
              </div>

              {pricePerMl && (
                <div className="pdp-price-per-ml-badge">
                  Unit Price: ₹{pricePerMl}/ml ({sizeMl}ml flacon)
                </div>
              )}
            </div>

            {/* Variant Selector */}
            <div className="pdp-variants-section">
              <div className="pdp-variant-label">
                <span>Select Volume & Concentration</span>
                <span style={{ color: 'var(--gold-light)' }}>{selectedVariant?.concentration}</span>
              </div>

              <div className="pdp-size-pills">
                {(product.variants || []).map(v => (
                  <button
                    key={v.id}
                    className={`pdp-size-btn ${selectedVariant?.id === v.id ? 'active' : ''}`}
                    onClick={() => setSelectedVariant(v)}
                  >
                    <span>{v.sizeMl}ml</span>
                    <span style={{ fontSize: '0.72rem', opacity: 0.8 }}>₹{v.price.toLocaleString()}</span>
                  </button>
                ))}
              </div>

              <div className="pdp-stock-notice">
                {selectedVariant && selectedVariant.stockQuantity > 5 ? (
                  <span className="badge-instock">
                    <CheckCircle2 size={13} /> In Stock — Dispatches within 24 Hours
                  </span>
                ) : selectedVariant && selectedVariant.stockQuantity > 0 ? (
                  <span className="badge-lowstock">
                    Low Stock: Only {selectedVariant.stockQuantity} bottles left
                  </span>
                ) : (
                  <span style={{ color: 'var(--danger)', fontSize: '0.85rem' }}>Currently Out of Stock</span>
                )}
              </div>
            </div>

            {/* Purchase Row */}
            <div className="pdp-purchase-row">
              <div className="pdp-qty-picker">
                <button 
                  className="pdp-qty-btn"
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                >
                  -
                </button>
                <span className="pdp-qty-val">{quantity}</span>
                <button 
                  className="pdp-qty-btn"
                  onClick={() => setQuantity(q => Math.min(selectedVariant?.stockQuantity || 10, q + 1))}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>

              <button 
                className="btn-gold btn-pdp-add-bag"
                onClick={handleAddToCart}
                disabled={!selectedVariant || selectedVariant.stockQuantity <= 0}
              >
                Add to Bag • ₹{(price * quantity).toLocaleString()}
              </button>
            </div>

            {/* Tester Guarantee Callout */}
            <div className="pdp-tester-guarantee">
              <Sparkles size={22} style={{ color: 'var(--gold-primary)', flexShrink: 0 }} />
              <div>
                <h4>Complimentary 2ml Tester Vial Included</h4>
                <p>
                  Every flacon arrives with a matching 2ml spray vial. Wear the sample on your skin for 48 hours; if the scent does not enchant you, return the sealed main flacon for an immediate full refund.
                </p>
              </div>
            </div>

            {/* Storytelling Narrative */}
            <div style={{ marginTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '1.5rem' }}>
              <h3 style={{ fontSize: '1.4rem', marginBottom: '0.8rem' }}>The Scent Narrative</h3>
              <p style={{ lineHeight: 1.8, color: 'var(--text-secondary)' }}>
                {product.description}
              </p>
            </div>
          </div>
        </div>

        {/* Structured Olfactory Pyramid Section */}
        <section className="scent-pyramid-section">
          <div className="section-heading-centered">
            <span className="section-eyebrow">Olfactory Architecture</span>
            <h2>The Scent Pyramid</h2>
            <p>A fragrance evolves on skin over hours. Explore how top, heart, and base notes unfold from initial spray to final drydown.</p>
          </div>

          <div className="pyramid-grid">
            {/* Top Stage */}
            <div className="pyramid-card">
              <span className="pyramid-stage-badge top">Opening • Top Accord (0 - 30 Min)</span>
              <div className="notes-list-detail">
                {(product.notes?.top || []).map((note, i) => {
                  const n = typeof note === 'string' ? { name: note, category: 'Citrus / Spice', description: 'Fresh, vibrant initial burst that greets the senses.' } : note;
                  return (
                    <div key={i} className="note-item-detail">
                      <h5>{n.name}</h5>
                      <span className="badge-family" style={{ fontSize: '0.7rem', marginBottom: '0.4rem', display: 'inline-block' }}>
                        {n.category}
                      </span>
                      <p>{n.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Heart Stage */}
            <div className="pyramid-card">
              <span className="pyramid-stage-badge heart">Core • Heart Accord (30 Min - 4 Hrs)</span>
              <div className="notes-list-detail">
                {(product.notes?.heart || []).map((note, i) => {
                  const n = typeof note === 'string' ? { name: note, category: 'Floral / Wood', description: 'The emotional signature that defines the composition.' } : note;
                  return (
                    <div key={i} className="note-item-detail">
                      <h5>{n.name}</h5>
                      <span className="badge-family" style={{ fontSize: '0.7rem', marginBottom: '0.4rem', display: 'inline-block' }}>
                        {n.category}
                      </span>
                      <p>{n.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Base Stage */}
            <div className="pyramid-card">
              <span className="pyramid-stage-badge base">Foundation • Base Accord (4 - 12+ Hrs)</span>
              <div className="notes-list-detail">
                {(product.notes?.base || []).map((note, i) => {
                  const n = typeof note === 'string' ? { name: note, category: 'Amber / Resin', description: 'Deep, tenacious anchor that clings intimately to skin.' } : note;
                  return (
                    <div key={i} className="note-item-detail">
                      <h5>{n.name}</h5>
                      <span className="badge-family" style={{ fontSize: '0.7rem', marginBottom: '0.4rem', display: 'inline-block' }}>
                        {n.category}
                      </span>
                      <p>{n.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Sensory Guidance Meters */}
        <section style={{ padding: '4rem 0', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div className="section-heading-centered">
            <span className="section-eyebrow">Wearer Guidance</span>
            <h2>Performance & Character</h2>
          </div>

          <div className="guidance-meters-grid">
            <div className="meter-card">
              <div className="meter-header">
                <Activity size={16} style={{ display: 'inline', marginRight: 4, verticalAlign: -2 }} />
                Perceived Intensity
              </div>
              <div className="meter-value">{product.intensity}</div>
              <div className="meter-bar-track">
                <div 
                  className="meter-bar-fill" 
                  style={{ width: product.intensity === 'Very Intense' ? '100%' : product.intensity === 'Intense' ? '80%' : product.intensity === 'Moderate' ? '55%' : '35%' }} 
                />
              </div>
            </div>

            <div className="meter-card">
              <div className="meter-header">
                <Clock size={16} style={{ display: 'inline', marginRight: 4, verticalAlign: -2 }} />
                Longevity on Skin
              </div>
              <div className="meter-value">{product.longevity}</div>
              <div className="meter-bar-track">
                <div className="meter-bar-fill" style={{ width: '85%' }} />
              </div>
            </div>

            <div className="meter-card">
              <div className="meter-header">
                <Wind size={16} style={{ display: 'inline', marginRight: 4, verticalAlign: -2 }} />
                Sillage Projection
              </div>
              <div className="meter-value">{product.sillage}</div>
              <div className="meter-bar-track">
                <div 
                  className="meter-bar-fill" 
                  style={{ width: product.sillage === 'Enormous' ? '95%' : product.sillage === 'Moderate' ? '60%' : '35%' }} 
                />
              </div>
            </div>

            <div className="meter-card">
              <div className="meter-header">
                <Calendar size={16} style={{ display: 'inline', marginRight: 4, verticalAlign: -2 }} />
                Best Seasons & Occasion
              </div>
              <div className="meter-value" style={{ fontSize: '1rem', lineHeight: 1.4 }}>
                {(product.seasons || []).join(' & ')} • {(product.occasions || []).slice(0, 2).join(', ')}
              </div>
            </div>
          </div>
        </section>

        {/* Customer Reviews & Social Proof */}
        <section className="pdp-reviews-section">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span className="section-eyebrow">Verified Impressions</span>
              <h2>Client Experiences</h2>
            </div>
            <button className="btn-gold" onClick={() => setIsReviewModalOpen(true)}>
              <MessageSquarePlus size={16} /> Write an Atelier Review
            </button>
          </div>

          <div className="reviews-summary-panel">
            <div>
              <div className="score-big">{product.rating ? product.rating.toFixed(1) : '5.0'}</div>
              <div className="pdp-stars" style={{ marginBottom: '0.4rem' }}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={18} fill="currentColor" />
                ))}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Based on {reviews.length} authentic customer reviews
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              {ratingCounts.map(item => (
                <div key={item.star} className="histogram-row">
                  <span style={{ width: '40px' }}>{item.star} ★</span>
                  <div className="hist-bar-track">
                    <div className="hist-bar-fill" style={{ width: `${item.pct}%` }} />
                  </div>
                  <span style={{ width: '30px', textAlign: 'right' }}>{item.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Review Items */}
          <div className="reviews-list-grid">
            {reviews.length === 0 ? (
              <p style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)' }}>
                Be the first to share your olfactory impression of {product.name}.
              </p>
            ) : (
              reviews.map(rev => (
                <div key={rev.id || rev._id} className="review-item-card">
                  <div className="review-header-flex">
                    <div className="reviewer-name">
                      <span>{rev.reviewerName}</span>
                      {rev.verificationStatus === 'verified_purchase' && (
                        <span className="badge-verified-buyer">Verified Purchase</span>
                      )}
                    </div>
                    <div className="pdp-stars">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} size={14} fill={i < rev.rating ? 'currentColor' : 'none'} />
                      ))}
                    </div>
                  </div>
                  {rev.title && <h4 className="review-title">{rev.title}</h4>}
                  <p className="review-body">{rev.body || rev.comment}</p>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Related Fragrances */}
        {relatedProducts.length > 0 && (
          <section style={{ padding: '4rem 0 2rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div className="section-heading-centered">
              <span className="section-eyebrow">Harmonic Kinship</span>
              <h2>You May Also Resonate With</h2>
            </div>
            <div className="products-grid-home">
              {relatedProducts.map(rel => (
                <ProductCard key={rel.id} product={rel} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Review Submission Modal */}
      {isReviewModalOpen && (
        <div className="search-modal-backdrop" onClick={() => setIsReviewModalOpen(false)}>
          <div className="search-modal-card" style={{ maxWidth: '540px' }} onClick={e => e.stopPropagation()}>
            <div className="search-input-wrapper" style={{ justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: '1.3rem', margin: 0 }}>Review {product.name}</h3>
              <button className="search-close-btn" onClick={() => setIsReviewModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitReview} style={{ padding: '1.8rem', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div>
                <label style={{ fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--gold-light)', display: 'block', marginBottom: '0.4rem' }}>
                  Your Name
                </label>
                <input 
                  type="text" 
                  value={revName} 
                  onChange={e => setRevName(e.target.value)}
                  placeholder="e.g. Vikram Malhotra"
                  required
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--gold-light)', display: 'block', marginBottom: '0.4rem' }}>
                  Rating (1 to 5 Stars)
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRevRating(star)}
                      style={{ color: star <= revRating ? 'var(--gold-primary)' : 'var(--text-muted)', padding: '0.2rem' }}
                    >
                      <Star size={24} fill={star <= revRating ? 'currentColor' : 'none'} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--gold-light)', display: 'block', marginBottom: '0.4rem' }}>
                  Review Headline
                </label>
                <input 
                  type="text" 
                  value={revTitle} 
                  onChange={e => setRevTitle(e.target.value)}
                  placeholder="e.g. Magnificent smoky projection"
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--gold-light)', display: 'block', marginBottom: '0.4rem' }}>
                  Detailed Scent Experience
                </label>
                <textarea 
                  rows={4} 
                  value={revComment} 
                  onChange={e => setRevComment(e.target.value)}
                  placeholder="Describe the opening, drydown, longevity, and compliments received..."
                  required
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <input 
                  type="checkbox" 
                  id="verified-check"
                  checked={revIsVerified} 
                  onChange={e => setRevIsVerified(e.target.checked)}
                />
                <label htmlFor="verified-check" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  I purchased and tested this fragrance formulation
                </label>
              </div>

              <button type="submit" className="btn-gold" disabled={submittingReview} style={{ marginTop: '0.5rem' }}>
                {submittingReview ? 'Submitting...' : 'Publish Scent Review'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
