import React from 'react';
import { Link } from 'react-router-dom';
import { X, Star, ShoppingBag, ArrowRight, RotateCcw, Scale } from 'lucide-react';
import { useCompare } from '../context/CompareContext';
import { useCart } from '../context/CartContext';
import { getAssetUrl, handleImageError } from '../utils/imageUrl';
import './Compare.css';

export const Compare: React.FC = () => {
  const { compareProducts, removeFromCompare, clearCompare, compareCount } = useCompare();
  const { addToCart } = useCart();

  if (compareCount === 0) {
    return (
      <div className="container compare-page">
        <div className="compare-empty-view">
          <Scale size={48} style={{ color: 'var(--gold-primary)', margin: '0 auto 1rem', opacity: 0.8 }} />
          <h3>No Fragrances Selected for Comparison</h3>
          <p style={{ maxWidth: '480px', margin: '0 auto 1.5rem', color: 'var(--text-muted)' }}>
            Select 2 to 4 perfumes across our collections to compare olfactory pyramid notes, price-per-milliliter, concentration, and performance side by side.
          </p>
          <Link to="/collections" className="btn-gold">
            Browse Collections <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="compare-page">
      <div className="container">
        <div className="compare-header-row">
          <div>
            <span className="section-eyebrow">Harmonic Comparison Matrix</span>
            <h1>Compare Fragrances ({compareCount}/4)</h1>
            <p>Evaluate distinctive formulations side by side using authoritative specifications.</p>
          </div>
          <div style={{ display: 'flex', gap: '0.8rem' }}>
            <button className="btn-outline" onClick={clearCompare}>
              <RotateCcw size={14} /> Clear Matrix
            </button>
            <Link to="/collections" className="btn-gold">
              Add Another Fragrance
            </Link>
          </div>
        </div>

        <div className="compare-table-wrapper">
          <table className="compare-table">
            <tbody>
              {/* Row 1: Header / Flacon Images */}
              <tr>
                <td className="compare-attr-label">Fragrance</td>
                {compareProducts.map(p => (
                  <td key={p.id} className="compare-product-col">
                    <div className="compare-card-header">
                      <button 
                        className="btn-remove-col"
                        onClick={() => removeFromCompare(p.id)}
                        title={`Remove ${p.name}`}
                        aria-label="Remove column"
                      >
                        <X size={16} />
                      </button>
                      <Link to={`/products/${p.id}`}>
                        <img 
                          src={getAssetUrl(p.mainImageUrl)} 
                          alt={p.name} 
                          className="compare-flacon-img" 
                          onError={handleImageError}
                        />
                      </Link>
                      <span className="compare-flacon-brand">{p.brandName}</span>
                      <h4 className="compare-flacon-title">
                        <Link to={`/products/${p.id}`}>{p.name}</Link>
                      </h4>
                      {p.variants && p.variants[0] && (
                        <button
                          className="btn-gold"
                          style={{ width: '100%', padding: '0.55rem', fontSize: '0.8rem' }}
                          onClick={() => addToCart(p, p.variants[0], 1)}
                        >
                          <ShoppingBag size={14} /> Add to Bag
                        </button>
                      )}
                    </div>
                  </td>
                ))}
              </tr>

              {/* Row 2: Price & Price Per Milliliter */}
              <tr>
                <td className="compare-attr-label">Price & Unit Value</td>
                {compareProducts.map(p => {
                  const defVar = (p.variants || [])[0];
                  const price = defVar ? defVar.price : 0;
                  const sizeMl = defVar ? defVar.sizeMl : 50;
                  const pricePerMl = sizeMl > 0 ? Math.round(price / sizeMl) : 0;

                  return (
                    <td key={p.id}>
                      <div className="compare-price-val">₹{price.toLocaleString()}</div>
                      <div className="compare-unit-price">₹{pricePerMl}/ml ({sizeMl}ml flacon)</div>
                    </td>
                  );
                })}
              </tr>

              {/* Row 3: Fragrance Family */}
              <tr>
                <td className="compare-attr-label">Fragrance Family</td>
                {compareProducts.map(p => (
                  <td key={p.id}>
                    <span className="badge-family">{p.fragranceFamily}</span>
                    {p.secondaryFamilies && p.secondaryFamilies.length > 0 && (
                      <div style={{ marginTop: '0.4rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        Sub-families: {p.secondaryFamilies.join(', ')}
                      </div>
                    )}
                  </td>
                ))}
              </tr>

              {/* Row 4: Concentration & Available Sizes */}
              <tr>
                <td className="compare-attr-label">Concentration & Sizes</td>
                {compareProducts.map(p => (
                  <td key={p.id} className="compare-cell-text">
                    <div><strong>{(p.variants || [])[0]?.concentration || 'Eau de Parfum'}</strong></div>
                    <div style={{ marginTop: '0.3rem', color: 'var(--text-muted)' }}>
                      Sizes: {(p.variants || []).map(v => `${v.sizeMl}ml`).join(' • ')}
                    </div>
                  </td>
                ))}
              </tr>

              {/* Row 5: Top Notes */}
              <tr>
                <td className="compare-attr-label">Top Notes (Opening)</td>
                {compareProducts.map(p => (
                  <td key={p.id}>
                    <div className="compare-notes-cell">
                      {(p.notes?.top || []).map((n, i) => (
                        <span key={i} className="compare-note-chip">
                          {typeof n === 'string' ? n : n.name}
                        </span>
                      ))}
                    </div>
                  </td>
                ))}
              </tr>

              {/* Row 6: Heart Notes */}
              <tr>
                <td className="compare-attr-label">Heart Notes (Core)</td>
                {compareProducts.map(p => (
                  <td key={p.id}>
                    <div className="compare-notes-cell">
                      {(p.notes?.heart || []).map((n, i) => (
                        <span key={i} className="compare-note-chip">
                          {typeof n === 'string' ? n : n.name}
                        </span>
                      ))}
                    </div>
                  </td>
                ))}
              </tr>

              {/* Row 7: Base Notes */}
              <tr>
                <td className="compare-attr-label">Base Notes (Drydown)</td>
                {compareProducts.map(p => (
                  <td key={p.id}>
                    <div className="compare-notes-cell">
                      {(p.notes?.base || []).map((n, i) => (
                        <span key={i} className="compare-note-chip">
                          {typeof n === 'string' ? n : n.name}
                        </span>
                      ))}
                    </div>
                  </td>
                ))}
              </tr>

              {/* Row 8: Character Descriptors */}
              <tr>
                <td className="compare-attr-label">Scent Profile</td>
                {compareProducts.map(p => (
                  <td key={p.id} className="compare-cell-text">
                    {(p.characterDescriptors || []).join(' • ')}
                  </td>
                ))}
              </tr>

              {/* Row 9: Longevity & Intensity */}
              <tr>
                <td className="compare-attr-label">Tenacity & Intensity</td>
                {compareProducts.map(p => (
                  <td key={p.id} className="compare-cell-text">
                    <div><strong>Longevity:</strong> {p.longevity || '8-10 Hours'}</div>
                    <div style={{ marginTop: '0.2rem' }}><strong>Intensity:</strong> {p.intensity || 'Moderate'}</div>
                    <div style={{ marginTop: '0.2rem' }}><strong>Sillage:</strong> {p.sillage || 'Moderate'}</div>
                  </td>
                ))}
              </tr>

              {/* Row 10: Occasions & Seasons */}
              <tr>
                <td className="compare-attr-label">Best Occasions</td>
                {compareProducts.map(p => (
                  <td key={p.id} className="compare-cell-text">
                    <div>{(p.occasions || []).join(', ')}</div>
                    <div style={{ color: 'var(--text-muted)', marginTop: '0.3rem', fontSize: '0.8rem' }}>
                      Seasons: {(p.seasons || []).join(', ')}
                    </div>
                  </td>
                ))}
              </tr>

              {/* Row 11: Ratings */}
              <tr>
                <td className="compare-attr-label">Client Rating</td>
                {compareProducts.map(p => (
                  <td key={p.id}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--gold-primary)' }}>
                      <Star size={15} fill="currentColor" />
                      <strong>{p.rating ? p.rating.toFixed(1) : '5.0'}</strong>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>({p.reviewCount || 0} reviews)</span>
                    </div>
                  </td>
                ))}
              </tr>

              {/* Row 12: Availability */}
              <tr>
                <td className="compare-attr-label">Availability</td>
                {compareProducts.map(p => {
                  const inStock = (p.variants || []).some(v => v.stockQuantity > 0);
                  return (
                    <td key={p.id}>
                      {inStock ? (
                        <span className="badge-instock">In Stock</span>
                      ) : (
                        <span style={{ color: 'var(--danger)', fontSize: '0.82rem' }}>Out of Stock</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Compare;
