import React, { useState } from 'react';
import './GheeShop.css';
import catalog from '../data/gheeCatalog.json';
import { useCart } from '../context/CartContext';
import { formatINR } from '../utils/cart';

const GheeCard = ({ product }) => {
  const { addItem } = useCart();
  const [variantId, setVariantId] = useState(product.variants[product.variants.length - 1].id);
  const variant = product.variants.find((v) => v.id === variantId);

  return (
    <div className="ghee-card">
      <div className="ghee-card-image">
        <img src={product.image} alt={product.name} />
      </div>
      <h3 className="ghee-card-name">{product.name}</h3>
      <p className="ghee-card-desc">{product.description}</p>
      <div className="ghee-sizes" role="radiogroup" aria-label={`${product.name} size`}>
        {product.variants.map((v) => (
          <button
            key={v.id}
            type="button"
            role="radio"
            aria-checked={v.id === variantId}
            className={`ghee-size ${v.id === variantId ? 'selected' : ''}`}
            onClick={() => setVariantId(v.id)}
          >
            {v.label}
          </button>
        ))}
      </div>
      <div className="ghee-card-price">{formatINR(variant.price)}</div>
      <button className="btn btn-primary ghee-card-add" onClick={() => addItem(product.id, variantId)}>
        Add to cart
      </button>
    </div>
  );
};

const GheeShop = () => (
  <section className="ghee-shop" id="buy-ghee">
    <div className="ghee-shop-container">
      <h2 className="ghee-shop-title">Buy Ghee Online</h2>
      <p className="ghee-shop-subtitle">Pay securely online with UPI, cards or netbanking</p>
      <div className="ghee-shop-grid">
        {catalog.products.map((product) => (
          <GheeCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  </section>
);

export default GheeShop;
