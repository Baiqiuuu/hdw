import { useState } from 'react';
import { formatPrice, getCategoryName } from '../data/products';
import { useCart } from '../context/CartContext';

export default function ProductCard({ product, onAdded }) {
  const { dispatch, imagineBoard } = useCart();
  const [added, setAdded] = useState(false);
  const inBoard = imagineBoard.some((p) => p.id === product.id);

  const handleAdd = () => {
    dispatch({ type: 'ADD', product });
    setAdded(true);
    onAdded?.(`${product.name} 已加入购物车`);
    setTimeout(() => setAdded(false), 2000);
  };

  const toggleImagine = () => {
    dispatch({ type: 'TOGGLE_IMAGINE', product });
  };

  return (
    <article className="product-card">
      <div className="product-image-wrap">
        <img src={product.image} alt={product.name} className="product-image" loading="lazy" />
        {product.badge && (
          <span className={`product-badge ${product.badge === 'Premium' ? 'premium' : ''}`}>
            {product.badge}
          </span>
        )}
        <button
          className={`product-imagine-toggle ${inBoard ? 'selected' : ''}`}
          onClick={toggleImagine}
          title={inBoard ? '从 AI 样板间移除' : '加入 AI 样板间'}
        >
          {inBoard ? '✓' : '✨'}
        </button>
      </div>
      <div className="product-body">
        <div className="product-category">{getCategoryName(product.category)}</div>
        <h3 className="product-name">{product.name}</h3>
        <p className="product-desc">{product.description}</p>
        <div className="product-meta">
          <span className="product-price">{formatPrice(product.price, product.unit)}</span>
          <span className="product-rating">
            <span className="stars">★</span> {product.rating} ({product.reviews})
          </span>
        </div>
        <div className="product-actions">
          <button className={`btn-add-cart ${added ? 'added' : ''}`} onClick={handleAdd}>
            {added ? '✓ 已添加' : '加入购物车'}
          </button>
          <button className="btn-quick" onClick={toggleImagine} title="AI 样板间">
            ✨
          </button>
        </div>
      </div>
    </article>
  );
}
