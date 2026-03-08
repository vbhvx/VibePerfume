import './Hero.css';

const Hero = () => {
  return (
    <section className="hero">
      <div className="hero-overlay"></div>
      <div className="container hero-content fade-in">
        <span className="hero-badge">Curated Excellence</span>
        <h1>Discover Your <br /><span>Signature Scent</span></h1>
        <p>Explore our curated collection of luxury fragrances, <br />crafted for those who appreciate the finer things in life.</p>
        <div className="hero-btns">
          <button className="btn-primary" onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}>
            Explore Collection
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
