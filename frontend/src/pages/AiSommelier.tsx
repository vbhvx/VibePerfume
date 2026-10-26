import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Send, RotateCcw, ShoppingBag, Scale, ArrowRight, Check, Compass } from 'lucide-react';
import { consultAiSommelier } from '../api/products';
import type { AiSommelierProductMatch } from '../types';
import { useCart } from '../context/CartContext';
import { useCompare } from '../context/CompareContext';
import toast from 'react-hot-toast';
import './AiSommelier.css';

interface ChatMessage {
  id: string;
  sender: 'sommelier' | 'user';
  text: string;
  recommendations?: AiSommelierProductMatch[];
  quickChips?: string[];
  timestamp: string;
}

export const AiSommelier: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [collectedPreferences, setCollectedPreferences] = useState<Record<string, any>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { addToCart } = useCart();
  const { addToCompare, isInCompare, removeFromCompare } = useCompare();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Initial welcome message from AI Sommelier
  const startConsultation = async () => {
    setLoading(true);
    setCollectedPreferences({});
    try {
      const res = await consultAiSommelier({ message: '', conversationHistory: [], collectedPreferences: {} });
      if (res.success && res.data) {
        setMessages([
          {
            id: `msg-${Date.now()}`,
            sender: 'sommelier',
            text: res.data.reply,
            quickChips: res.data.quickChips,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
        setCollectedPreferences(res.data.collectedPreferences || {});
      }
    } catch (err) {
      console.error('Failed to initialize AI Sommelier', err);
      toast.error('The Atelier Sommelier is momentarily unavailable.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    startConsultation();
  }, []);

  const handleSendMessage = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed || loading) return;

    if (trimmed.toLowerCase().includes('start a new consultation') || trimmed.toLowerCase().includes('restart')) {
      startConsultation();
      setInputText('');
      return;
    }

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.sender === 'sommelier' ? ('assistant' as const) : ('user' as const),
        content: m.text
      }));

      const res = await consultAiSommelier({
        message: trimmed,
        conversationHistory: history,
        collectedPreferences
      });

      if (res.success && res.data) {
        const botMsg: ChatMessage = {
          id: `bot-${Date.now()}`,
          sender: 'sommelier',
          text: res.data.reply,
          recommendations: res.data.recommendations && res.data.recommendations.length > 0 ? res.data.recommendations : undefined,
          quickChips: res.data.quickChips,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, botMsg]);
        setCollectedPreferences(res.data.collectedPreferences || {});
      }
    } catch (err) {
      console.error('AI Sommelier error', err);
      toast.error('Unable to consult the sommelier. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAdd = (product: AiSommelierProductMatch) => {
    const defaultVar = product.variants?.find(v => v.id === product.defaultVariantId) || product.variants?.[0];
    if (defaultVar) {
      addToCart(product, defaultVar, 1);
      toast.success(`Added ${product.name} to your bag`);
    }
  };

  const handleCompareToggle = (product: AiSommelierProductMatch) => {
    if (isInCompare(product.id)) {
      removeFromCompare(product.id);
    } else {
      addToCompare(product);
    }
  };

  return (
    <div className="ai-sommelier-page">
      <div className="ai-sommelier-hero">
        <div className="container hero-container">
          <div className="sommelier-badge">
            <Sparkles className="icon-gold" size={16} />
            <span>Haute Parfumerie Artificial Intelligence</span>
          </div>
          <h1>L'Atelier AI Sommelier</h1>
          <p className="hero-subtext">
            Your private master perfumer. Converse naturally about your destination, occasion, desired intensity, 
            and olfactory sensibilities to unveil your signature fragrance prescription.
          </p>
          <div className="salon-actions">
            <button className="btn-secondary btn-restart" onClick={startConsultation} disabled={loading}>
              <RotateCcw size={15} />
              <span>Begin New Consultation</span>
            </button>
            <Link to="/collections" className="link-browse">
              <Compass size={15} />
              <span>Browse Entire Vault</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="container chat-container-wrap">
        <div className="chat-window">
          <div className="chat-header">
            <div className="sommelier-status">
              <div className="avatar-ring">
                <span className="avatar-text">VP</span>
                <span className="status-dot"></span>
              </div>
              <div>
                <h3 className="sommelier-title">Master Perfume Consultant</h3>
                <span className="sommelier-presence">Live Olfactory Intelligence • 8 Vault Masterworks</span>
              </div>
            </div>
            {Object.keys(collectedPreferences).some(k => collectedPreferences[k]) && (
              <div className="active-dna-pill">
                <span>DNA: </span>
                {collectedPreferences.occasion && <span className="dna-tag">{collectedPreferences.occasion}</span>}
                {collectedPreferences.family && <span className="dna-tag">{collectedPreferences.family}</span>}
                {collectedPreferences.intensity && <span className="dna-tag">{collectedPreferences.intensity}</span>}
              </div>
            )}
          </div>

          <div className="messages-stream">
            {messages.map(msg => (
              <div key={msg.id} className={`chat-row ${msg.sender}`}>
                {msg.sender === 'sommelier' && (
                  <div className="avatar-sommelier">
                    <Sparkles size={16} />
                  </div>
                )}
                
                <div className="chat-bubble-wrap">
                  <div className="chat-bubble">
                    <div className="chat-text">
                      {msg.text.split('\n\n').map((paragraph, idx) => (
                        <p key={idx}>{paragraph}</p>
                      ))}
                    </div>
                    <span className="chat-time">{msg.timestamp}</span>
                  </div>

                  {/* Product Recommendations Card Deck */}
                  {msg.recommendations && msg.recommendations.length > 0 && (
                    <div className="recommendations-deck">
                      <div className="deck-header">
                        <Sparkles size={16} className="icon-gold" />
                        <span>Curated Bespoke Prescriptions</span>
                      </div>
                      <div className="deck-grid">
                        {msg.recommendations.map(product => {
                          const defaultVariant = product.variants?.find(v => v.id === product.defaultVariantId) || product.variants?.[0];
                          const pricePerMl = defaultVariant && defaultVariant.sizeMl > 0 ? Math.round(defaultVariant.price / defaultVariant.sizeMl) : null;
                          const isCompared = isInCompare(product.id);

                          return (
                            <div key={product.id} className="sommelier-card">
                              <div className="card-top-bar">
                                <span className="match-affinity-badge">
                                  ✨ {product.matchPercentage}% Affinity
                                </span>
                                <span className="card-family-tag">{product.fragranceFamily}</span>
                              </div>

                              <div className="card-body">
                                <Link to={`/products/${product.id}`} className="card-thumb-wrap">
                                  <img 
                                    src={product.mainImageUrl} 
                                    alt={product.name} 
                                    className="card-thumb" 
                                  />
                                </Link>

                                <div className="card-details">
                                  <span className="card-brand">{product.brandName}</span>
                                  <h4 className="card-title">
                                    <Link to={`/products/${product.id}`}>{product.name}</Link>
                                  </h4>
                                  
                                  <p className="card-rationale">
                                    "{product.sommelierRationale}"
                                  </p>

                                  <div className="card-pyramid-mini">
                                    <div><strong>Top:</strong> {(product.notes?.top || []).slice(0, 2).map(n => typeof n === 'string' ? n : n.name).join(', ')}</div>
                                    <div><strong>Heart:</strong> {(product.notes?.heart || []).slice(0, 2).map(n => typeof n === 'string' ? n : n.name).join(', ')}</div>
                                    <div><strong>Base:</strong> {(product.notes?.base || []).slice(0, 2).map(n => typeof n === 'string' ? n : n.name).join(', ')}</div>
                                  </div>

                                  <div className="card-pricing-row">
                                    <div className="card-price-info">
                                      <span className="price-val">₹{defaultVariant?.price.toLocaleString()}</span>
                                      {pricePerMl && <span className="price-per-ml">₹{pricePerMl}/ml ({defaultVariant?.sizeMl}ml)</span>}
                                    </div>
                                    <span className="stock-pill">In Stock • 2ml Vial Included</span>
                                  </div>

                                  <div className="card-actions">
                                    <button 
                                      className="btn-primary btn-card-add"
                                      onClick={() => handleQuickAdd(product)}
                                    >
                                      <ShoppingBag size={14} />
                                      <span>Add to Bag</span>
                                    </button>
                                    
                                    <button 
                                      className={`btn-secondary btn-card-compare ${isCompared ? 'active' : ''}`}
                                      onClick={() => handleCompareToggle(product)}
                                      title={isCompared ? 'Remove from Compare' : 'Add to Compare'}
                                    >
                                      {isCompared ? <Check size={14} /> : <Scale size={14} />}
                                      <span>{isCompared ? 'Comparing' : 'Compare'}</span>
                                    </button>

                                    <Link to={`/products/${product.id}`} className="btn-link-pdp">
                                      <span>View Flacon</span>
                                      <ArrowRight size={14} />
                                    </Link>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Quick-Response Chips */}
                  {msg.quickChips && msg.quickChips.length > 0 && (
                    <div className="chips-container">
                      <span className="chips-label">Quick Suggestions:</span>
                      <div className="chips-list">
                        {msg.quickChips.map((chip, i) => (
                          <button
                            key={i}
                            className="chip-btn"
                            onClick={() => handleSendMessage(chip)}
                            disabled={loading}
                          >
                            <span>{chip}</span>
                            <ArrowRight size={12} className="chip-arrow" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="chat-row sommelier">
                <div className="avatar-sommelier pulse">
                  <Sparkles size={16} />
                </div>
                <div className="chat-bubble loading-bubble">
                  <span className="loading-dot"></span>
                  <span className="loading-dot"></span>
                  <span className="loading-dot"></span>
                  <span className="loading-text">Sommelier is synthesizing olfactory notes...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form 
            className="chat-input-bar"
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputText);
            }}
          >
            <input 
              type="text" 
              className="chat-input-field" 
              placeholder="Describe your desired fragrance, destination, mood, or favorite notes..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={loading}
            />
            <button 
              type="submit" 
              className="chat-send-btn" 
              disabled={!inputText.trim() || loading}
              aria-label="Send message"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AiSommelier;
