import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ArrowRight } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { fetchProducts } from '../api/products';
import type { Product } from '../types';
import ProductCard from '../components/ProductCard';
import './Wishlist.css';

export const Wishlist: React.FC = () => {
  const { wishlistIds } = useWishlist();
  const [favoriteProducts, setFavoriteProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFavorites = async () => {
      try {
        setLoading(true);
        const res = await fetchProducts();
        if (res.success && res.data) {
          const matched = res.data.filter(p => wishlistIds.includes(p.id));
          setFavoriteProducts(matched);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadFavorites();
  }, [wishlistIds]);

  return (
    <div className="wishlist-page">
      <div className="container">
        <div className="wishlist-header">
          <span className="section-eyebrow">Personal Sanctuary</span>
          <h1>My Saved Fragrances ({wishlistIds.length})</h1>
          <p>Revisit and curate your preferred olfactory creations.</p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--text-muted)' }}>
            Retrieving saved fragrances...
          </div>
        ) : favoriteProducts.length === 0 ? (
          <div className="wishlist-empty-box">
            <Heart size={44} style={{ color: 'var(--gold-primary)', margin: '0 auto 1rem', opacity: 0.8 }} />
            <h3>Your Wishlist is Empty</h3>
            <p style={{ maxWidth: '440px', margin: '0 auto 1.5rem', color: 'var(--text-muted)' }}>
              Explore our artisanal catalog and tap the heart icon on any fragrance to save it for future exploration.
            </p>
            <Link to="/collections" className="btn-gold">
              Explore Collections <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <div className="wishlist-grid">
            {favoriteProducts.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
