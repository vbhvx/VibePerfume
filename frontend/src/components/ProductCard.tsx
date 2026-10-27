import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Heart, Scale, ShoppingBag } from 'lucide-react';
import type { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useCompare } from '../context/CompareContext';
import { getAssetUrl, handleImageError } from '../utils/imageUrl';
import './ProductCard.css';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToCompare, removeFromCompare, isInCompare } = useCompare();

  const isFavorited = isInWishlist(product.id);
  const isCompared = isInCompare(product.id);

  // Determine lowest price and default variant
  const variants = product.variants || [];
  const defaultVariant = variants.find(v => v.id === product.defaultVariantId) || variants[0] || {
    id: `v-${product.id}`,
    sku: 'SKU',
    sizeMl: 50,
    concentration: 'Eau de Parfum',
    packagingType: 'Flacon',
    price: 2990,
    stockQuantity: 10,
    status: 'in_stock' as const
  };

  const lowestPrice = Math.min(...variants.map(v => v.price), defaultVariant.price);
  const compareAtPrice = defaultVariant.compareAtPrice;
  const pricePerMl = defaultVariant.sizeMl > 0 ? Math.round(defaultVariant.price / defaultVariant.sizeMl) : null;

  // Extract top 3 note names for preview
  const topNotesList = (product.notes?.top || []).slice(0, 3).map(n => typeof n === 'string' ? n : n.name);
  const notesTeaser = topNotesList.join(' • ');

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, defaultVariant, 1);
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
    <article className="product-card" aria-label={product.name}>
      <Link to={`/products/${product.id}`} className="product-card-image-wrap">
        <img 
          src={getAssetUrl(product.mainImageUrl)} 
          alt={product.name} 
          className="product-card-image"
          loading="lazy" 
          onError={handleImageError}
        />

        {/* Badges */}
        <div className="product-card-badges">
          <span className="badge-family">{product.fragranceFamily}</span>
          {compareAtPrice && compareAtPrice > defaultVariant.price && (
            <span className="badge-gold">Special Value</span>
          )}
        </div>

        {/* Floating actions */}
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

        {/* Quick Add Overlay */}
        <div className="quick-add-overlay">
          <button className="btn-quick-add" onClick={handleQuickAdd}>
            <ShoppingBag size={15} /> Quick Add • ₹{defaultVariant.price.toLocaleString()}
          </button>
        </div>
      </Link>

      <div className="product-card-content">
        <span className="product-card-brand">{product.brandName}</span>
        <h3 className="product-card-title">
          <Link to={`/products/${product.id}`}>{product.name}</Link>
        </h3>

        {notesTeaser && (
          <div className="product-card-notes-preview" title={notesTeaser}>
            {notesTeaser}
          </div>
        )}

        <div className="product-card-rating">
          <Star size={14} />
          <span>{product.rating ? product.rating.toFixed(1) : '5.0'}</span>
          <span style={{ color: 'var(--text-muted)' }}>({product.reviewCount || 0})</span>
        </div>

        <div className="product-card-footer">
          <div className="price-group">
            <div className="price-main">
              <span>₹{lowestPrice.toLocaleString()}</span>
              {compareAtPrice && compareAtPrice > lowestPrice && (
                <span className="price-compare">₹{compareAtPrice.toLocaleString()}</span>
              )}
            </div>
            {pricePerMl && (
              <span className="price-unit">₹{pricePerMl}/ml ({defaultVariant.sizeMl}ml)</span>
            )}
          </div>

          <span className="stock-indicator">
            {defaultVariant.stockQuantity <= 5 ? (
              <span style={{ color: '#fbbf24' }}>Only {defaultVariant.stockQuantity} left</span>
            ) : (
              'In Stock'
            )}
          </span>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
