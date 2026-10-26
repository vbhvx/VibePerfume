import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, ArrowRight, Sparkles } from 'lucide-react';
import { fetchProducts } from '../api/products';
import type { Product } from '../types';
import './SearchModal.css';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const trendingSearches = [
    'Smoky Oud',
    'Bulgarian Rose',
    'Madagascar Vanilla',
    'Amalfi Citrus',
    'Pacific Sea Salt',
    'Australian Sandalwood'
  ];

  useEffect(() => {
    if (!isOpen) {
      setSearchTerm('');
      setResults([]);
      return;
    }

    const handler = setTimeout(async () => {
      if (searchTerm.trim().length > 1) {
        setLoading(true);
        try {
          const res = await fetchProducts({ q: searchTerm.trim(), limit: 6 });
          if (res.success && res.data) {
            setResults(res.data);
          }
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      } else {
        setResults([]);
      }
    }, 200);

    return () => clearTimeout(handler);
  }, [searchTerm, isOpen]);

  if (!isOpen) return null;

  const handleSelectProduct = (product: Product) => {
    onClose();
    navigate(`/products/${product.id}`);
  };

  const handleTagClick = (tag: string) => {
    setSearchTerm(tag);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'Enter' && searchTerm.trim()) {
      onClose();
      navigate(`/collections?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  return (
    <div className="search-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-label="Search Fragrances">
      <div className="search-modal-card" onClick={e => e.stopPropagation()}>
        <div className="search-input-wrapper">
          <Search size={22} className="search-icon" />
          <input 
            type="text"
            className="search-main-input"
            placeholder="Search fragrances, notes (Oud, Rose, Vanilla), or brands..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
          />
          <button className="search-close-btn" onClick={onClose} aria-label="Close search">
            <X size={20} />
          </button>
        </div>

        <div className="search-results-area">
          {searchTerm.trim().length <= 1 ? (
            <div>
              <div className="search-suggestions-title">Trending Scent Inquiries</div>
              <div className="search-tags-row">
                {trendingSearches.map(tag => (
                  <button 
                    key={tag} 
                    className="search-tag-chip"
                    onClick={() => handleTagClick(tag)}
                  >
                    <Sparkles size={13} style={{ display: 'inline', marginRight: 4, verticalAlign: -1 }} />
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          ) : loading ? (
            <div className="search-no-results">Searching olfactory archive...</div>
          ) : results.length > 0 ? (
            <div>
              <div className="search-suggestions-title">Fragrance Matches ({results.length})</div>
              <div className="search-results-list">
                {results.map(product => {
                  const lowestPrice = Math.min(...(product.variants || []).map(v => v.price));
                  const topNotesStr = (product.notes?.top || []).map(n => typeof n === 'string' ? n : n.name).slice(0, 2).join(', ');

                  return (
                    <div 
                      key={product.id} 
                      className="search-result-item"
                      onClick={() => handleSelectProduct(product)}
                      role="button"
                      tabIndex={0}
                    >
                      <img src={product.mainImageUrl} alt={product.name} className="search-result-img" />
                      <div className="search-result-info">
                        <div className="search-result-brand">{product.brandName} • {product.fragranceFamily}</div>
                        <div className="search-result-name">{product.name}</div>
                        {topNotesStr && <div className="search-result-notes">Opening: {topNotesStr}</div>}
                      </div>
                      <div className="search-result-price">
                        From ₹{lowestPrice.toLocaleString()}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="search-no-results">
              No matching fragrances found for "{searchTerm}".
              <br />
              <button 
                className="btn-text" 
                style={{ marginTop: '0.8rem' }}
                onClick={() => { onClose(); navigate('/collections'); }}
              >
                Browse all collections <ArrowRight size={14} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchModal;
