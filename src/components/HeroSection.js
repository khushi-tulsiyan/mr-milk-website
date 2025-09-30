import React, { useEffect, useState } from 'react';
import './HeroSection.css';
import '../styles/animations.css';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import ProductGrid from './ProductGrid';

const HeroSection = () => {
  const [frameRef, isVisible] = useScrollAnimation();
  const [whyRef, isWhyVisible] = useScrollAnimation();
  const [visibleWords, setVisibleWords] = useState([]);
  const [showTagline, setShowTagline] = useState(false);

  useEffect(() => {
    setVisibleWords([0]);
    const timer1 = setTimeout(() => {
      setVisibleWords(prev => [...prev, 1]);
    }, 500);
    const timer2 = setTimeout(() => {
      setVisibleWords(prev => [...prev, 2]);
    }, 1000);
    const timer3 = setTimeout(() => {
      setShowTagline(true);
    }, 3500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  return (
    <section className="hero-section">
      {/* SVG base frame (first frame) */}
      <div className={`hero-svg-frame anim ${isVisible ? 'in-view' : ''}`} ref={frameRef}>
        <img
          src="/images/mr/hero-reference.svg"
          alt="Hero Frame"
          className="hero-base-svg"
        />
      </div>

      {/* Text overlay above SVG */}
      <div className="hero-text-overlay">
        <div className="brand-top anim anim-fade-slide">
          <span className="brand-rainbow">M.R. MILK</span>
        </div>
        <div className="hero-text">
          <h1 className="hero-words">
            <span className={`hero-word ${visibleWords.includes(0) ? 'visible' : ''}`}>PURE</span>
            <span className={`hero-word ${visibleWords.includes(1) ? 'visible' : ''}`}>FRESH</span>
            <span className={`hero-word ${visibleWords.includes(2) ? 'visible' : ''}`}>HEALTHY</span>
          </h1>
          <p className={`hero-tagline ${showTagline ? 'visible' : ''}`}>Straight from the source • Naturally yours</p>
        </div>
      </div>

      {/* Why Choose Us image (animated) over the SVG */}
      <div className={`why-overlay anim ${isWhyVisible ? 'in-view' : ''}`} ref={whyRef}>
        <img
          src="/images/mr/Property 1=Variant3.png"
          alt="Why Choose Us"
          className="why-overlay-image"
        />
      </div>

      {/* Product Cards after Why Choose Us */}
      <div className="hero-products-section">
        <div className="hero-product-cards">
          {/* RAW A2 COW MILK */}
          <div className="hero-product-card">
            <div className="product-visual">
              <img 
                src="/images/mr/raw a2 cow milk without bg.png" 
                alt="RAW A2 COW MILK"
                className="product-bottle-image"
              />
            </div>
            <button className="hero-buy-btn">BUY NOW</button>
            <div className="hero-product-name">RAW A2 COW MILK</div>
            <div className="hero-product-desc">A2 milk from Sahiwal cows, easy to digest and naturally pure</div>
            <div className="hero-contact">Call +91 72309 20774</div>
          </div>

          {/* RAW BUFFALO MILK */}
          <div className="hero-product-card">
            <div className="product-visual">
              <img 
                src="/images/mr/BUFFALOA MILK.png" 
                alt="RAW BUFFALO MILK"
                className="product-bottle-image"
              />
            </div>
            <button className="hero-buy-btn">BUY NOW</button>
            <div className="hero-product-name">RAW BUFFALO MILK</div>
            <div className="hero-product-desc">Creamy buffalo milk, rich and wholesome for a healthy diet</div>
            <div className="hero-contact">Call +91 72309 20774</div>
          </div>

          {/* RAW COW MILK */}
          <div className="hero-product-card">
            <div className="product-visual">
              <img 
                src="/images/mr/raw buffalo milk.png" 
                alt="RAW COW MILK"
                className="product-bottle-image"
              />
            </div>
            <button className="hero-buy-btn">BUY NOW</button>
            <div className="hero-product-name">RAW COW MILK</div>
            <div className="hero-product-desc">Pure cow's milk, fresh from the farm to your home</div>
            <div className="hero-contact">Call +91 72309 20774</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

