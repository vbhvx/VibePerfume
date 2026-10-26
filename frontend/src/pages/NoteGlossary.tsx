import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { fetchNotes } from '../api/products';
import type { NoteGlossaryItem } from '../types';
import './NoteGlossary.css';

export const NoteGlossary: React.FC = () => {
  const [notes, setNotes] = useState<NoteGlossaryItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadNotes = async () => {
      try {
        setLoading(true);
        const res = await fetchNotes();
        if (res.success && res.data) {
          setNotes(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadNotes();
  }, []);

  const categories = ['All', 'Citrus', 'Wood', 'Floral', 'Spice', 'Amber', 'Musk', 'Gourmand', 'Aquatic', 'Fresh'];

  const filteredNotes = selectedCategory === 'All'
    ? notes
    : notes.filter(n => n.category.toLowerCase() === selectedCategory.toLowerCase());

  return (
    <div className="notes-page">
      <div className="container">
        <div className="notes-header">
          <span className="section-eyebrow">Aromatic Lexicon</span>
          <h1>Olfactory Note Glossary</h1>
          <p>
            Demystify the raw materials of luxury perfumery. Learn the natural origins, extraction methods, and harmonic roles of key ingredients.
          </p>
        </div>

        {/* Categories Bar */}
        <div className="notes-category-nav">
          {categories.map(cat => (
            <button
              key={cat}
              className={`family-pill ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--text-muted)' }}>
            Loading aromatic library...
          </div>
        ) : (
          <div className="notes-grid">
            {filteredNotes.map(item => (
              <div 
                key={item.name} 
                className="note-glossary-card"
                onClick={() => navigate(`/collections?note=${encodeURIComponent(item.name)}`)}
                role="button"
                tabIndex={0}
              >
                <div>
                  <div className="note-card-top">
                    <span className="note-card-category">{item.category}</span>
                    <span className="note-card-count">
                      {item.productCount || 1} {item.productCount === 1 ? 'Fragrance' : 'Fragrances'}
                    </span>
                  </div>
                  <h3>{item.name}</h3>
                  <p>{item.description}</p>
                </div>

                <span className="btn-note-explore">
                  Explore {item.name} Fragrances <ArrowRight size={14} />
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NoteGlossary;
