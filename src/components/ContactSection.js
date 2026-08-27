import React from 'react';
import './ContactSection.css';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

const ContactSection = () => {
  const [sectionRef] = useScrollAnimation();

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
