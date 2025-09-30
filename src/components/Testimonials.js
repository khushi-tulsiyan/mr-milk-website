import React from 'react';
import './Testimonials.css';
import '../styles/animations.css';
import { useScrollAnimation, useStaggeredAnimation } from '../hooks/useScrollAnimation';

const Testimonials = () => {
  const [sectionRef, isSectionVisible] = useScrollAnimation();
  const [setTestimonialsVisible, visibleTestimonials] = useStaggeredAnimation(3, 0.4);

  React.useEffect(() => {
    if (isSectionVisible) {
      setTestimonialsVisible(true);
    }
  }, [isSectionVisible, setTestimonialsVisible]);

  const testimonials = [
    {
      id: 1,
      name: "Rakhi Sharma",
      rating: 5,
      text: "I am highly satisfied with M.R Milk products. It comes with excellent packaging with commendable hygiene. Would definitely recommend it."
    },
    {
      id: 2,
      name: "Paritosh",
      rating: 4,
      text: "I am highly satisfied with M.R Milk products. It comes with excellent packaging with commendable hygiene. Would definitely recommend it. Just a bit overpriced."
    },
    {
      id: 3,
      name: "Hitesh Mathur",
      rating: 5,
      text: "I am highly satisfied with M.R Milk products. It comes with excellent packaging with commendable hygiene. Would definitely recommend it."
    }
  ];

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <span
        key={index}
        className={`star ${index < rating ? 'filled' : 'empty'}`}
      >
        ★
      </span>
    ));
  };

  return (
    <section ref={sectionRef} className="testimonials-section">
      <div className="container">
        <h2 className="section-title anim anim-fade-slide">Customer Feedbacks</h2>
        
        <div className="testimonials-grid stagger">
          {testimonials.map((testimonial, index) => (
            <div 
              key={testimonial.id} 
              className={`testimonial-card ${visibleTestimonials.includes(index) ? 'visible' : ''}`}
            >
              <div className="testimonial-content">
                <p className="testimonial-text">"{testimonial.text}"</p>
              </div>
              
              <div className="testimonial-footer">
                <div className="user-info">
                  <div className="user-avatar">
                    <div className="avatar-placeholder"></div>
                  </div>
                  <div className="user-details">
                    <div className="user-name">{testimonial.name}</div>
                    <div className="user-rating">
                      {renderStars(testimonial.rating)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
