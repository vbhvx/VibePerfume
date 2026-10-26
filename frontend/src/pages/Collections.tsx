import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, X, RotateCcw } from 'lucide-react';
import { fetchProducts, fetchFamilies, fetchBrands, fetchNotes } from '../api/products';
import type { Product, FragranceFamily, Brand, NoteGlossaryItem } from '../types';
import ProductCard from '../components/ProductCard';
import './Collections.css';

export const Collections: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [families, setFamilies] = useState<FragranceFamily[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [notes, setNotes] = useState<NoteGlossaryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Filter states from URL or defaults
  const queryParam = searchParams.get('q') || '';
  const familyParam = searchParams.get('family') || 'All';
  const brandParam = searchParams.get('brand') || 'All';
  const noteParam = searchParams.get('note') || '';
  const minPriceParam = searchParams.get('minPrice') || '';
  const maxPriceParam = searchParams.get('maxPrice') || '';
  const inStockParam = searchParams.get('inStock') === 'true';
  const sortParam = searchParams.get('sort') || 'featured';

  // Load taxonomies on mount
  useEffect(() => {
    const loadTaxonomies = async () => {
      try {
        const [famRes, brandRes, noteRes] = await Promise.all([
          fetchFamilies(),
          fetchBrands(),
          fetchNotes()
        ]);
        if (famRes.success && famRes.data) setFamilies(famRes.data);
        if (brandRes.success && brandRes.data) setBrands(brandRes.data);
        if (noteRes.success && noteRes.data) setNotes(noteRes.data.slice(0, 15));
      } catch (err) {
        console.error(err);
      }
    };
    loadTaxonomies();
  }, []);

  // Fetch filtered products whenever search params change
  useEffect(() => {
    const loadFilteredProducts = async () => {
      try {
        setLoading(true);
        const filters: Record<string, any> = {
          q: queryParam,
          family: familyParam !== 'All' ? familyParam : undefined,
          brand: brandParam !== 'All' ? brandParam : undefined,
          note: noteParam || undefined,
          minPrice: minPriceParam || undefined,
          maxPrice: maxPriceParam || undefined,
          inStock: inStockParam ? 'true' : undefined,
          sort: sortParam
        };
        const res = await fetchProducts(filters);
        if (res.success && res.data) {
          setProducts(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadFilteredProducts();
  }, [searchParams]);

  const updateFilter = (key: string, value: string | boolean) => {
    const newParams = new URLSearchParams(searchParams);
    if (!value || value === 'All') {
      newParams.delete(key);
    } else {
      newParams.set(key, String(value));
    }
    setSearchParams(newParams);
  };

  const resetAllFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  return (
    <div className="catalog-page">
      <div className="container">
        <div className="catalog-header">
          <h1>Curated Fragrance Archive</h1>
          <p>
            Explore distinctive olfactory creations categorized by family, master atelier, and signature pyramid notes.
          </p>
        </div>

        <div className="catalog-layout">
          {/* Sidebar */}
          <aside className={`catalog-sidebar ${mobileFilterOpen ? 'mobile-open' : ''}`}>
            <div className="sidebar-header">
              <h3>Refine Fragrances</h3>
              <button className="btn-reset-filters" onClick={resetAllFilters}>
                Reset All
              </button>
              {mobileFilterOpen && (
                <button 
                  onClick={() => setMobileFilterOpen(false)} 
                  style={{ color: '#fff', padding: '0.4rem' }}
                  aria-label="Close filters"
                >
                  <X size={20} />
                </button>
              )}
            </div>

            {/* In Stock Only */}
            <div className="filter-group">
              <label className="filter-checkbox-label">
                <input 
                  type="checkbox"
                  checked={inStockParam}
                  onChange={e => updateFilter('inStock', e.target.checked)}
                />
                <span>In Stock Only</span>
              </label>
            </div>

            {/* Fragrance Family */}
            <div className="filter-group">
              <span className="filter-label">Fragrance Family</span>
              <div className="filter-options-list">
                <label className="filter-checkbox-label">
                  <input 
                    type="radio" 
                    name="family"
                    checked={familyParam === 'All'}
                    onChange={() => updateFilter('family', 'All')}
                  />
                  <span>All Families</span>
                </label>
                {families.map(fam => (
                  <label key={fam.id} className="filter-checkbox-label">
                    <input 
                      type="radio" 
                      name="family"
                      checked={familyParam.toLowerCase() === fam.id.toLowerCase()}
                      onChange={() => updateFilter('family', fam.id)}
                    />
                    <span>{fam.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Atelier / Brand */}
            <div className="filter-group">
              <span className="filter-label">Master Brand / Atelier</span>
              <div className="filter-options-list">
                <label className="filter-checkbox-label">
                  <input 
                    type="radio" 
                    name="brand"
                    checked={brandParam === 'All'}
                    onChange={() => updateFilter('brand', 'All')}
                  />
                  <span>All Brands</span>
                </label>
                {brands.map(b => (
                  <label key={b.id} className="filter-checkbox-label">
                    <input 
                      type="radio" 
                      name="brand"
                      checked={brandParam === b.id}
                      onChange={() => updateFilter('brand', b.id)}
                    />
                    <span>{b.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Note Filter */}
            <div className="filter-group">
              <span className="filter-label">Key Scent Note</span>
              <select 
                value={noteParam} 
                onChange={e => updateFilter('note', e.target.value)}
                style={{ width: '100%', fontSize: '0.85rem' }}
              >
                <option value="">All Notes</option>
                {notes.map(n => (
                  <option key={n.name} value={n.name}>
                    {n.name} ({n.category})
                  </option>
                ))}
              </select>
            </div>

            {/* Price Filter */}
            <div className="filter-group">
              <span className="filter-label">Price Range (₹)</span>
              <div className="price-inputs-row">
                <input 
                  type="number"
                  placeholder="Min"
                  value={minPriceParam}
                  onChange={e => updateFilter('minPrice', e.target.value)}
                  className="price-input"
                />
                <span style={{ color: 'var(--text-muted)' }}>–</span>
                <input 
                  type="number"
                  placeholder="Max"
                  value={maxPriceParam}
                  onChange={e => updateFilter('maxPrice', e.target.value)}
                  className="price-input"
                />
              </div>
            </div>
          </aside>

          {/* Main Catalog View */}
          <main>
            <div className="catalog-controls-bar">
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button 
                  className="mobile-filter-trigger"
                  onClick={() => setMobileFilterOpen(true)}
                >
                  <Filter size={16} /> Filters
                </button>
                <span className="catalog-count-text">
                  Showing <strong>{products.length}</strong> {products.length === 1 ? 'fragrance' : 'fragrances'}
                  {queryParam && ` matching "${queryParam}"`}
                  {familyParam !== 'All' && ` in ${familyParam}`}
                </span>
              </div>

              <div className="catalog-sort-group">
                <span className="sort-label">Sort by:</span>
                <select 
                  value={sortParam} 
                  onChange={e => updateFilter('sort', e.target.value)}
                  className="sort-select"
                >
                  <option value="featured">Featured Curations</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                  <option value="newest">Newest Launch</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--text-muted)' }}>
                Filtering olfactory archive...
              </div>
            ) : products.length === 0 ? (
              <div className="catalog-empty">
                <h3>No Fragrances Match Your Filter Criteria</h3>
                <p>Try adjusting your price range, selected notes, or fragrance family.</p>
                <button 
                  className="btn-gold" 
                  style={{ marginTop: '1.2rem' }}
                  onClick={resetAllFilters}
                >
                  <RotateCcw size={16} /> Reset All Filters
                </button>
              </div>
            ) : (
              <div className="catalog-grid">
                {products.map(p => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Collections;
