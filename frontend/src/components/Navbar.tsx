import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Heart, ShoppingBag, Scale, Menu, X, Shield } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useCompare } from '../context/CompareContext';
import SearchModal from './SearchModal';
import './Navbar.css';

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const location = useLocation();

  const { totalCount, openCart } = useCart();
  const { wishlistCount } = useWishlist();
  const { compareCount } = useCompare();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { name: 'Collections', path: '/collections' },
    { name: 'Scent Finder', path: '/scent-finder' },
    { name: 'Note Glossary', path: '/notes' },
    { name: 'Track Order', path: '/track-order' }
  ];

  return (
    <>
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="container nav-content">
          {/* Logo */}
          <Link to="/" className="logo-wrap">
            <span className="logo">
              VIBE<span>PERFUME</span>
            </span>
            <span className="logo-tagline">Haute Parfumerie</span>
          </Link>

          {/* Desktop Navigation */}
          <ul className="nav-links">
            {navLinks.map(link => (
              <li key={link.name}>
                <Link
                  to={link.path}
                  className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>

          {/* Action Icons */}
          <div className="nav-actions">
            {/* Search */}
            <button 
              className="nav-action-btn" 
              onClick={() => setIsSearchOpen(true)}
              title="Search fragrances"
              aria-label="Search"
            >
              <Search size={20} />
            </button>

            {/* Compare */}
            <Link
              to="/compare"
              className="nav-action-btn"
              title="Compare fragrances"
              aria-label="Compare fragrances"
            >
              <Scale size={20} />
              {compareCount > 0 && (
                <span className="nav-counter-badge">{compareCount}</span>
              )}
            </Link>

            {/* Wishlist */}
            <Link 
              to="/wishlist" 
              className="nav-action-btn"
              title="Saved fragrances"
              aria-label="Wishlist"
            >
              <Heart size={20} />
              {wishlistCount > 0 && (
                <span className="nav-counter-badge">{wishlistCount}</span>
              )}
            </Link>

            {/* Shopping Bag */}
            <button 
              className="nav-action-btn" 
              onClick={openCart}
              title="View Shopping Bag"
              aria-label="Shopping Bag"
            >
              <ShoppingBag size={20} />
              {totalCount > 0 && (
                <span className="nav-counter-badge">{totalCount}</span>
              )}
            </button>

            {/* Admin Portal link */}
            <Link to="/admin" className="admin-nav-link" title="Atelier Portal">
              <Shield size={13} style={{ display: 'inline', marginRight: 4, verticalAlign: -1 }} />
              Admin
            </Link>

            {/* Mobile menu toggle */}
            <button 
              className="mobile-menu-btn" 
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle navigation menu"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <div className={`mobile-nav-drawer ${isOpen ? 'open' : ''}`}>
          {navLinks.map(link => (
            <Link 
              key={link.name} 
              to={link.path} 
              className="mobile-link"
              onClick={() => setIsOpen(false)}
            >
              {link.name}
            </Link>
          ))}
          <Link to="/compare" className="mobile-link" onClick={() => setIsOpen(false)}>
            Compare Fragrances ({compareCount})
          </Link>
          <Link to="/wishlist" className="mobile-link" onClick={() => setIsOpen(false)}>
            My Wishlist ({wishlistCount})
          </Link>
          <Link to="/admin" className="mobile-link" onClick={() => setIsOpen(false)}>
            Atelier Staff Admin
          </Link>
        </div>
      </nav>

      {/* Search Modal */}
      <SearchModal 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
      />
    </>
  );
};

export default Navbar;
