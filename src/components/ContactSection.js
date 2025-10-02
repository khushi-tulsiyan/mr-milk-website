import React, { useEffect, useState } from 'react';
import './ContactSection.css';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

const ContactSection = () => {
  const [sectionRef, isVisible] = useScrollAnimation();
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        setShowContent(true);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  return (
    <section ref={sectionRef} className="contact-section">
      <div className="contact-container">
        <img
          src="/images/mr/contact-us.png"
          alt="Contact Us"
          className="contact-image"
        />
      </div>
    </section>
  );
};

export default ContactSection;
