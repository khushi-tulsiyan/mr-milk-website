import React, { useEffect, useState } from 'react';
import './HeroSection.css';
import '../styles/animations.css';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import ProductGrid from './ProductGrid';

const HeroSection = () => {
  const [frameRef, isVisible] = useScrollAnimation();
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
      {/* Base frame (first frame) */}
      <div className={`hero-svg-frame anim ${isVisible ? 'in-view' : ''}`} ref={frameRef}>
        <img
          src="/images/mr/Variant6.png"
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


      {/* Why Choose Us section after hero */}
      <div className="why-choose-us-section">
        <div className="why-choose-us-container">
          <img
            src="/images/mr/Property 1=Variant3.png"
            alt="Why Choose Us"
            className="why-choose-us-image"
          />
        </div>
      </div>

      {/* ProductGrid component after Why Choose Us animation */}
      <ProductGrid />
    </section>
  );
};

export default HeroSection;

