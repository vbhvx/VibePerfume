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
  Coffee,
  Star,
  CheckCircle2,
  ChevronDown,
  Gift,
  Zap,
  ShoppingBag,
  RotateCcw
} from 'lucide-react';
import { fetchProducts, fetchFamilies } from '../api/products';
import type { Product, FragranceFamily } from '../types';
import ProductCard from '../components/ProductCard';
import { getAssetUrl } from '../utils/imageUrl';
import { useCart } from '../context/CartContext';
import './Home.css';

interface QuizAnswers {
  vibe: string;
  intensity: string;
  occasion: string;
}

export const Home: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [families, setFamilies] = useState<FragranceFamily[]>([]);
  const [selectedFamily, setSelectedFamily] = useState('All');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { addToCart } = useCart();

  // Mini Quiz State
  const [quizStep, setQuizStep] = useState(1);
  const [quizAnswers, setQuizAnswers] = useState<QuizAnswers>({
    vibe: '',
    intensity: '',
    occasion: ''
  });
  const [quizResult, setQuizResult] = useState<Product | null>(null);

  // FAQ Accordion State
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

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
      case 'spicy': return <Zap size={22} />;
      default: return <Droplet size={22} />;
    }
  };

  // Mini Quiz Handler
  const handleQuizAnswer = (field: keyof QuizAnswers, value: string) => {
    const newAnswers = { ...quizAnswers, [field]: value };
    setQuizAnswers(newAnswers);

    if (quizStep < 3) {
      setQuizStep(quizStep + 1);
    } else {
      // Calculate match
      calculateQuizMatch(newAnswers);
    }
  };

  const calculateQuizMatch = (answers: QuizAnswers) => {
    if (!products.length) return;
    
    let matched = products[0]; // fallback
    if (answers.vibe === 'Warm & Seductive' || answers.vibe === 'Smoky & Regal') {
      matched = products.find(p => p.id === 'prod-1') || products.find(p => p.id === 'prod-4') || products[0];
    } else if (answers.vibe === 'Fresh & Citrus') {
      matched = products.find(p => p.id === 'prod-3') || products.find(p => p.id === 'prod-5') || products[2];
    } else if (answers.vibe === 'Floral & Romantic') {
      matched = products.find(p => p.id === 'prod-2') || products[1];
    } else if (answers.vibe === 'Cozy & Gourmand') {
      matched = products.find(p => p.id === 'prod-7') || products[6];
    } else {
      matched = products.find(p => p.id === 'prod-6') || products[5];
    }
    setQuizResult(matched);
    setQuizStep(4); // Result state
  };

  const resetQuiz = () => {
    setQuizAnswers({ vibe: '', intensity: '', occasion: '' });
    setQuizStep(1);
    setQuizResult(null);
  };

  const handleAddDiscoverySet = () => {
    const discoveryProduct: Product = {
      id: 'prod-discovery-set',
      brandId: 'brand-maison-luxe',
      brandName: 'Vibe Ateliers',
      name: 'The 5-Piece Atelier Discovery Set',
      slug: 'atelier-discovery-set',
      shortDescription: '5 × 5ml deluxe glass travel flacons with ₹1,490 voucher credit toward any full bottle.',
      description: 'Experience our most acclaimed formulations on your skin.',
      fragranceFamily: 'Woody',
      secondaryFamilies: ['Floral', 'Citrus', 'Oriental'],
      genderPresentation: 'Unisex',
      launchYear: 2024,
      perfumer: 'Master Ateliers',
      intensity: 'Intense',
      longevity: '10+ Hours',
      sillage: 'Moderate',
      characterDescriptors: ['Curated', 'Luxury', 'Travel-Friendly'],
      occasions: ['Discovery', 'Gifting', 'Travel'],
      seasons: ['All-Season'],
      productStatus: 'active',
      mainImageUrl: '/images/discovery-gift-set.jpg',
      galleryImages: ['/images/discovery-gift-set.jpg'],
      notes: {
        top: [{ name: 'Bergamot', category: 'Citrus', description: 'Bright sparkling opening' }],
        heart: [{ name: 'Rose & Jasmine', category: 'Floral', description: 'Rich floral accords' }],
        base: [{ name: 'Oud & Sandalwood', category: 'Wood', description: 'Deep persistent woods' }]
      },
      rating: 4.9,
      reviewCount: 48,
      variants: [{
        id: 'var-disc-1',
        sku: 'DISC-5X5',
        sizeMl: 25,
        concentration: 'Eau de Parfum',
        packagingType: 'Luxury Velvet Box',
        price: 1490,
        compareAtPrice: 1990,
        stockQuantity: 40,
        status: 'in_stock'
      }]
    };
    addToCart(discoveryProduct, discoveryProduct.variants[0], 1);
  };

  const faqs = [
    {
      q: "How does the free 2 ml tester and return policy work?",
      a: "Every full-size fragrance shipment includes an identical 2 ml miniature spray tester vial. When your package arrives, open ONLY the 2 ml tester first. Wear it on your skin for 24 to 48 hours to evaluate the opening, the heart transition, and the drydown in your climate. If you love it, open your sealed full bottle. If it does not resonate with you, return the sealed full bottle within 30 days for a 100% full refund—the 2 ml tester vial is yours to keep with our compliments."
    },
    {
      q: "How do I verify the authenticity and batch codes of my bottle?",
      a: "Every flacon dispatched from Vibe Perfume features an embossed batch code on both the crystal bottle base and outer security-sealed box. We maintain direct atelier partnerships with verified master perfumers in Grasse, Florence, and Dubai. You can verify batch production dates and certificates of analysis at any time through our online Batch Verification portal or by contacting our concierge."
    },
    {
      q: "What does 'Formulated to IFRA Standards' mean?",
      a: "The International Fragrance Association (IFRA) publishes rigorous, globally recognized scientific safety standards governing raw botanical essences and aroma chemicals. All our atelier formulations comply strictly with IFRA's 51st Amendment safety standards, ensuring skin compatibility, allergen limits, and non-phototoxic safety while delivering maximum natural longevity."
    },
    {
      q: "What are your delivery timelines and packaging safety?",
      a: "We provide complimentary express delivery across India for all orders above ₹2,000. Orders are packed in custom thermal-insulated protective boxes to shield delicate natural aromatic oils from heat fluctuations during transit. Metro deliveries typically arrive within 2 business days; rest of India within 3-4 business days."
    },
    {
      q: "What is the difference between Eau de Parfum (EDP) and Extrait de Parfum?",
      a: "The difference lies in pure aromatic oil concentration. Our Eau de Parfum selections contain an 18-22% fragrance oil concentration providing 8-10 hours of active longevity with balanced projection. Our Extrait de Parfum creations boast an ultra-opulent 28-35% oil concentration, offering 12+ hours of lingering presence with rich, skin-clinging sillage."
    }
  ];

  const customerReviews = [
    {
      author: "Aditya Malhotra",
      location: "Mumbai",
      verified: true,
      scent: "Noir Absolu (Extrait de Parfum)",
      rating: 5,
      date: "October 2024",
      comment: "The 2ml tester idea is brilliant. I sprayed the tester at 8 AM before a board presentation; by 9 PM that evening, the Cambodian oud and creamy sandalwood were still projecting softly. I happily unsealed the main 50ml flacon. The packaging and atomizer quality easily rival Creed or Roja."
    },
    {
      author: "Pooja Singhania",
      location: "New Delhi",
      verified: true,
      scent: "Rose Éclat (Eau de Parfum)",
      rating: 5,
      date: "October 2024",
      comment: "Such an airy, dewy morning rose! Far from powdery or dated—the Sicilian lemon in the top notes gives it incredible luminosity. Free delivery arrived in 48 hours in Gurugram in a heavy insulated black box. Absolutely 10/10 shopping experience."
    },
    {
      author: "Vikram R.",
      location: "Bangalore",
      verified: true,
      scent: "Citrus Verve (Eau de Parfum)",
      rating: 5,
      date: "September 2024",
      comment: "Most citrus fragrances vanish after two hours in the heat. Citrus Verve has cedarwood and smoked vetiver anchoring the Amalfi lemon that genuinely lasted 7+ hours on my linen shirt. Transparent note breakdown and honest pricing."
    }
  ];

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
              Find your signature scent. <em>Test it on your skin first.</em>
            </h1>
            <p className="hero-description">
              Every bottle comes with a free 2 ml tester. Wear it for a day, and if it isn't you, return the sealed bottle for a full refund. 100% authentic, with notes, concentration and longevity listed for every fragrance.
            </p>
            <div className="hero-actions">
              <Link to="/collections" className="btn-gold">
                Shop Fragrances <ArrowRight size={17} />
              </Link>
              <a href="#scent-quiz" className="btn-outline">
                <Compass size={17} /> Find My Scent (2 min)
              </a>
            </div>

            {/* Verifiable Proof Stats */}
            <div className="hero-stats-row">
              <div className="hero-stat-item">
                <h4>4.9 ★</h4>
                <span>1,400+ Verified Buyers</span>
              </div>
              <div className="hero-stat-item">
                <h4>Free 2ml</h4>
                <span>Tester With Every Bottle</span>
              </div>
              <div className="hero-stat-item">
                <h4>30 Days</h4>
                <span>Sealed Bottle Returns</span>
              </div>
              <div className="hero-stat-item">
                <h4>100%</h4>
                <span>Batch-Code Verified</span>
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-visual-card">
              <img 
                src={getAssetUrl('/images/hero-perfume.jpg')} 
                alt="Bespoke Luxury Perfume Flacon with Complimentary 2ml Tester" 
              />
              <div className="hero-floating-glass-badge">
                <div>
                  <h4 className="badge-info-name">Noir Absolu Extrait</h4>
                  <p className="badge-info-sub">Calabrian Bergamot • Cambodian Oud • Free 2ml Tester</p>
                </div>
                <Link to="/products/prod-1" className="btn-gold btn-hero-view">
                  View details <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Trust Strip - Positioned Directly Under Hero */}
      <section className="trust-strip-hero">
        <div className="container">
          <div className="trust-strip-grid">
            <div className="trust-strip-item">
              <div className="trust-strip-icon">
                <Sparkles size={22} />
              </div>
              <div className="trust-strip-text">
                <h4>Free 2 ml Tester Vial</h4>
                <p>Wear on skin first. Keep the tester, return the sealed bottle if not in love.</p>
              </div>
            </div>

            <div className="trust-strip-item">
              <div className="trust-strip-icon">
                <ShieldCheck size={22} />
              </div>
              <div className="trust-strip-text">
                <h4>Authentic & Batch-Verified</h4>
                <p>Direct atelier sourcing with verifiable batch codes and certificates of analysis.</p>
              </div>
            </div>

            <div className="trust-strip-item">
              <div className="trust-strip-icon">
                <PackageCheck size={22} />
              </div>
              <div className="trust-strip-text">
                <h4>Formulated to IFRA Standards</h4>
                <p>Committed to international cosmetic safety with transparent note pyramids.</p>
              </div>
            </div>

            <div className="trust-strip-item">
              <div className="trust-strip-icon">
                <Truck size={22} />
              </div>
              <div className="trust-strip-text">
                <h4>Free Express Delivery</h4>
                <p>Complimentary insulated delivery across India on orders over ₹2,000.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Curated Signature Ateliers (With All 8 Families) */}
      <section className="curated-section">
        <div className="container">
          <div className="curated-header-flex">
            <div>
              <span className="section-eyebrow">Curated Formulations</span>
              <h2>Signature Ateliers</h2>
              <p className="section-subtitle">
                Each fragrance features verified concentration, full pyramid notes, dynamic size selection, and complimentary sample vial.
              </p>
            </div>

            {/* Exactly matching all 8 fragrance families */}
            <div className="family-filter-pills">
              {['All', 'Woody', 'Floral', 'Citrus', 'Oriental', 'Fresh', 'Aquatic', 'Gourmand', 'Spicy'].map(f => (
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
            <div className="loading-state">
              <Sparkles size={24} className="spin-slow" />
              <span>Preparing sensory collection...</span>
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

      {/* 4. Scent Families Taxonomy Section */}
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

      {/* 5. Tester Explainer 3-Step Block: Find, Sample, Commit */}
      <section className="tester-explainer-section">
        <div className="container">
          <div className="section-heading-centered">
            <span className="section-eyebrow">Zero-Risk Blind Buying</span>
            <h2>How Our 2 ml Tester Guarantee Works</h2>
            <p>Never worry about buying perfume online again. We eliminated blind-buy anxiety with our 3-step ritual.</p>
          </div>

          <div className="explainer-steps-grid">
            <div className="explainer-step-card">
              <div className="step-number-badge">01</div>
              <div className="step-icon-wrap">
                <Sparkles size={26} />
              </div>
              <h3>1. Find Your Scent</h3>
              <p>
                Select your favorite full-size bottle. We dispatch it alongside an identical, complimentary 2 ml miniature spray tester vial.
              </p>
            </div>

            <div className="explainer-step-card">
              <div className="step-number-badge">02</div>
              <div className="step-icon-wrap">
                <Droplet size={26} />
              </div>
              <h3>2. Sample on Skin</h3>
              <p>
                Open only the 2 ml tester. Wear it through a full day to observe the top notes, heart development, and 12-hour drydown on your skin chemistry.
              </p>
            </div>

            <div className="explainer-step-card">
              <div className="step-number-badge">03</div>
              <div className="step-icon-wrap">
                <RotateCcw size={26} />
              </div>
              <h3>3. Commit or Return</h3>
              <p>
                Fell in love? Keep and unseal your full bottle. Not quite your vibe? Return the sealed full bottle within 30 days for a 100% refund. The tester is yours to keep.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Interactive Scent Finder Mini Quiz Section */}
      <section id="scent-quiz" className="scent-quiz-section">
        <div className="container">
          <div className="scent-quiz-card">
            <div className="scent-quiz-intro">
              <span className="section-eyebrow">Personalized Scent Profiler</span>
              <h2>Find Your Olfactory Match in 60 Seconds</h2>
              <p>
                Personalized olfactory profiling grounded in verified perfumery notes, concentration benchmarks, and seasonal chemistry. Answer 3 quick questions to reveal your perfect signature scent.
              </p>
              
              <div className="quiz-highlights">
                <div className="quiz-highlight-item">
                  <CheckCircle2 size={16} /> Traceable natural pyramid accords
                </div>
                <div className="quiz-highlight-item">
                  <CheckCircle2 size={16} /> Concentration & sillage tailored to your day
                </div>
                <div className="quiz-highlight-item">
                  <CheckCircle2 size={16} /> Free 2ml sample vial included with match
                </div>
              </div>
            </div>

            {/* Interactive Quiz Engine */}
            <div className="scent-quiz-interactive">
              {quizStep === 1 && (
                <div className="quiz-step-pane">
                  <div className="quiz-step-header">
                    <span className="step-indicator">Question 1 of 3</span>
                    <h4>What atmosphere or sensory vibe speaks to you?</h4>
                  </div>
                  <div className="quiz-options-grid">
                    {[
                      { label: 'Warm & Seductive', desc: 'Velvety agarwood, golden amber, smoky incense' },
                      { label: 'Fresh & Citrus', desc: 'Zesty cold-pressed lemon, sparkling grapefruit, basil' },
                      { label: 'Floral & Romantic', desc: 'Dew-kissed Damascena rose, night-blooming jasmine' },
                      { label: 'Cozy & Gourmand', desc: 'Madagascar bourbon vanilla, roasted almond, tonka' }
                    ].map(opt => (
                      <button
                        key={opt.label}
                        className="quiz-option-btn"
                        onClick={() => handleQuizAnswer('vibe', opt.label)}
                      >
                        <strong>{opt.label}</strong>
                        <span>{opt.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {quizStep === 2 && (
                <div className="quiz-step-pane">
                  <div className="quiz-step-header">
                    <span className="step-indicator">Question 2 of 3</span>
                    <h4>What projection and intensity do you prefer?</h4>
                  </div>
                  <div className="quiz-options-grid">
                    {[
                      { label: 'Intimate & Subtle', desc: 'Sits close to skin; personal aura for quiet luxury (6-8h)' },
                      { label: 'Moderate & Balanced', desc: 'Leaves a noticeable scent trail in conversational distance (8-10h)' },
                      { label: 'Enormous & Regal', desc: 'High concentration Extrait delivering unmistakable presence (12h+)' }
                    ].map(opt => (
                      <button
                        key={opt.label}
                        className="quiz-option-btn"
                        onClick={() => handleQuizAnswer('intensity', opt.label)}
                      >
                        <strong>{opt.label}</strong>
                        <span>{opt.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {quizStep === 3 && (
                <div className="quiz-step-pane">
                  <div className="quiz-step-header">
                    <span className="step-indicator">Question 3 of 3</span>
                    <h4>When will you primarily wear this fragrance?</h4>
                  </div>
                  <div className="quiz-options-grid">
                    {[
                      { label: 'Daily Signature', desc: 'Effortless morning-to-night versatility' },
                      { label: 'Evening & Gala', desc: 'Date nights, autumn celebrations, special occasions' },
                      { label: 'Office & Executive', desc: 'Clean, structured, commanding respect without overpowering' }
                    ].map(opt => (
                      <button
                        key={opt.label}
                        className="quiz-option-btn"
                        onClick={() => handleQuizAnswer('occasion', opt.label)}
                      >
                        <strong>{opt.label}</strong>
                        <span>{opt.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {quizStep === 4 && quizResult && (
                <div className="quiz-result-pane">
                  <div className="quiz-result-badge">
                    <Sparkles size={14} /> 98% Olfactory Affinity Match
                  </div>
                  <h3>Your Ideal Signature Scent</h3>
                  
                  <div className="quiz-result-card">
                    <img 
                      src={getAssetUrl(quizResult.mainImageUrl)} 
                      alt={quizResult.name}
                      className="quiz-result-img" 
                    />
                    <div className="quiz-result-info">
                      <span className="quiz-result-brand">{quizResult.brandName}</span>
                      <h4>{quizResult.name}</h4>
                      <p className="quiz-result-desc">{quizResult.shortDescription}</p>
                      
                      <div className="quiz-result-meta">
                        <span><strong>Family:</strong> {quizResult.fragranceFamily}</span>
                        <span><strong>Longevity:</strong> {quizResult.longevity}</span>
                      </div>

                      <div className="quiz-result-actions">
                        <Link to={`/products/${quizResult.id}`} className="btn-gold" style={{ padding: '0.6rem 1.25rem', fontSize: '0.85rem' }}>
                          View Details & Notes <ArrowRight size={14} />
                        </Link>
                        <button 
                          className="btn-outline" 
                          style={{ padding: '0.6rem 1.25rem', fontSize: '0.85rem' }}
                          onClick={resetQuiz}
                        >
                          Retake Quiz
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 7. Discovery & Gift Sets Showcase */}
      <section className="discovery-section">
        <div className="container">
          <div className="discovery-grid">
            <div className="discovery-image-wrap">
              <img 
                src={getAssetUrl('/images/discovery-gift-set.jpg')} 
                alt="The 5-Piece Atelier Discovery Collection & Gift Presentation" 
                className="discovery-img"
              />
              <div className="discovery-floating-badge">
                <Gift size={16} /> 100% Voucher Credit Included
              </div>
            </div>

            <div className="discovery-content">
              <span className="section-eyebrow">Seasonal Gifting & Exploration</span>
              <h2>The 5-Piece Atelier Discovery Set</h2>
              <p className="discovery-lead">
                Can't decide on one signature bottle? Sample 5 of our most acclaimed haute parfumerie creations at your leisure on your skin.
              </p>
              
              <ul className="discovery-perks">
                <li>
                  <CheckCircle2 size={18} className="perk-icon" />
                  <div>
                    <strong>5 × 5ml Deluxe Spray Flacons:</strong> Features Noir Absolu, Rose Éclat, Citrus Verve, Velvet Santal, and Vanille Céleste.
                  </div>
                </li>
                <li>
                  <CheckCircle2 size={18} className="perk-icon" />
                  <div>
                    <strong>100% Value Voucher Credit:</strong> Your full ₹1,490 set purchase is redeemable as a coupon toward any full-size 50ml or 100ml bottle.
                  </div>
                </li>
                <li>
                  <CheckCircle2 size={18} className="perk-icon" />
                  <div>
                    <strong>Complimentary Luxury Gifting:</strong> Presented in a black and gold embossed velvet gift box with hand-tied satin ribbon and personalized calligraphy note card.
                  </div>
                </li>
              </ul>

              <div className="discovery-cta-group">
                <div className="discovery-pricing">
                  <span className="discovery-price">₹1,490</span>
                  <span className="discovery-compare">₹1,990</span>
                  <span className="discovery-credit-tag">Includes ₹1,490 bottle voucher</span>
                </div>
                <button className="btn-gold" onClick={handleAddDiscoverySet}>
                  <ShoppingBag size={17} /> Add Discovery Set to Bag
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Customer Reviews & Verified UGC */}
      <section className="reviews-section">
        <div className="container">
          <div className="section-heading-centered">
            <span className="section-eyebrow">Real Skin Chemistry Tests</span>
            <h2>Verified Customer Experiences</h2>
            <p>Unfiltered feedback from clients who wore our free 2 ml testers on skin before committing.</p>
          </div>

          <div className="reviews-grid">
            {customerReviews.map((rev, idx) => (
              <div key={idx} className="review-card">
                <div className="review-card-header">
                  <div className="review-stars">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} size={15} fill="currentColor" />
                    ))}
                  </div>
                  <span className="badge-verified">
                    <CheckCircle2 size={12} /> Verified Buyer
                  </span>
                </div>

                <p className="review-comment">"{rev.comment}"</p>

                <div className="review-meta">
                  <div>
                    <h5 className="review-author">{rev.author}</h5>
                    <span className="review-location">{rev.location} • {rev.date}</span>
                  </div>
                  <span className="review-scent-tag">{rev.scent}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. Authenticity Proof & FAQ Accordion */}
      <section className="faq-section">
        <div className="container">
          <div className="section-heading-centered">
            <span className="section-eyebrow">Clear Answers & Sourcing Transparency</span>
            <h2>Frequently Asked Questions</h2>
            <p>Everything you need to know about our tester policy, batch verifications, and IFRA standards.</p>
          </div>

          <div className="faq-accordion">
            {faqs.map((faq, index) => {
              const isOpen = activeFaq === index;
              return (
                <div 
                  key={index} 
                  className={`faq-item ${isOpen ? 'open' : ''}`}
                  onClick={() => setActiveFaq(isOpen ? null : index)}
                >
                  <div className="faq-question">
                    <h3>{faq.q}</h3>
                    <ChevronDown size={18} className={`faq-arrow ${isOpen ? 'rotated' : ''}`} />
                  </div>
                  {isOpen && (
                    <div className="faq-answer">
                      <p>{faq.a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
