import React from 'react';
import './Footer.css';
import '../styles/animations.css';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

const Footer = () => {
  const [footerRef] = useScrollAnimation();

  return (
    <footer ref={footerRef} className="footer anim anim-fade-slide">
      <div className="footer-container">
        <img
          src="/images/mr/footer.png"
          alt="M.R. MILK Footer"
          className="footer-image"
        />
      </div>
    </footer>
  );
};

export default Footer;
