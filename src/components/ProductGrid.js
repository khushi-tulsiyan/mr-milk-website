import React from 'react';
import './ProductGrid.css';
import '../styles/animations.css';
import { useScrollAnimation, useStaggeredAnimation } from '../hooks/useScrollAnimation';

const ProductGrid = () => {
  const [sectionRef, isSectionVisible] = useScrollAnimation();
  const [setDairyVisible, visibleDairyItems] = useStaggeredAnimation(10, 0.2);

  React.useEffect(() => {
    if (isSectionVisible) {
      // Start dairy products animation immediately
      setDairyVisible(true);
    }
  }, [isSectionVisible, setDairyVisible]);

  const dairyProducts = [
    {
      id: 1,
      name: "RAW A2 COW MILK",
      image: "/images/mr/raw a2 cow milk without bg.png",
      description: "Premium A2 cow milk from Sahiwal cows, easy to digest and naturally pure"
    },
    {
      id: 2,
      name: "RAW BUFFALO MILK",
      image: "/images/mr/BUFFALOA MILK.png",
      description: "Creamy buffalo milk, rich and wholesome for a healthy diet"
    },
    {
      id: 3,
      name: "RAW COW MILK",
      image: "/images/mr/raw buffalo milk.png",
      description: "Pure cow's milk, fresh from the farm to your home"
    },
    {
      id: 4,
      name: "BUFFALO GHEE",
      image: "/images/mr/Frame 32.png",
      description: "Rich buffalo ghee, traditional and flavorful"
    },
    {
      id: 5,
      name: "BUFFALO CHAACH",
      image: "/images/mr/Buffalo CHAACH.png",
      description: "Traditional buffalo buttermilk, refreshing and nutritious"
    },
    {
      id: 6,
      name: "COW GHEE",
      image: "/images/mr/COW GHEE.png",
      description: "Pure cow ghee, rich in flavor and health benefits"
    },
    {
      id: 7,
      name: "COW CHAACH",
      image: "/images/mr/COW CHAACH.png",
      description: "Fresh cow buttermilk, cooling and digestive"
    },
    {
      id: 8,
      name: "DAHI",
      image: "/images/mr/DAHI.png",
      description: "Fresh homemade yogurt, probiotic-rich and creamy"
    },
    {
      id: 9,
      name: "A2 COW GHEE",
      image: "/images/mr/A2 cow ghee without bg.png",
      description: "Premium A2 cow ghee, made from the finest milk"
    },
    {
      id: 10,
      name: "PANEER",
      image: "/images/mr/Group 47.png",
      description: "Fresh homemade paneer, soft and protein-rich"
    }
  ];

  return (
    <section ref={sectionRef} className="product-grid-section">
      <div className="container">
        {/* Section Heading */}
        <div className="section-heading">
          <h2 className="products-title">Our Products</h2>
        </div>

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
              <div className="product-description">{product.description}</div>
              <div className="product-contact">Call +91 72309 20774</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductGrid;
