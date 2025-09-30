import { useEffect, useRef, useState } from 'react';

// Professional IntersectionObserver system
let globalObserver = null;

const initializeObserver = () => {
  if (globalObserver) return globalObserver;

  globalObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const el = entry.target;
      if (entry.isIntersecting) {
        // If container is a stagger container -> use staggerIn
        if (el.classList.contains('stagger')) {
          staggerIn(el, parseInt(getComputedStyle(document.documentElement).getPropertyValue('--stagger-step')) || 80);
        } else {
          // default: add class .in-view (animation CSS will handle transitions)
          el.classList.add('in-view');
        }
        // optional: unobserve to avoid re-running
        globalObserver.unobserve(el);
      }
    });
  }, { threshold: 0.12 });

  // collect targets: any element with .anim or .stagger or data-animate
  document.querySelectorAll('.anim, .stagger, [data-animate]').forEach(el => globalObserver.observe(el));

  return globalObserver;
};

// staggerIn helper
function staggerIn(containerEl, step = 80) {
  const items = Array.from(containerEl.children);
  items.forEach((it, i) => {
    it.style.transitionDelay = (i * step) + 'ms';
    it.classList.add('in-view');
  });
}

// Parallax system
let parallaxElements = [];
let isParallaxRunning = false;

const startParallax = () => {
  if (isParallaxRunning) return;
  isParallaxRunning = true;

  const updateParallax = () => {
    const scrollY = window.scrollY;
    parallaxElements.forEach(el => {
      const factor = parseFloat(el.dataset.parallax) || 0.2;
      const offset = scrollY * factor;
      el.style.transform = `translate3d(0, ${offset}px, 0)`;
    });
    requestAnimationFrame(updateParallax);
  };
  
  requestAnimationFrame(updateParallax);
};

// Note: parallax loop is lightweight and cancels naturally with page close

// One-time initializer to be invoked from hooks/components
let animationsInitialized = false;
const initAnimationsOnce = () => {
  if (animationsInitialized) return;
  initializeObserver();
  parallaxElements = Array.from(document.querySelectorAll('[data-parallax]'));
  if (parallaxElements.length > 0) {
    startParallax();
  }
  animationsInitialized = true;
};

export const useScrollAnimation = (options = {}) => {
  const elementRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Ensure global observers are initialized once
    initAnimationsOnce();

    const threshold = options.threshold ?? 0.1;
    const rootMargin = options.rootMargin ?? '0px 0px -50px 0px';

    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Unobserve after first intersection to prevent re-triggering
          observer.unobserve(element);
        }
      },
      {
        threshold,
        rootMargin
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [options.threshold, options.rootMargin]);

  return [elementRef, isVisible];
};

export const useStaggeredAnimation = (itemCount, delay = 0.3) => {
  const [visibleItems, setVisibleItems] = useState([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!isVisible) return;

    const timers = [];
    for (let i = 0; i < itemCount; i++) {
      const timer = setTimeout(() => {
        setVisibleItems(prev => [...prev, i]);
      }, i * delay * 1000);
      timers.push(timer);
    }

    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [isVisible, itemCount, delay]);

  return [setIsVisible, visibleItems];
};

// Typing animation hook
export const useTypingAnimation = (text, speed = 100) => {
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (!text) return;
    
    setIsTyping(true);
    setDisplayText('');
    
    let index = 0;
    const timer = setInterval(() => {
      if (index < text.length) {
        setDisplayText(text.slice(0, index + 1));
        index++;
      } else {
        setIsTyping(false);
        clearInterval(timer);
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed]);

  return [displayText, isTyping];
};
