import { useState, useMemo } from 'react';
import { CATEGORIES } from '../data/products';
import { useProducts } from '../context/ProductsContext';
import ProductCard from './ProductCard';

export default function ProductGrid({ search, onAdded }) {
  const { products, loading, error } = useProducts();
  const [category, setCategory] = useState('all');

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchCat = category === 'all' || p.category === category;
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.includes(q);
      return matchCat && matchSearch;
    });
  }, [products, category, search]);

  return (
    <section className="section" id="products">
      <div className="section-header">
        <div className="section-tag">Premium Materials</div>
        <h2 className="section-title">精选建材商城</h2>
        <p className="section-desc">
          源自 HDW LLC 真实工程案例，地板、瓷砖、橱柜、卫浴等全品类建材在线选购，品质保障，透明报价
        </p>
      </div>

      <div className="categories">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            className={`category-btn ${category === cat.id ? 'active' : ''}`}
            onClick={() => setCategory(cat.id)}
          >
            <span>{cat.icon}</span> {cat.name}
          </button>
        ))}
      </div>

      <div className="product-grid">
        {loading && (
          <p style={{ textAlign: 'center', color: 'var(--gray-400)', padding: '3rem', gridColumn: '1 / -1' }}>
            加载商品中…
          </p>
        )}
        {!loading && error && (
          <p style={{ textAlign: 'center', color: '#c0392b', padding: '3rem', gridColumn: '1 / -1' }}>
            {error}
          </p>
        )}
        {!loading && !error && filtered.map((product) => (
          <ProductCard key={product.id} product={product} onAdded={onAdded} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p style={{ textAlign: 'center', color: 'var(--gray-400)', padding: '3rem' }}>
          未找到匹配的建材，请尝试其他关键词
        </p>
      )}
    </section>
  );
}
