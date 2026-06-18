import { BRAND } from '../data/products';import { useProducts } from '../context/ProductsContext';

export default function Header({ cartCount, onCartOpen, activeSection, onNavigate, search, onSearch }) {
  const { adminEmail, setAdminOpen } = useProducts();
  const links = [
    { id: 'products', label: '建材商城' },
    { id: 'features', label: '服务优势' },
    { id: 'imagine', label: 'AI 样板间' },
    { id: 'about', label: '关于 HDW' },
  ];

  return (
    <header className="header">
      <div className="header-inner">
        <a href="#" className="logo-group" onClick={(e) => { e.preventDefault(); onNavigate('hero'); }}>
          <img src={BRAND.logo} alt="HDW LLC" className="logo-img" />
          <div>
            <div className="logo-text">HDW 建材城</div>
            <div className="logo-sub">Premium Materials</div>
          </div>
        </a>

        <nav>
          <ul className="nav-links">
            {links.map((link) => (
              <li key={link.id}>
                <a
                  href={`#${link.id}`}
                  className={activeSection === link.id ? 'active' : ''}
                  onClick={(e) => { e.preventDefault(); onNavigate(link.id); }}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="search-bar">
          <input
            type="text"
            className="search-input"
            placeholder="搜索地板、瓷砖、卫浴..."
            value={search}
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>

        <div className="header-actions">
          <button
            className={`icon-btn admin-btn ${adminEmail ? 'active' : ''}`}
            onClick={() => setAdminOpen(true)}
            aria-label="商城管理"
            title={adminEmail ? '商城管理（已登录）' : '商城管理'}
          >
            ⚙
          </button>
          <button className="icon-btn" onClick={onCartOpen} aria-label="购物车">
            🛒
            {cartCount > 0 && <span className="badge">{cartCount}</span>}
          </button>
        </div>
      </div>
    </header>
  );
}
