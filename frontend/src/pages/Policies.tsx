import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ShieldCheck, Sparkles, Truck, Droplets } from 'lucide-react';
import './Policies.css';

export const Policies: React.FC = () => {
  const { hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const element = document.querySelector(hash);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      window.scrollTo(0, 0);
    }
  }, [hash]);

  return (
    <div className="policies-page">
      <div className="container">
        <div className="policies-card">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span className="section-eyebrow">Trust & Integrity</span>
            <h1 style={{ fontSize: '2.8rem', marginBottom: '0.5rem' }}>Client Care & Policies</h1>
            <p style={{ color: 'var(--text-muted)' }}>
              Complete transparency regarding our 2ml sample guarantee, authentic sourcing, delivery, and perfume longevity.
            </p>
          </div>

          {/* Policy 1: Complimentary Sample & Returns */}
          <section id="returns" className="policy-block">
            <h2>
              <Sparkles size={24} style={{ color: 'var(--gold-primary)' }} />
              The Complimentary 2ml Tester & 30-Day Return Promise
            </h2>
            <p>
              Perfume is an intimate art form that evolves uniquely based on skin pH, body temperature, and ambient humidity. We believe you should never be locked into a fragrance you haven't experienced on your own skin.
            </p>
            <ul>
              <li><strong>Included Sample Vial:</strong> Every full flacon ordered from Vibe Perfume arrives paired with an identical 2ml spray tester vial nestled outside the master box.</li>
              <li><strong>Test Risk-Free:</strong> Spritz and evaluate the 2ml sample over 48 hours without breaking the security seal or cellophane on the master flacon.</li>
              <li><strong>Hassle-Free Return:</strong> If the drydown does not captivate you, simply initiate a return within 30 days. As long as the master flacon remains sealed, you receive an immediate 100% refund or atelier exchange. The 2ml tester is yours to keep.</li>
            </ul>
          </section>

          {/* Policy 2: Authenticity */}
          <section id="authenticity" className="policy-block">
            <h2>
              <ShieldCheck size={24} style={{ color: 'var(--gold-primary)' }} />
              100% Atelier Authenticity Guarantee
            </h2>
            <p>
              We maintain direct, verified contractual relationships with haute perfumery houses in Grasse, Florence, Dubai, London, and Paris. We do not participate in gray-market or parallel imports.
            </p>
            <ul>
              <li><strong>Batch Code Traceability:</strong> Every bottle carries laser-etched batch identifiers matching the manufacturer's master certificate of authenticity.</li>
              <li><strong>Fresh Formulations:</strong> Our stock is stored in climate-controlled storage between 16°C and 18°C away from UV light to prevent oxidation of volatile citrus and delicate floral molecules.</li>
              <li><strong>IFRA Compliance:</strong> All formulations adhere strictly to International Fragrance Association safety thresholds and disclose allergens transparently.</li>
            </ul>
          </section>

          {/* Policy 3: Shipping */}
          <section id="shipping" className="policy-block">
            <h2>
              <Truck size={24} style={{ color: 'var(--gold-primary)' }} />
              Express Delivery & Climate-Safe Transit
            </h2>
            <p>
              Delicate perfume oils can degrade if exposed to excessive heat or rough transit. We utilize specialized multi-layer packaging:
            </p>
            <ul>
              <li><strong>Complimentary Shipping:</strong> Free express delivery on all orders over ₹2,000 across India. For orders below ₹2,000, standard transit is ₹150.</li>
              <li><strong>Transit Times:</strong> Dispatched within 24 hours of confirmation. Delivery reaches metropolitan hubs in 2–3 business days, and other regions in 3–5 business days.</li>
              <li><strong>Fragile Insurance:</strong> All packages are insured against transit breakage or leakage. If your flacon arrives compromised, we dispatch an immediate replacement within 24 hours.</li>
            </ul>
          </section>

          {/* Policy 4: Scent Care Tips */}
          <section id="care" className="policy-block">
            <h2>
              <Droplets size={24} style={{ color: 'var(--gold-primary)' }} />
              Master Perfumer Storage & Longevity Guidelines
            </h2>
            <p>
              Maximize the longevity and projection of your artisanal fragrances by observing these timeless practices:
            </p>
            <ul>
              <li><strong>Pulse Point Application:</strong> Spray onto warm vascular zones—wrists, the hollow of the neck, behind the earlobes, and inside the elbows. The warmth radiates the scent outward.</li>
              <li><strong>Do Not Rub:</strong> Never rub your wrists together after spraying. Friction creates heat that breaks down delicate top notes (like bergamot and pink pepper) prematurely.</li>
              <li><strong>Hydrate First:</strong> Fragrance molecules adhere significantly better to moisturized skin. Apply an unscented lotion or squalane oil before spritzing.</li>
              <li><strong>Keep Away from Steam:</strong> Avoid storing perfumes in the bathroom. Humidity and temperature fluctuations break down aromatic bonds. Store in a cool, dark drawer or wardrobe.</li>
            </ul>
          </section>

          {/* Policy 5: Privacy Policy */}
          <section id="privacy" className="policy-block">
            <h2>Privacy Policy</h2>
            <p>
              Vibe Fragrances Private Limited is committed to protecting your personal data in accordance with the Information Technology Act, 2000 and Digital Personal Data Protection (DPDP) Act.
            </p>
            <ul>
              <li><strong>Data Collection:</strong> We collect contact information (name, address, phone number, email) solely for shipping order fulfillment and delivery tracking updates.</li>
              <li><strong>Zero Sale of Data:</strong> We never sell, rent, or lease your personal information to third-party advertisers.</li>
              <li><strong>Payment Security:</strong> Payment details are processed through RBI-authorized PCI-DSS compliant gateways with 256-bit SSL encryption. We never store credit/debit card credentials.</li>
            </ul>
          </section>

          {/* Policy 6: Terms of Service */}
          <section id="terms" className="policy-block">
            <h2>Terms of Service</h2>
            <p>
              By accessing Vibe Perfume, you agree to comply with our terms. Products are intended for personal consumer use. Prices listed in INR include applicable GST. All trademarks, bottle designs, and formulation descriptions are property of their respective ateliers.
            </p>
          </section>

          {/* Policy 7: Grievance Redressal */}
          <section id="grievance" className="policy-block">
            <h2>Grievance Redressal & Statutory Compliance</h2>
            <p>
              In compliance with the Consumer Protection (E-Commerce) Rules, 2020:
            </p>
            <ul>
              <li><strong>Grievance Officer:</strong> Mr. Raghav Mehra</li>
              <li><strong>Email:</strong> grievance@vibefragrance.in | concierge@vibefragrance.in</li>
              <li><strong>Registered Office:</strong> Vibe Fragrances Private Limited, DLF Phase 5, Golf Course Road, Gurugram, Haryana 122002</li>
              <li><strong>Response Timeline:</strong> Acknowledgement within 48 hours; resolution within 30 days.</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Policies;
