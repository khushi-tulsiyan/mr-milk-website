import React, { useCallback, useEffect, useRef, useState } from 'react';
import './Testimonials.css';
import '../styles/animations.css';
import { useScrollAnimation, useStaggeredAnimation } from '../hooks/useScrollAnimation';

// Width of one card plus the gap: how far the track scrolls per slide.
const cardStep = (track) => {
  const card = track?.children[0];
  if (!card) return 0;
  return card.offsetWidth + (parseFloat(getComputedStyle(track).columnGap) || 0);
};

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
      text: "I love how fresh JFAM tastes! It honestly reminds me of the milk we used to get back home from the dairy. The packaging is neat, no spills, and always feels hygienic. I feel happy giving it to my kids every morning."
    },
    {
      id: 2,
      name: "Ravinder Kumar",
      rating: 5,
      text: "I've been using JFAM for quite some time now, and it has never let me down. Freshness, quality, hygiene - everything is top-notch. I've even recommended it to my relatives, and they all feel the same way."
    },
    {
      id: 3,
      name: "Renu",
      rating: 5,
      text: "JFAM is always fresh and clean. I don't have to worry about quality at all, which makes life easier. The packaging is also very convenient. It's become a daily part of my kitchen."
    },
    {
      id: 4,
      name: "Rakhi Sharma",
      rating: 5,
      text: "I can really taste the difference with JFAM. It's rich, fresh, and I know it's safe for my family. The packaging is also hygienic and easy to handle. I feel good knowing I'm giving the best to my loved ones."
    },
    {
      id: 5,
      name: "Paritosh",
      rating: 5,
      text: "The milk is fresh, the taste is perfect, and the packaging is spot on. Honestly, I don't even think about switching brands anymore. JFAM has earned my trust."
    },
    {
      id: 6,
      name: "Hitesh Mathur",
      rating: 5,
      text: "JFAM has become a part of my family's routine. The milk is always fresh, and you can tell it's handled with care. I don't have to worry about hygiene or quality, and that's a big relief in today's times."
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

  // Slider: a scroll-snapping row (swipe on touch), with arrows, dots and
  // auto-advance that pauses while the visitor hovers, focuses or touches it.
  const trackRef = useRef(null);
  const [page, setPage] = useState(0);
  const [pageCount, setPageCount] = useState(testimonials.length);
  const [paused, setPaused] = useState(false);

  const measure = useCallback(() => {
    const track = trackRef.current;
    const step = cardStep(track);
    if (!track || !step) return;
    const perView = Math.max(1, Math.round((track.clientWidth + 1) / step));
    setPageCount(Math.max(1, testimonials.length - perView + 1));
    setPage(Math.round(track.scrollLeft / step));
  }, [testimonials.length]);

  useEffect(() => {
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [measure]);

  const goTo = useCallback((target) => {
    const track = trackRef.current;
    if (!track) return;
    const next = (target + pageCount) % pageCount;
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    track.scrollTo?.({ left: next * cardStep(track), behavior: reduceMotion ? 'auto' : 'smooth' });
    setPage(next);
  }, [pageCount]);

  useEffect(() => {
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (paused || reduceMotion || pageCount < 2 || !isSectionVisible) return undefined;
    const timer = setInterval(() => goTo(page + 1), 5000);
    return () => clearInterval(timer);
  }, [paused, page, pageCount, goTo, isSectionVisible]);

  const onScroll = () => {
    const step = cardStep(trackRef.current);
    if (step) setPage(Math.round(trackRef.current.scrollLeft / step));
  };

  return (
    <section ref={sectionRef} className="testimonials-section">
      <div className="container">
        <h2 className="section-title anim anim-fade-slide">Customer Feedbacks</h2>

        <div
          className="testimonials-slider"
          role="region"
          aria-roledescription="carousel"
          aria-label="Customer reviews"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
          onTouchStart={() => setPaused(true)}
        >
          <button className="slider-arrow prev" onClick={() => goTo(page - 1)} aria-label="Previous reviews">‹</button>

          <div className="testimonials-track" ref={trackRef} onScroll={onScroll}>
            {testimonials.map((testimonial, index) => (
              <div
                key={testimonial.id}
                className={`testimonial-card ${visibleTestimonials.includes(index) ? 'visible' : ''}`}
                role="group"
                aria-roledescription="slide"
                aria-label={`Review ${index + 1} of ${testimonials.length}`}
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
                      <div className="user-rating" aria-label={`${testimonial.rating} out of 5 stars`}>
                        {renderStars(testimonial.rating)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button className="slider-arrow next" onClick={() => goTo(page + 1)} aria-label="Next reviews">›</button>
        </div>

        {pageCount > 1 && (
          <div className="slider-dots">
            {Array.from({ length: pageCount }, (_, i) => (
              <button
                key={i}
                className={`slider-dot ${i === page ? 'active' : ''}`}
                onClick={() => goTo(i)}
                aria-label={`Show review ${i + 1}`}
                aria-current={i === page}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Testimonials;
