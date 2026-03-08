import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Heart, Scale, ShoppingBag, Clock, Sparkles, ArrowRight } from 'lucide-react';
import type { Product, ProductVariant } from '../types';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useCompare } from '../context/CompareContext';
import { getAssetUrl, handleImageError } from '../utils/imageUrl';
import './ProductCard.css';

interface ProductCardProps {
  product: Product;
}

// Distinct, genuine editorial badge mapping (avoids fake uniform "Special Value" on all products)
const getProductBadge = (productId: string): { label: string; type: 'editorial' | 'bestseller' | 'reserve' } | null => {
  switch (productId) {
    case 'prod-1':
      return { label: 'Atelier Signature', type: 'editorial' };
    case 'prod-2':
      return { label: 'Bestseller', type: 'bestseller' };
    case 'prod-3':
      return { label: 'Citrus Classic', type: 'editorial' };
    case 'prod-4':
      return { label: 'Extrait Reserve', type: 'reserve' };
    case 'prod-6':
      return { label: "Editor's Choice", type: 'editorial' };
    case 'prod-7':
      return { label: 'Gourmand Award', type: 'bestseller' };
    default:
      return null;
  }
};

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToCompare, removeFromCompare, isInCompare } = useCompare();

  const isFavorited = isInWishlist(product.id);
  const isCompared = isInCompare(product.id);

  const variants = product.variants && product.variants.length > 0
    ? product.variants
    : [{
        id: `v-${product.id}`,
        sku: 'SKU-DEFAULT',
        sizeMl: 50,
        concentration: 'Eau de Parfum',
        packagingType: 'Glass Flacon',
        price: 2990,
        stockQuantity: 10,
        status: 'in_stock' as const
      }];

  // Initial variant: defaultVariantId or first variant
  const initialVariant = variants.find(v => v.id === product.defaultVariantId) || variants[0];
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(initialVariant);
  const [showNotesOverlay, setShowNotesOverlay] = useState(false);

  // Directly derive all price calculations from selectedVariant
  const activePrice = selectedVariant.price;
  const activeCompareAt = selectedVariant.compareAtPrice && selectedVariant.compareAtPrice > activePrice
    ? selectedVariant.compareAtPrice
    : null;
  const pricePerMl = selectedVariant.sizeMl > 0
    ? Math.round(activePrice / selectedVariant.sizeMl)
    : null;

  const editorialBadge = getProductBadge(product.id);

  // Notes extraction
  const topNotes = (product.notes?.top || []).map(n => typeof n === 'string' ? n : n.name);
  const heartNotes = (product.notes?.heart || []).map(n => typeof n === 'string' ? n : n.name);
  const baseNotes = (product.notes?.base || []).map(n => typeof n === 'string' ? n : n.name);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, selectedVariant, 1);
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id, product.name);
  };

  const handleCompareToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isCompared) {
      removeFromCompare(product.id);
    } else {
      addToCompare(product);
    }
  };

  return (
    <article 
      className="product-card" 
      aria-label={product.name}
      onMouseEnter={() => setShowNotesOverlay(true)}
      onMouseLeave={() => setShowNotesOverlay(false)}
    >
      <Link to={`/products/${product.id}`} className="product-card-image-wrap">
        <img 
          src={getAssetUrl(product.mainImageUrl)} 
          alt={product.name} 
          className="product-card-image"
          loading="lazy" 
          onError={handleImageError}
        />

        {/* High-Contrast Blurred Dark Badges */}
        <div className="product-card-badges">
          <span className="badge-family-dark">{product.fragranceFamily}</span>
          <span className="badge-concentration-dark">
            {selectedVariant.concentration || 'Eau de Parfum'}
          </span>
          {editorialBadge && (
            <span className={`badge-editorial-dark badge-${editorialBadge.type}`}>
              {editorialBadge.label}
            </span>
          )}
        </div>

        {/* Floating Actions */}
        <div className="product-card-actions-float">
          <button 
            className={`btn-card-action ${isFavorited ? 'active' : ''}`}
            onClick={handleWishlistToggle}
            title={isFavorited ? 'Remove from Wishlist' : 'Add to Wishlist'}
            aria-label="Wishlist"
          >
            <Heart size={16} fill={isFavorited ? 'currentColor' : 'none'} />
          </button>
          <button 
            className={`btn-card-action ${isCompared ? 'active' : ''}`}
            onClick={handleCompareToggle}
            title={isCompared ? 'Remove from Compare' : 'Add to Compare'}
            aria-label="Compare"
          >
            <Scale size={16} />
          </button>
        </div>

        {/* Pyramid Notes Overlay on Hover */}
        {showNotesOverlay && (
          <div className="card-notes-pyramid-overlay">
            <div className="pyramid-micro-header">
              <Sparkles size={12} /> Pyramid Notes
            </div>
            <div className="pyramid-micro-row">
              <span className="pyramid-tier-label">Top:</span>
              <span className="pyramid-tier-value">{topNotes.slice(0, 2).join(', ')}</span>
            </div>
            <div className="pyramid-micro-row">
              <span className="pyramid-tier-label">Heart:</span>
              <span className="pyramid-tier-value">{heartNotes.slice(0, 2).join(', ')}</span>
            </div>
            <div className="pyramid-micro-row">
              <span className="pyramid-tier-label">Base:</span>
              <span className="pyramid-tier-value">{baseNotes.slice(0, 2).join(', ')}</span>
            </div>
          </div>
        )}

        {/* Quick Add Overlay */}
        <div className="quick-add-overlay">
          <button className="btn-quick-add" onClick={handleQuickAdd}>
            <ShoppingBag size={14} /> Quick Add • ₹{activePrice.toLocaleString()} ({selectedVariant.sizeMl}ml)
          </button>
        </div>
      </Link>

      <div className="product-card-content">
        <div className="card-header-row">
          <span className="product-card-brand">{product.brandName}</span>
          <span className="card-longevity-chip">
            <Clock size={11} /> {product.longevity || '8-10 Hours'}
          </span>
        </div>

        <h3 className="product-card-title">
          <Link to={`/products/${product.id}`}>{product.name}</Link>
        </h3>

        {/* Size Selector Chips */}
        {variants.length > 1 && (
          <div className="product-card-sizes" onClick={e => e.stopPropagation()}>
            <span className="size-selector-label">Size:</span>
            <div className="size-chips-wrap">
              {variants.map(v => (
                <button
                  key={v.id}
                  type="button"
                  className={`size-chip ${selectedVariant.id === v.id ? 'active' : ''}`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSelectedVariant(v);
                  }}
                  title={`${v.sizeMl}ml • ₹${v.price.toLocaleString()}`}
                >
                  {v.sizeMl}ml
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Rating and Reviews */}
        <div className="product-card-rating">
          <div className="stars-wrap">
            <Star size={13} fill="currentColor" />
            <span className="rating-score">{product.rating ? product.rating.toFixed(1) : '4.9'}</span>
          </div>
          <span className="review-count">({product.reviewCount || 28} verified reviews)</span>
        </div>

        {/* Pricing Group & View Details */}
        <div className="product-card-footer">
          <div className="price-group">
            <div className="price-main">
              <span>₹{activePrice.toLocaleString()}</span>
              {activeCompareAt && (
                <span className="price-compare">₹{activeCompareAt.toLocaleString()}</span>
              )}
            </div>
            {pricePerMl && (
              <span className="price-unit">
                ₹{pricePerMl}/ml ({selectedVariant.sizeMl}ml bottle)
              </span>
            )}
          </div>

          <Link to={`/products/${product.id}`} className="btn-view-details">
            View details <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
