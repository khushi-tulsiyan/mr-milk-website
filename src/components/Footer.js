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
          alt="JFAM Footer"
          className="footer-image"
        />
        <img src="/images/mr/logo.png" alt="JFAM" className="footer-logo" />
        {/* The social icons are part of footer.png; this link sits over the Instagram one. */}
        <a
          href="https://www.instagram.com/jfam.milk/"
          target="_blank"
          rel="noopener noreferrer"
          className="footer-social footer-instagram"
          aria-label="Follow JFAM on Instagram"
          title="Instagram"
        />
        <p className="footer-copyright">
          © {new Date().getFullYear()} JFAM. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
