import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  ArrowRight, 
  Compass, 
  ShieldCheck, 
  PackageCheck, 
  Truck, 
  Droplet, 
  Flame, 
  Trees, 
  Flower2, 
  Sun, 
  Waves, 
  Coffee 
} from 'lucide-react';
import { fetchProducts, fetchFamilies } from '../api/products';
import type { Product, FragranceFamily } from '../types';
import ProductCard from '../components/ProductCard';
import './Home.css';

export const Home: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [families, setFamilies] = useState<FragranceFamily[]>([]);
  const [selectedFamily, setSelectedFamily] = useState('All');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        const [prodRes, famRes] = await Promise.all([
          fetchProducts({ limit: 8 }),
          fetchFamilies()
        ]);
        if (prodRes.success && prodRes.data) {
          setProducts(prodRes.data);
        }
        if (famRes.success && famRes.data) {
          setFamilies(famRes.data);
        }
      } catch (err) {
        console.error('Failed to load home data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadInitialData();
  }, []);

  const handleFamilyFilter = async (family: string) => {
    setSelectedFamily(family);
    try {
      setLoading(true);
      const res = await fetchProducts({
        family: family === 'All' ? undefined : family,
        limit: 8
      });
      if (res.success && res.data) {
        setProducts(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getFamilyIcon = (famId: string) => {
    switch (famId.toLowerCase()) {
      case 'woody': return <Trees size={22} />;
      case 'floral': return <Flower2 size={22} />;
      case 'citrus': return <Sun size={22} />;
      case 'oriental': return <Flame size={22} />;
      case 'aquatic': return <Waves size={22} />;
      case 'gourmand': return <Coffee size={22} />;
      default: return <Droplet size={22} />;
    }
  };

  return (
    <div className="home-page">
      {/* 1. Hero Section */}
      <section className="hero-luxury">
        <div className="container hero-grid">
          <div className="hero-content">
            <div className="hero-eyebrow">
              <Sparkles size={14} /> Haute Parfumerie Decoded
            </div>
            <h1 className="hero-title">
              Discover Fragrance Through <em>Pure Olfactory Truth</em>
            </h1>
            <p className="hero-description">
              Step beyond generic photography into structured scent journeys. Explore nuanced pyramid notes, concentration benchmarks, transparent verified formulations, and our risk-free complimentary tester vial promise.
            </p>
            <div className="hero-actions">
              <Link to="/collections" className="btn-gold">
                Explore Fragrances <ArrowRight size={17} />
              </Link>
              <Link to="/scent-finder" className="btn-outline">
                <Compass size={17} /> Scent Finder Quiz
              </Link>
            </div>

            <div className="hero-stats-row">
              <div className="hero-stat-item">
                <h4>8+</h4>
                <span>Master Ateliers</span>
              </div>
              <div className="hero-stat-item">
                <h4>100%</h4>
                <span>Authentic Sourcing</span>
              </div>
              <div className="hero-stat-item">
                <h4>2ml</h4>
                <span>Included Sample Vial</span>
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-visual-card">
              <img 
                src="https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=900" 
                alt="Noir Absolu Luxury Flacon" 
              />
              <div className="hero-floating-glass-badge">
                <div>
                  <h4 className="badge-info-name">Noir Absolu Extrait</h4>
                  <p className="badge-info-sub">Calabrian Bergamot • Cambodian Oud • Amber</p>
                </div>
                <Link to="/products/prod-1" className="btn-gold" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>
                  Inspect
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Scent Families Carousel / Grid */}
      <section className="families-section">
        <div className="container">
          <div className="section-heading-centered">
            <span className="section-eyebrow">The Olfactory Taxonomy</span>
            <h2>Explore by Fragrance Family</h2>
            <p>Every scent belongs to an ancient tradition of perfumery. Discover which harmonic family resonates with your personal chemistry.</p>
          </div>

          <div className="families-grid">
            {families.map(fam => (
              <div 
                key={fam.id} 
                className="family-card"
                onClick={() => navigate(`/collections?family=${fam.id}`)}
                role="button"
                tabIndex={0}
              >
                <div>
                  <div className="family-card-icon">
                    {getFamilyIcon(fam.id)}
                  </div>
                  <h3>{fam.name}</h3>
                  <p>{fam.description}</p>
                </div>
                <span className="family-card-link">
                  Browse {fam.name} <ArrowRight size={14} />
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Curated Signature Collection */}
      <section className="curated-section">
        <div className="container">
          <div className="curated-header-flex">
            <div>
              <span className="section-eyebrow">Curated Formulations</span>
              <h2>Signature Ateliers</h2>
            </div>

            <div className="family-filter-pills">
              {['All', 'Woody', 'Floral', 'Citrus', 'Oriental', 'Aquatic', 'Gourmand'].map(f => (
                <button
                  key={f}
                  className={`family-pill ${selectedFamily === f ? 'active' : ''}`}
                  onClick={() => handleFamilyFilter(f)}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
              Preparing sensory collection...
            </div>
          ) : (
            <div className="products-grid-home">
              {products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 4. Scent Finder Prompt Banner */}
      <div className="container">
        <section className="scent-finder-banner">
          <div className="scent-finder-content">
            <span className="section-eyebrow">Guided Recommendation Engine</span>
            <h2>Unsure Where to Begin?</h2>
            <p>
              Our interactive Scent Finder translates your lifestyle, preferred notes, desired intensity, and occasion into a deterministic weighted olfactory match. No algorithms that guess your mood—only traceable, verified aromatic affinities.
            </p>
            <Link to="/scent-finder" className="btn-gold">
              Start Scent Finder Quiz <ArrowRight size={17} />
            </Link>
          </div>
          <div style={{ textAlign: 'center' }}>
            <Compass size={140} style={{ color: 'var(--gold-primary)', opacity: 0.85 }} />
          </div>
        </section>
      </div>

      {/* 5. Trust Pillars Grid */}
      <section className="trust-pillars-section">
        <div className="container">
          <div className="trust-pillars-grid">
            <div className="trust-pillar-item">
              <div className="trust-pillar-icon">
                <Sparkles size={24} />
              </div>
              <h4>2ml Tester Promise</h4>
              <p>Every bottle includes an identical 2ml vial. Test on skin first; if it doesn't captivate you, return the sealed full bottle for a 100% refund.</p>
            </div>

            <div className="trust-pillar-item">
              <div className="trust-pillar-icon">
                <ShieldCheck size={24} />
              </div>
              <h4>100% Authentic Ateliers</h4>
              <p>Direct verified sourcing from master perfumers in Grasse, Florence, Dubai, and Paris. Zero parallel imports, zero compromises.</p>
            </div>

            <div className="trust-pillar-item">
              <div className="trust-pillar-icon">
                <PackageCheck size={24} />
              </div>
              <h4>IFRA Certified Safety</h4>
              <p>Every formulation strictly complies with international cosmetic safety standards with complete pyramid disclosures.</p>
            </div>

            <div className="trust-pillar-item">
              <div className="trust-pillar-icon">
                <Truck size={24} />
              </div>
              <h4>Express Insured Delivery</h4>
              <p>Complimentary express shipping on orders over ₹2,000. Temperature-controlled packaging protects delicate fragrance molecules.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
