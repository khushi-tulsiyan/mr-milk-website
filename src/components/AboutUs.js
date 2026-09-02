import React from 'react';
import './AboutUs.css';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

const AboutUs = () => {
  const [sectionRef] = useScrollAnimation();
  const bgImage = process.env.PUBLIC_URL + '/images/mr/jfam_cow.png';

  return (
    <section ref={sectionRef} className="about-us-section" style={{ backgroundImage: `url(${bgImage})` }}>
      <div className="about-us-container">
        <div className="about-us-content">
          <h2 className="about-us-title">About Us</h2>
          <div className="about-us-text">
            <p>
              At JFAM, our journey began in June 2024 with a simple mission: to bring pure, unadulterated milk and dairy products to your doorstep. We noticed a growing need for trustworthy, high-quality milk that you could feel good about giving to your family. Every day, we proudly serve over 100+ customers in Pilani, delivering fresh dairy products straight from the farm. Our dedication to quality means you get milk that is as pure as nature intended, just like it was meant to be. We believe that every glass of milk should be a symbol of health and trust. Thank you for making us a part of your daily life.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;
