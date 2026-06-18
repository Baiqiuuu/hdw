import { formatPrice } from '../data/products';
import { useCart } from '../context/CartContext';

export default function CartDrawer({ open, onClose }) {
  const { items, dispatch, cartTotal } = useCart();

  return (
    <>
      <div className={`overlay ${open ? 'open' : ''}`} onClick={onClose} />
      <aside className={`cart-drawer ${open ? 'open' : ''}`}>
        <div className="cart-header">
          <h2>购物车</h2>
          <button className="cart-close" onClick={onClose}>✕</button>
        </div>

        <div className="cart-items">
          {items.length === 0 ? (
            <div className="cart-empty">
              <p style={{ fontSize: '2rem', marginBottom: '1rem' }}>🛒</p>
              <p>购物车是空的</p>
              <p style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>浏览建材商城，挑选心仪产品</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="cart-item">
                <img src={item.image} alt={item.name} className="cart-item-img" />
                <div className="cart-item-info">
                  <div className="cart-item-name">{item.name}</div>
                  <div className="cart-item-price">{formatPrice(item.price, item.unit)}</div>
                  <div className="cart-qty">
                    <button onClick={() => dispatch({ type: 'UPDATE_QTY', id: item.id, qty: item.quantity - 1 })}>−</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => dispatch({ type: 'UPDATE_QTY', id: item.id, qty: item.quantity + 1 })}>+</button>
                  </div>
                  <button className="cart-remove" onClick={() => dispatch({ type: 'REMOVE', id: item.id })}>
                    移除
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="cart-footer">
            <div className="cart-total">
              <span className="cart-total-label">合计</span>
              <span className="cart-total-amount">${cartTotal.toFixed(2)}</span>
            </div>
            <button className="btn-checkout" onClick={() => alert('感谢您的选购！HDW 顾问将尽快与您联系确认订单。\n\n电话: 323-853-3333\n邮箱: dukewang@gmail.com')}>
              提交订单
            </button>
            <p className="cart-note">提交后 HDW 专属顾问将在 24 小时内联系您</p>
          </div>
        )}
      </aside>
    </>
  );
}
