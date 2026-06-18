import { BRAND } from '../data/products';

export default function Hero({ onNavigate }) {
  return (
    <section className="hero" id="hero">
      <div
        className="hero-bg"
        style={{ backgroundImage: `url(${BRAND.hero})` }}
      />
      <div className="hero-overlay" />
      <div className="hero-content">
        <span className="hero-tag">HDW LLC · Los Angeles</span>
        <h1 className="hero-title">{BRAND.tagline}</h1>
        <p className="hero-subtitle">
          洛杉矶专业建筑品牌倾力打造 — 地板、瓷砖、橱柜、卫浴等全品类建材一站式选购。
          精选 HDW 工程案例同款材料，AI 智能预览您的梦想空间。
        </p>
        <div className="hero-cta">
          <button className="btn btn-primary" onClick={() => onNavigate('products')}>
            浏览建材商城 →
          </button>
          <button className="btn btn-outline" onClick={() => onNavigate('imagine')}>
            ✨ AI 样板间预览
          </button>
        </div>
        <div className="hero-stats">
          <div>
            <div className="stat-num">500+</div>
            <div className="stat-label">精选建材 SKU</div>
          </div>
          <div>
            <div className="stat-num">25</div>
            <div className="stat-label">品类覆盖</div>
          </div>
          <div>
            <div className="stat-num">4.9</div>
            <div className="stat-label">客户满意度</div>
          </div>
          <div>
            <div className="stat-num">AI</div>
            <div className="stat-label">智能样板间</div>
          </div>
        </div>
      </div>
    </section>
  );
}
