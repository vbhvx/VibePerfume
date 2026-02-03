import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, X, Scale } from 'lucide-react';
import { useCompare } from '../context/CompareContext';
import { getAssetUrl, handleImageError } from '../utils/imageUrl';
import './CompareBar.css';

export const CompareBar: React.FC = () => {
  const { compareProducts, removeFromCompare, clearCompare, compareCount } = useCompare();
  const navigate = useNavigate();

  if (compareCount === 0) return null;

  return (
    <div className="compare-bar-container" role="region" aria-label="Compare fragrances bar">
      <div className="compare-bar-left">
        <div className="compare-bar-title">
          <Scale size={18} />
          <span>Compare ({compareCount}/4)</span>
        </div>

        <div className="compare-thumbs-list">
          {compareProducts.map(p => (
            <div key={p.id} className="compare-thumb-wrapper" title={`${p.name} - Click to remove`}>
              <img 
                src={getAssetUrl(p.mainImageUrl)} 
                alt={p.name} 
                className="compare-thumb-img" 
                onError={handleImageError}
              />
              <button 
                className="compare-thumb-remove" 
                onClick={() => removeFromCompare(p.id)}
                aria-label={`Remove ${p.name}`}
              >
                <X size={14} />
              </button>
            </div>
          ))}

          {/* Empty placeholder slots */}
          {Array.from({ length: Math.max(0, 4 - compareCount) }).map((_, i) => (
            <div key={i} className="compare-empty-slot" title="Add up to 4 fragrances">
              +
            </div>
          ))}
        </div>
      </div>

      <div className="compare-bar-actions">
        <button className="btn-clear-compare" onClick={clearCompare}>
          Clear
        </button>
        <button 
          className="btn-gold btn-go-compare" 
          onClick={() => navigate('/compare')}
        >
          Compare Now <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
};

export default CompareBar;
