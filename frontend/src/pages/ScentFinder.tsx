import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  ArrowLeft, 
  RotateCcw, 
  Sparkles, 
  Check, 
  ShoppingBag 
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getScentRecommendations } from '../api/products';
import type { ScentFinderRecommendation } from '../types';
import { useCart } from '../context/CartContext';
import './ScentFinder.css';

export const ScentFinder: React.FC = () => {
  const [step, setStep] = useState(1);
  const totalSteps = 6;

  // Answers State
  const [selectedFamily, setSelectedFamily] = useState<string>('');
  const [preferredNotes, setPreferredNotes] = useState<string[]>([]);
  const [avoidNotes, setAvoidNotes] = useState<string[]>([]);
  const [selectedIntensity, setSelectedIntensity] = useState<string>('');
  const [selectedOccasion, setSelectedOccasion] = useState<string>('');
  const [maxBudget, setMaxBudget] = useState<number | undefined>(undefined);
  const [recipient, setRecipient] = useState<string>('Self');

  // Recommendation Results
  const [recommendations, setRecommendations] = useState<ScentFinderRecommendation[]>([]);
  const [loadingResults, setLoadingResults] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);

  const { addToCart } = useCart();

  const toggleNote = (note: string, setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter(prev => prev.includes(note) ? prev.filter(n => n !== note) : [...prev, note]);
  };

  const handleFinishQuiz = async () => {
    try {
      setLoadingResults(true);
      const res = await getScentRecommendations({
        family: selectedFamily || undefined,
        preferredNotes: preferredNotes.length > 0 ? preferredNotes : undefined,
        avoidNotes: avoidNotes.length > 0 ? avoidNotes : undefined,
        intensity: selectedIntensity || undefined,
        occasion: selectedOccasion || undefined,
        maxBudget: maxBudget || undefined,
        recipient
      });

      if (res.success && res.data) {
        setRecommendations(res.data);
        setHasCompleted(true);
        window.scrollTo(0, 0);
      }
    } catch (err) {
      console.error(err);
      toast.error('Could not compute scent affinities.');
    } finally {
      setLoadingResults(false);
    }
  };

  const handleReset = () => {
    setStep(1);
    setSelectedFamily('');
    setPreferredNotes([]);
    setAvoidNotes([]);
    setSelectedIntensity('');
    setSelectedOccasion('');
    setMaxBudget(undefined);
    setRecipient('Self');
    setRecommendations([]);
    setHasCompleted(false);
  };

  const availableNotes = [
    'Calabrian Bergamot',
    'Cambodian Oud',
    'Bulgarian Rose',
    'Bourbon Vanilla',
    'Mysore Sandalwood',
    'Precious Saffron',
    'Sea Salt',
    'Bitter Almond',
    'Indonesian Patchouli',
    'Smoked Vetiver',
    'Tonka Bean',
    'Florentine Iris'
  ];

  return (
    <div className="scent-finder-page">
      <div className="container">
        {!hasCompleted ? (
          <div className="quiz-card">
            {/* Progress Bar */}
            <div className="quiz-progress-bar-wrap">
              <div className="quiz-step-info">
                <span>Step {step} of {totalSteps}</span>
                <span>Olfactory Preference Matrix</span>
              </div>
              <div className="quiz-track">
                <div className="quiz-fill" style={{ width: `${(step / totalSteps) * 100}%` }} />
              </div>
            </div>

            {/* Step 1: Scent Family */}
            {step === 1 && (
              <div>
                <h2 className="quiz-question-title">Which Scent Family Speaks to You?</h2>
                <p className="quiz-question-subtitle">
                  Choose the dominant aromatic world that resonates most with your character, or skip to focus on specific ingredients.
                </p>

                <div className="quiz-options-grid">
                  {[
                    { id: 'Woody', name: 'Woody & Resinous', desc: 'Aged oud, cedar, sandalwood, and warm resins' },
                    { id: 'Floral', name: 'Luminous Floral', desc: 'Bulgarian rose, Sambac jasmine, and iris' },
                    { id: 'Citrus', name: 'Citrus & Zest', desc: 'Sicilian lemon, bergamot, and pink grapefruit' },
                    { id: 'Oriental', name: 'Amber & Oriental', desc: 'Rare saffron, ambergris, and exotic spices' },
                    { id: 'Aquatic', name: 'Marine & Aquatic', desc: 'Crisp sea salt, coastal sage, and driftwood' },
                    { id: 'Gourmand', name: 'Warm Gourmand', desc: 'Madagascar vanilla, roasted tonka, and almond' }
                  ].map(item => (
                    <button
                      key={item.id}
                      className={`quiz-option-btn ${selectedFamily === item.id ? 'selected' : ''}`}
                      onClick={() => setSelectedFamily(item.id)}
                    >
                      <h4>{item.name}</h4>
                      <p>{item.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Preferred Notes */}
            {step === 2 && (
              <div>
                <h2 className="quiz-question-title">Which Notes Do You Covet?</h2>
                <p className="quiz-question-subtitle">
                  Select ingredients that you naturally gravitate toward in perfumes.
                </p>

                <div className="quiz-tags-selection">
                  {availableNotes.map(note => {
                    const isSelected = preferredNotes.includes(note);
                    return (
                      <button
                        key={note}
                        className={`quiz-tag-pill ${isSelected ? 'selected' : ''}`}
                        onClick={() => toggleNote(note, setPreferredNotes)}
                      >
                        {isSelected && <Check size={14} style={{ display: 'inline', marginRight: 4 }} />}
                        {note}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 3: Intensity & Sillage */}
            {step === 3 && (
              <div>
                <h2 className="quiz-question-title">Desired Presence & Intensity</h2>
                <p className="quiz-question-subtitle">
                  How noticeable do you want your fragrance aura to be in a room?
                </p>

                <div className="quiz-options-grid">
                  {[
                    { id: 'Subtle', name: 'Intimate & Subtle', desc: 'Second-skin presence that invites others to lean in closer.' },
                    { id: 'Moderate', name: 'Balanced & Refined', desc: 'Noticeable arm’s-length projection suitable for any setting.' },
                    { id: 'Intense', name: 'Bold & Room-Filling', desc: 'Commanding sillage with profound trail and 10+ hour tenacity.' }
                  ].map(item => (
                    <button
                      key={item.id}
                      className={`quiz-option-btn ${selectedIntensity === item.id ? 'selected' : ''}`}
                      onClick={() => setSelectedIntensity(item.id)}
                    >
                      <h4>{item.name}</h4>
                      <p>{item.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 4: Occasion */}
            {step === 4 && (
              <div>
                <h2 className="quiz-question-title">Primary Occasion & Season</h2>
                <p className="quiz-question-subtitle">
                  Where and when do you plan to wear this signature fragrance most frequently?
                </p>

                <div className="quiz-options-grid">
                  {[
                    { id: 'Daily Wear', name: 'Daily Signature', desc: 'Versatile, uplifting office and daytime poise.' },
                    { id: 'Evening', name: 'Evening & Gala', desc: 'Dramatic, seductive, and memorable for nights out.' },
                    { id: 'Date Night', name: 'Romantic Encounters', desc: 'Sensual warmth with intimate, lingering drydowns.' },
                    { id: 'Summer Vacation', name: 'Sun & Vacation', desc: 'Breezy citrus and marine vitality under warm skies.' }
                  ].map(item => (
                    <button
                      key={item.id}
                      className={`quiz-option-btn ${selectedOccasion === item.id ? 'selected' : ''}`}
                      onClick={() => setSelectedOccasion(item.id)}
                    >
                      <h4>{item.name}</h4>
                      <p>{item.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 5: Budget */}
            {step === 5 && (
              <div>
                <h2 className="quiz-question-title">Your Investment Range</h2>
                <p className="quiz-question-subtitle">
                  Select your preferred budget. All bottles include an identical 2ml tester vial.
                </p>

                <div className="quiz-options-grid">
                  {[
                    { val: 3000, name: 'Accessible Luxury', desc: 'Up to ₹3,000 (Ideal for 30ml / 50ml flacons)' },
                    { val: 5000, name: 'Artisanal Reserve', desc: 'Up to ₹5,000 (50ml / 100ml Eau de Parfum)' },
                    { val: 10000, name: 'Haute Extrait', desc: '₹5,000+ (Pure Extraits & Rare Resins)' }
                  ].map(item => (
                    <button
                      key={item.val}
                      className={`quiz-option-btn ${maxBudget === item.val ? 'selected' : ''}`}
                      onClick={() => setMaxBudget(item.val)}
                    >
                      <h4>{item.name}</h4>
                      <p>{item.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 6: Recipient */}
            {step === 6 && (
              <div>
                <h2 className="quiz-question-title">Who are you shopping for?</h2>
                <p className="quiz-question-subtitle">
                  Personal signature discovery or an unforgettable bespoke gift?
                </p>

                <div className="quiz-options-grid">
                  {[
                    { id: 'Self', name: 'For Myself', desc: 'Exploring a personal signature scent for my skin chemistry.' },
                    { id: 'Gift', name: 'A Thoughtful Gift', desc: 'Selecting a crowd-pleasing, universally admired masterpiece.' }
                  ].map(item => (
                    <button
                      key={item.id}
                      className={`quiz-option-btn ${recipient === item.id ? 'selected' : ''}`}
                      onClick={() => setRecipient(item.id)}
                    >
                      <h4>{item.name}</h4>
                      <p>{item.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Navigation Controls */}
            <div className="quiz-nav-row">
              {step > 1 ? (
                <button className="btn-outline" onClick={() => setStep(s => s - 1)}>
                  <ArrowLeft size={16} /> Previous
                </button>
              ) : (
                <div />
              )}

              <div style={{ display: 'flex', gap: '1rem' }}>
                {step < totalSteps ? (
                  <>
                    <button className="btn-text" onClick={() => setStep(s => s + 1)}>
                      Skip Step
                    </button>
                    <button className="btn-gold" onClick={() => setStep(s => s + 1)}>
                      Next Step <ArrowRight size={16} />
                    </button>
                  </>
                ) : (
                  <button className="btn-gold" onClick={handleFinishQuiz} disabled={loadingResults}>
                    {loadingResults ? 'Calculating Affinities...' : 'View My Fragrance Matches'}
                    <Sparkles size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Results View */
          <div>
            <div className="results-header">
              <span className="section-eyebrow">Deterministic Olfactory Profile</span>
              <h1>Your Scent Recommendations</h1>
              <p>
                Based on your preference for {selectedFamily || 'balanced'} fragrances
                {preferredNotes.length > 0 && ` and key notes (${preferredNotes.join(', ')})`}, here are your highest ranked matches.
              </p>
              <button className="btn-outline" onClick={handleReset} style={{ marginTop: '1rem' }}>
                <RotateCcw size={15} /> Retake Quiz
              </button>
            </div>

            <div className="recommendations-grid">
              {recommendations.map(rec => {
                const p = rec.product;
                const defVariant = (p.variants || [])[0];

                return (
                  <div key={p.id} className="recommendation-card">
                    <span className="match-score-badge">
                      {rec.matchPercentage}% Match
                    </span>

                    <div className="rec-card-top">
                      <img src={p.mainImageUrl} alt={p.name} className="rec-thumb" />
                      <div className="rec-title-wrap">
                        <span className="rec-brand">{p.brandName} • {p.fragranceFamily}</span>
                        <h3>{p.name}</h3>
                        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                          Starting at ₹{Math.min(...(p.variants || []).map(v => v.price)).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="rec-reasons-box">
                      <div className="rec-reasons-title">Why this matches you:</div>
                      <ul className="rec-reasons-list">
                        {rec.matchReasons.map((reason, idx) => (
                          <li key={idx}>
                            <Check size={14} style={{ color: 'var(--gold-primary)', flexShrink: 0, marginTop: 2 }} />
                            <span>{reason}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="rec-card-actions">
                      <Link to={`/products/${p.id}`} className="btn-outline" style={{ flex: 1, textAlign: 'center' }}>
                        Inspect Notes
                      </Link>
                      {defVariant && (
                        <button 
                          className="btn-gold" 
                          onClick={() => addToCart(p, defVariant, 1)}
                          style={{ flex: 1 }}
                        >
                          <ShoppingBag size={15} /> Add to Bag
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScentFinder;
