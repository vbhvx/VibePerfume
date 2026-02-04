import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, X, Send, Maximize2, ShoppingBag } from 'lucide-react';
import { consultAiSommelier } from '../api/products';
import type { AiSommelierProductMatch } from '../types';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';
import { getAssetUrl, handleImageError } from '../utils/imageUrl';
import './AiSommelierWidget.css';

interface WidgetMessage {
  id: string;
  sender: 'sommelier' | 'user';
  text: string;
  quickChips?: string[];
  recommendations?: AiSommelierProductMatch[];
}

export const AiSommelierWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<WidgetMessage[]>([
    {
      id: 'welcome',
      sender: 'sommelier',
      text: "Bienvenue. I am your Atelier AI Sommelier. What occasion, scent notes, or mood can I assist you with today?",
      quickChips: [
        "Date Night Perfume",
        "Daily Office Signature",
        "Smoky Woody Oud",
        "Fresh Mediterranean Citrus"
      ]
    }
  ]);
  const [preferences, setPreferences] = useState<Record<string, any>>({});
  const { addToCart } = useCart();

  const handleSend = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMsg: WidgetMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: trimmed
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    try {
      const res = await consultAiSommelier({
        message: trimmed,
        conversationHistory: messages.map(m => ({
          role: m.sender === 'sommelier' ? 'assistant' : 'user',
          content: m.text
        })),
        collectedPreferences: preferences
      });

      if (res.success && res.data) {
        setMessages(prev => [
          ...prev,
          {
            id: `s-${Date.now()}`,
            sender: 'sommelier',
            text: res.data.reply,
            quickChips: res.data.quickChips,
            recommendations: res.data.recommendations
          }
        ]);
        setPreferences(res.data.collectedPreferences || {});
      }
    } catch (err) {
      toast.error('Sommelier is momentarily unavailable.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAdd = (product: AiSommelierProductMatch) => {
    const defaultVar = product.variants?.find(v => v.id === product.defaultVariantId) || product.variants?.[0];
    if (defaultVar) {
      addToCart(product, defaultVar, 1);
      toast.success(`Added ${product.name} to bag`);
    }
  };

  return (
    <>
      {/* Floating Trigger Orb */}
      {!isOpen && (
        <button 
          className="ai-widget-orb" 
          onClick={() => setIsOpen(true)}
          aria-label="Ask AI Fragrance Sommelier"
        >
          <div className="orb-sparkle-glow">
            <Sparkles size={20} className="orb-icon" />
          </div>
          <span className="orb-text">AI Sommelier</span>
        </button>
      )}

      {/* Floating Drawer / Modal */}
      {isOpen && (
        <div className="ai-widget-modal">
          <div className="widget-header">
            <div className="widget-title-wrap">
              <div className="widget-avatar">
                <Sparkles size={16} />
              </div>
              <div>
                <h4 className="widget-title">AI Fragrance Sommelier</h4>
                <span className="widget-subtitle">Private Olfactory Consultation</span>
              </div>
            </div>
            <div className="widget-controls">
              <Link to="/ai-sommelier" className="btn-widget-icon" title="Expand Full Screen Salon" onClick={() => setIsOpen(false)}>
                <Maximize2 size={15} />
              </Link>
              <button className="btn-widget-icon" onClick={() => setIsOpen(false)} aria-label="Close Sommelier">
                <X size={16} />
              </button>
            </div>
          </div>

          <div className="widget-chat-body">
            {messages.map(m => (
              <div key={m.id} className={`widget-msg ${m.sender}`}>
                <div className="widget-bubble">
                  {m.text.split('\n\n').map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}

                  {/* Recommendations */}
                  {m.recommendations && m.recommendations.length > 0 && (
                    <div className="widget-recs-mini">
                      {m.recommendations.slice(0, 2).map(prod => (
                        <div key={prod.id} className="widget-rec-item">
                          <img 
                            src={getAssetUrl(prod.mainImageUrl)} 
                            alt={prod.name} 
                            className="rec-mini-img" 
                            onError={handleImageError}
                          />
                          <div className="rec-mini-info">
                            <span className="rec-mini-badge">✨ {prod.matchPercentage}% Match</span>
                            <h5 className="rec-mini-title">{prod.name}</h5>
                            <span className="rec-mini-price">₹{prod.variants?.[0]?.price.toLocaleString()}</span>
                          </div>
                          <button 
                            className="btn-rec-add" 
                            onClick={() => handleQuickAdd(prod)}
                            title="Add to bag"
                          >
                            <ShoppingBag size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Quick Chips */}
                  {m.quickChips && m.quickChips.length > 0 && (
                    <div className="widget-chips">
                      {m.quickChips.slice(0, 3).map((chip, idx) => (
                        <button key={idx} className="widget-chip" onClick={() => handleSend(chip)} disabled={loading}>
                          {chip}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="widget-msg sommelier">
                <div className="widget-bubble loading">
                  <Sparkles size={14} className="spin-gold" />
                  <span>Synthesizing notes...</span>
                </div>
              </div>
            )}
          </div>

          <form 
            className="widget-input-bar"
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(inputText);
            }}
          >
            <input 
              type="text" 
              className="widget-input"
              placeholder="Ask for an occasion or notes..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={loading}
            />
            <button type="submit" className="widget-send" disabled={!inputText.trim() || loading}>
              <Send size={15} />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default AiSommelierWidget;
