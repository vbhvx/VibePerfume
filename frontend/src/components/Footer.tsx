import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { ShieldCheck, Truck, Sparkles, MessageSquare, Phone, Mail } from 'lucide-react';
import './Footer.css';

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address.');
      return;
    }
    toast.success('Welcome to the Essence Circle! Use code VIBE10 for 10% off your first order.');
    setEmail('');
  };

  return (
    <footer className="footer" role="contentinfo">
      <div className="container">
        {/* Trust & Guarantee Strip */}
        <div className="footer-trust-strip">
          <div className="footer-trust-col">
            <Sparkles size={20} className="footer-trust-icon" />
            <div>
              <h4>Free 2 ml Tester Vial</h4>
              <p>Wear on skin first. Keep the tester, return the sealed full bottle within 30 days if not in love.</p>
            </div>
          </div>
          <div className="footer-trust-col">
            <ShieldCheck size={20} className="footer-trust-icon" />
            <div>
              <h4>100% Authentic Ateliers</h4>
              <p>Direct batch-verified sourcing from master perfumers. Formulated to IFRA international standards.</p>
            </div>
          </div>
          <div className="footer-trust-col">
            <Truck size={20} className="footer-trust-icon" />
            <div>
              <h4>Free Express Delivery</h4>
              <p>Complimentary insulated shipping across India on orders above ₹2,000. 2-4 business day delivery.</p>
            </div>
          </div>
        </div>

        <div className="footer-top">
          {/* Brand Col */}
          <div className="footer-brand">
            <Link to="/" className="logo">
              VIBE<span>PERFUME</span>
            </Link>
            <p className="footer-bio">
              India's premier digital sanctuary for artisanal and haute perfumerie. Transparent fragrance pyramids, concentration benchmarks, and risk-free sample-first exploration.
            </p>

            {/* Direct Concierge Contact */}
            <div className="footer-contact-block">
              <h5>Concierge & Client Care</h5>
              <div className="contact-item">
                <MessageSquare size={15} />
                <span>WhatsApp: +91 98765 43210</span>
              </div>
              <div className="contact-item">
                <Phone size={15} />
                <span>Phone: 1800-890-VIBE (Mon - Sat, 10am - 7pm IST)</span>
              </div>
              <div className="contact-item">
                <Mail size={15} />
                <span>Email: concierge@vibefragrance.in</span>
              </div>
            </div>
          </div>

          {/* Scent Discovery Links */}
          <div className="footer-col">
            <h4>Olfactory Journeys</h4>
            <ul className="footer-links">
              <li><Link to="/collections">All Fragrances</Link></li>
              <li><Link to="/scent-finder">Interactive Scent Quiz</Link></li>
              <li><Link to="/ai-sommelier">AI Fragrance Sommelier</Link></li>
              <li><Link to="/notes">Olfactory Note Glossary</Link></li>
              <li><Link to="/compare">Fragrance Comparison Matrix</Link></li>
              <li><Link to="/collections?family=woody">Woody & Oud Accords</Link></li>
              <li><Link to="/collections?family=floral">Floral Accords & Petals</Link></li>
              <li><Link to="/collections?family=citrus">Citrus & Fresh Accords</Link></li>
            </ul>
          </div>

          {/* Customer Experience & Trust */}
          <div className="footer-col">
            <h4>Client Care & Trust</h4>
            <ul className="footer-links">
              <li><Link to="/track-order">Track Your Shipment</Link></li>
              <li><Link to="/policies#returns">30-Day Sealed Bottle Returns</Link></li>
              <li><Link to="/policies#tester">How The 2ml Tester Works</Link></li>
              <li><Link to="/policies#authenticity">Batch Code Verification & Authenticity</Link></li>
              <li><Link to="/policies#shipping">Shipping & Insured Transit Policy</Link></li>
              <li><Link to="/policies#care">Perfume Storage & Shelf Life</Link></li>
            </ul>
          </div>

          {/* Newsletter Col */}
          <div className="footer-col footer-newsletter">
            <h4>The Essence Circle</h4>
            <p className="newsletter-incentive">
              Get <strong>10% off your first order</strong> and early access to limited private reserve batches.
            </p>
            <form onSubmit={handleSubscribe} className="footer-newsletter-form">
              <input 
                type="email" 
                placeholder="Enter your email address"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="footer-input"
                aria-label="Email for newsletter"
                required
              />
              <button type="submit" className="btn-gold" style={{ width: '100%' }}>
                Claim 10% Off & Join
              </button>
            </form>
            <span className="newsletter-note">
              No spam. Unsubscribe at any time with 1 click.
            </span>
          </div>
        </div>

        {/* Payment Methods & Business Registration */}
        <div className="footer-meta-bar">
          <div className="payment-badges-wrap">
            <span className="payment-title">Accepted Payment Methods:</span>
            <div className="payment-pills">
              <span className="payment-pill">UPI / GPay / PhonePe / Paytm</span>
              <span className="payment-pill">Visa / Mastercard / RuPay</span>
              <span className="payment-pill">NetBanking (50+ Banks)</span>
              <span className="payment-pill">Cash on Delivery (COD)</span>
              <span className="payment-pill">No-Cost EMI Available</span>
            </div>
          </div>

          <div className="business-details-wrap">
            <p>
              <strong>Vibe Fragrances Private Limited</strong> • CIN: U74999DL2024PTC123456 • GSTIN: 07AABCU9603R1ZM
            </p>
            <p>
              Registered Address: DLF Phase 5, Golf Course Road, Gurugram, HR 122002 • Grievance Officer: grievance@vibefragrance.in
            </p>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <div>
            © {new Date().getFullYear()} Vibe Fragrances Pvt. Ltd. All rights reserved.
          </div>
          <div className="footer-legal-links">
            <Link to="/policies#privacy">Privacy Policy</Link>
            <Link to="/policies#terms">Terms of Service</Link>
            <Link to="/policies#authenticity">Formulated to IFRA Standards</Link>
            <Link to="/policies#grievance">Grievance Redressal</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
