import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { ShieldCheck, Truck, Sparkles } from 'lucide-react';
import './Footer.css';

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address.');
      return;
    }
    toast.success('Welcome to the Essence Circle. Check your inbox for a special welcome code!');
    setEmail('');
  };

  return (
    <footer className="footer" role="contentinfo">
      <div className="container">
        <div className="footer-top">
          {/* Brand Col */}
          <div className="footer-brand">
            <Link to="/" className="logo">
              VIBE<span>PERFUME</span>
            </Link>
            <p className="footer-bio">
              A curated digital sanctuary celebrating haute parfumerie. We empower scent discovery through structured olfactory compositions, verified ingredients, and our risk-free complimentary tester vial promise.
            </p>
            <div className="footer-trust-badges">
              <span className="trust-badge-pill">
                <ShieldCheck size={12} style={{ display: 'inline', marginRight: 4, verticalAlign: -1 }} />
                100% Authentic Ateliers
              </span>
              <span className="trust-badge-pill">
                <Sparkles size={12} style={{ display: 'inline', marginRight: 4, verticalAlign: -1 }} />
                Complimentary Tester Vial
              </span>
              <span className="trust-badge-pill">
                <Truck size={12} style={{ display: 'inline', marginRight: 4, verticalAlign: -1 }} />
                Free Express Delivery ₹2000+
              </span>
            </div>
          </div>

          {/* Scent Discovery Links */}
          <div className="footer-col">
            <h4>Olfactory Journeys</h4>
            <ul className="footer-links">
              <li><Link to="/collections">All Fragrances</Link></li>
              <li><Link to="/scent-finder">Scent Finder Quiz</Link></li>
              <li><Link to="/notes">Olfactory Note Glossary</Link></li>
              <li><Link to="/compare">Fragrance Comparison Matrix</Link></li>
              <li><Link to="/collections?family=woody">Woody & Oud Accords</Link></li>
              <li><Link to="/collections?family=floral">Luminous Floral Gardens</Link></li>
            </ul>
          </div>

          {/* Customer Experience & Trust */}
          <div className="footer-col">
            <h4>Client Care & Trust</h4>
            <ul className="footer-links">
              <li><Link to="/track-order">Track Your Shipment</Link></li>
              <li><Link to="/policies#shipping">Delivery & Shipping Terms</Link></li>
              <li><Link to="/policies#returns">30-Day Returns & Tester Policy</Link></li>
              <li><Link to="/policies#authenticity">Atelier Sourcing Guarantee</Link></li>
              <li><Link to="/policies#care">Perfume Storage & Longevity</Link></li>
              <li><Link to="/admin">Staff Administration Portal</Link></li>
            </ul>
          </div>

          {/* Newsletter Col */}
          <div className="footer-col footer-newsletter">
            <h4>The Essence Circle</h4>
            <p>
              Subscribe for private atelier launches, master perfumer interviews, and private seasonal invitations.
            </p>
            <form onSubmit={handleSubscribe} className="footer-newsletter-form">
              <input 
                type="email" 
                placeholder="Enter your email address"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="footer-input"
                aria-label="Email for newsletter"
              />
              <button type="submit" className="btn-gold" style={{ width: '100%' }}>
                Join Private List
              </button>
            </form>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <div>
            © {new Date().getFullYear()} Vibe Perfume Haute Parfumerie. All rights reserved.
          </div>
          <div className="footer-legal-links">
            <Link to="/policies#privacy">Privacy Protocol</Link>
            <Link to="/policies#terms">Terms of Service</Link>
            <Link to="/policies#ifra">IFRA & Cosmetic Safety Standards</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
