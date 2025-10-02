import React from 'react';
import './Testimonials.css';
import '../styles/animations.css';
import { useScrollAnimation, useStaggeredAnimation } from '../hooks/useScrollAnimation';

const Testimonials = () => {
  const [sectionRef, isSectionVisible] = useScrollAnimation();
  const [setTestimonialsVisible, visibleTestimonials] = useStaggeredAnimation(6, 0.4);

  React.useEffect(() => {
    if (isSectionVisible) {
      setTestimonialsVisible(true);
    }
  }, [isSectionVisible, setTestimonialsVisible]);

  const testimonials = [
    {
      id: 1,
      name: "Bandana Sinha Thakur",
      rating: 5,
      text: "I love how fresh M.R. Milk tastes! It honestly reminds me of the milk we used to get back home from the dairy. The packaging is neat, no spills, and always feels hygienic. I feel happy giving it to my kids every morning."
    },
    {
      id: 2,
      name: "Ravinder Kumar",
      rating: 5,
      text: "I've been using M.R. Milk for quite some time now, and it has never let me down. Freshness, quality, hygiene - everything is top-notch. I've even recommended it to my relatives, and they all feel the same way."
    },
    {
      id: 3,
      name: "Renu",
      rating: 5,
      text: "M.R. Milk is always fresh and clean. I don't have to worry about quality at all, which makes life easier. The packaging is also very convenient. It's become a daily part of my kitchen."
    },
    {
      id: 4,
      name: "Rakhi Sharma",
      rating: 5,
      text: "I can really taste the difference with M.R. Milk. It's rich, fresh, and I know it's safe for my family. The packaging is also hygienic and easy to handle. I feel good knowing I'm giving the best to my loved ones."
    },
    {
      id: 5,
      name: "Paritosh",
      rating: 5,
      text: "The milk is fresh, the taste is perfect, and the packaging is spot on. Honestly, I don't even think about switching brands anymore. M.R. Milk has earned my trust."
    },
    {
      id: 6,
      name: "Hitesh Mathur",
      rating: 5,
      text: "M.R. Milk has become a part of my family's routine. The milk is always fresh, and you can tell it's handled with care. I don't have to worry about hygiene or quality, and that's a big relief in today's times."
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
