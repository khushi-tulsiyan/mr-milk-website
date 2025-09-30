import React from 'react';
import './ProductGrid.css';
import '../styles/animations.css';
import { useScrollAnimation, useStaggeredAnimation } from '../hooks/useScrollAnimation';

const ProductGrid = () => {
  const [sectionRef, isSectionVisible] = useScrollAnimation();
  const [setDairyVisible, visibleDairyItems] = useStaggeredAnimation(3, 0.3);

  React.useEffect(() => {
    if (isSectionVisible) {
      // Start dairy products animation immediately
      setDairyVisible(true);
    }
  }, [isSectionVisible, setDairyVisible]);

  // Ghee products removed - focusing only on milk products

  const dairyProducts = [
    {
      id: 4,
      name: "RAW A2 COW MILK",
      image: "/images/mr/raw a2 cow milk without bg.png",
      description: "Premium A2 cow milk"
    },
    {
      id: 5,
      name: "RAW BUFFALO MILK",
      image: "/images/mr/BUFFALOA MILK.png",
      description: "Fresh buffalo milk"
    },
    {
      id: 6,
      name: "RAW COW MILK",
      image: "/images/mr/raw buffalo milk.png",
      description: "Fresh cow milk"
    }
  ];

  return (
    <section ref={sectionRef} className="product-grid-section">
      <div className="container">
        {/* Ghee Products Row - Removed */}

        {/* Dairy Products Row */}
        <div className="product-row dairy-row stagger">
          {dairyProducts.map((product, index) => (
            <div 
              key={product.id} 
              className={`product-card dairy-card img-card ${visibleDairyItems.includes(index) ? 'visible' : ''}`}
            >
              <div className="product-image-container">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="product-image"
                />
              </div>
              <button className="btn btn-primary buy-now-btn">BUY NOW</button>
              <div className="product-name">{product.name}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductGrid;
