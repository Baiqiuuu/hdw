import { useState } from 'react';
import { ROOM_TYPES, STYLES } from '../data/products';
import { useCart } from '../context/CartContext';

export default function ImaginePanel() {
  const { imagineBoard, dispatch } = useCart();
  const [roomType, setRoomType] = useState('living');
  const [style, setStyle] = useState('modern');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const generate = async () => {
    if (imagineBoard.length === 0) {
      setError('请先在建材卡片上点击 ✨ 选择至少一种建材');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const room = ROOM_TYPES.find((r) => r.id === roomType);
      const styleObj = STYLES.find((s) => s.id === style);

      const response = await fetch('/api/imagine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          materials: imagineBoard.map((m) => ({
            name: m.name,
            category: m.category,
            description: m.description,
            specs: m.specs,
            image: m.image,
          })),
          roomType: room?.value || 'living room',
          style: styleObj?.value || 'modern minimalist',
        }),
      });

      const raw = await response.text();
      let data;
      try {
        data = raw ? JSON.parse(raw) : {};
      } catch {
        if (response.status === 504 || raw.includes('FUNCTION_INVOCATION_TIMEOUT')) {
          throw new Error('生成超时，请减少建材数量或稍后重试');
        }
        throw new Error('服务器返回异常，请稍后重试');
      }

      if (!response.ok) {
        throw new Error(data.error || data.hint || '生成失败');
      }

      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="imagine-section" id="imagine">
      <div className="imagine-header">
        <div className="section-tag">ChatGPT Imagine</div>
        <h2 className="section-title">AI 智能样板间</h2>
        <p className="section-desc">
          选择您心仪的建材，AI 将以产品图片为素材，生成专属房屋样板间效果图
        </p>
      </div>

      <div className="imagine-layout">
        <div className="imagine-materials">
          <h3>已选建材 ({imagineBoard.length}/6)</h3>
          <div className="material-chips">
            {imagineBoard.length === 0 ? (
              <span style={{ opacity: 0.5, fontSize: '0.85rem' }}>
                在建材卡片上点击 ✨ 添加材料
              </span>
            ) : (
              imagineBoard.map((m) => (
                <span key={m.id} className="material-chip">
                  <img src={m.image} alt="" />
                  {m.name.split('·')[0].trim()}
                </span>
              ))
            )}
          </div>

          <div className="imagine-options">
            <div>
              <label>房间类型</label>
              <select value={roomType} onChange={(e) => setRoomType(e.target.value)}>
                {ROOM_TYPES.map((r) => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label>设计风格</label>
              <select value={style} onChange={(e) => setStyle(e.target.value)}>
                {STYLES.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            className="btn-imagine"
            onClick={generate}
            disabled={loading || imagineBoard.length === 0}
          >
            {loading ? '正在生成样板间...' : '✨ 生成 AI 样板间效果图'}
          </button>

          {imagineBoard.length > 0 && (
            <button
              style={{
                width: '100%',
                marginTop: '8px',
                padding: '8px',
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '8px',
                color: 'rgba(255,255,255,0.6)',
                fontSize: '0.8rem',
                cursor: 'pointer',
              }}
              onClick={() => dispatch({ type: 'CLEAR_IMAGINE' })}
            >
              清空已选建材
            </button>
          )}

          {error && <div className="imagine-error">{error}</div>}
        </div>

        <div className="imagine-result">
          {loading ? (
            <div className="imagine-loading">
              <div className="spinner" />
              <p>ChatGPT 正在组装您的样板间...</p>
              <p style={{ fontSize: '0.8rem', opacity: 0.6, marginTop: '0.5rem' }}>
                使用 {imagineBoard.length} 种建材图片作为参考素材
              </p>
            </div>
          ) : result?.imageUrl ? (
            <img src={result.imageUrl} alt="AI 生成的样板间效果图" />
          ) : (
            <div className="imagine-placeholder">
              <div className="imagine-placeholder-icon">🏠</div>
              <p>选择建材并点击生成</p>
              <p style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>
                AI 将根据您选择的地板、瓷砖等材料<br />生成专业级室内效果图
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
