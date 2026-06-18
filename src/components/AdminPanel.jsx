import { useEffect, useState } from 'react';
import { CATEGORIES } from '../data/products';
import { useProducts } from '../context/ProductsContext';

const EMPTY = {
  id: '',
  name: '',
  category: 'flooring',
  price: '',
  unit: 'sqft',
  rating: '4.5',
  reviews: '0',
  badge: '',
  image: '',
  description: '',
  specs: '',
};

export default function AdminPanel() {
  const {
    products,
    adminEmail,
    adminOpen,
    setAdminOpen,
    adminLogin,
    adminLogout,
    uploadImage,
    saveProduct,
    removeProduct,
  } = useProducts();

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [preview, setPreview] = useState('');

  useEffect(() => {
    if (!adminOpen) {
      setEditingId(null);
      setForm(EMPTY);
      setPreview('');
      setMessage('');
    }
  }, [adminOpen]);

  if (!adminOpen) return null;

  const showMsg = (text) => {
    setMessage(text);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setBusy(true);
    try {
      await adminLogin(loginForm.email, loginForm.password);
      showMsg('登录成功');
    } catch (err) {
      setLoginError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const startEdit = (product) => {
    setEditingId(product.id);
    setForm({
      id: product.id,
      name: product.name,
      category: product.category,
      price: String(product.price),
      unit: product.unit,
      rating: String(product.rating),
      reviews: String(product.reviews),
      badge: product.badge || '',
      image: product.image,
      description: product.description,
      specs: product.specs,
    });
    setPreview(product.image);
  };

  const startNew = () => {
    setEditingId(null);
    setForm({ ...EMPTY, id: `prd-${Date.now()}` });
    setPreview('');
  };

  const handleImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const url = await uploadImage(file);
      setForm((f) => ({ ...f, image: url }));
      setPreview(url);
      showMsg('图片已上传');
    } catch (err) {
      showMsg(err.message);
    } finally {
      setBusy(false);
      e.target.value = '';
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.image.trim()) {
      showMsg('请填写名称并上传/填写图片');
      return;
    }
    setBusy(true);
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        rating: Number(form.rating),
        reviews: Number(form.reviews),
        badge: form.badge.trim() || undefined,
      };
      await saveProduct(payload, !editingId);
      showMsg(editingId ? '商品已更新' : '商品已添加');
      startNew();
    } catch (err) {
      showMsg(err.message);
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`确定删除商品 ${id}？`)) return;
    setBusy(true);
    try {
      await removeProduct(id);
      showMsg('已删除');
      if (editingId === id) startNew();
    } catch (err) {
      showMsg(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="admin-overlay" onClick={() => setAdminOpen(false)}>
      <div className="admin-panel" onClick={(e) => e.stopPropagation()}>
        <div className="admin-header">
          <div>
            <h2>商城管理</h2>
            <p>{adminEmail ? `已登录：${adminEmail}` : '仅限授权管理员编辑建材商品'}</p>
          </div>
          <div className="admin-header-actions">
            {adminEmail && (
              <button type="button" className="btn-secondary" onClick={adminLogout}>
                退出
              </button>
            )}
            <button type="button" className="admin-close" onClick={() => setAdminOpen(false)}>
              ✕
            </button>
          </div>
        </div>

        {!adminEmail ? (
          <form className="admin-login" onSubmit={handleLogin}>
            <label>
              管理员邮箱
              <input
                type="email"
                value={loginForm.email}
                onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                placeholder="dukewang@gmail.com"
                required
              />
            </label>
            <label>
              密码
              <input
                type="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                required
              />
            </label>
            {loginError && <p className="admin-error">{loginError}</p>}
            <button type="submit" className="btn-primary" disabled={busy}>
              {busy ? '登录中…' : '登录'}
            </button>
          </form>
        ) : (
          <div className="admin-body">
            <div className="admin-list">
              <div className="admin-list-head">
                <h3>商品列表 ({products.length})</h3>
                <button type="button" className="btn-primary btn-sm" onClick={startNew}>
                  + 新增
                </button>
              </div>
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>图片</th>
                      <th>名称</th>
                      <th>价格</th>
                      <th>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p) => (
                      <tr key={p.id} className={editingId === p.id ? 'active' : ''}>
                        <td>
                          <img src={p.image} alt="" className="admin-thumb" />
                        </td>
                        <td>
                          <div className="admin-name">{p.name}</div>
                          <div className="admin-id">{p.id}</div>
                        </td>
                        <td>${Number(p.price).toFixed(2)}</td>
                        <td>
                          <button type="button" className="link-btn" onClick={() => startEdit(p)}>
                            编辑
                          </button>
                          <button type="button" className="link-btn danger" onClick={() => handleDelete(p.id)}>
                            删除
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <form className="admin-form" onSubmit={handleSave}>
              <h3>{editingId ? '编辑商品' : '新增商品'}</h3>
              <div className="admin-form-grid">
                <label>
                  商品 ID
                  <input
                    value={form.id}
                    onChange={(e) => setForm({ ...form, id: e.target.value })}
                    disabled={!!editingId}
                    required
                  />
                </label>
                <label>
                  分类
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                  >
                    {CATEGORIES.filter((c) => c.id !== 'all').map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="span-2">
                  名称
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </label>
                <label>
                  价格
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    required
                  />
                </label>
                <label>
                  单位
                  <select value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}>
                    <option value="sqft">sqft</option>
                    <option value="gal">gal</option>
                    <option value="set">set</option>
                    <option value="pc">pc</option>
                  </select>
                </label>
                <label>
                  评分
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    value={form.rating}
                    onChange={(e) => setForm({ ...form, rating: e.target.value })}
                  />
                </label>
                <label>
                  评价数
                  <input
                    type="number"
                    min="0"
                    value={form.reviews}
                    onChange={(e) => setForm({ ...form, reviews: e.target.value })}
                  />
                </label>
                <label>
                  标签
                  <input
                    value={form.badge}
                    onChange={(e) => setForm({ ...form, badge: e.target.value })}
                    placeholder="热销 / Premium"
                  />
                </label>
                <label className="span-2">
                  图片 URL
                  <input
                    value={form.image}
                    onChange={(e) => {
                      setForm({ ...form, image: e.target.value });
                      setPreview(e.target.value);
                    }}
                    placeholder="/uploads/xxx.jpg 或 https://..."
                  />
                </label>
                <label className="span-2">
                  上传图片
                  <input type="file" accept="image/*" onChange={handleImage} disabled={busy} />
                </label>
                {preview && (
                  <div className="admin-preview span-2">
                    <img src={preview} alt="预览" />
                  </div>
                )}
                <label className="span-2">
                  描述
                  <textarea
                    rows={3}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </label>
                <label className="span-2">
                  规格
                  <input
                    value={form.specs}
                    onChange={(e) => setForm({ ...form, specs: e.target.value })}
                  />
                </label>
              </div>
              <div className="admin-form-actions">
                <button type="submit" className="btn-primary" disabled={busy}>
                  {busy ? '保存中…' : editingId ? '保存修改' : '添加商品'}
                </button>
                {editingId && (
                  <button type="button" className="btn-secondary" onClick={startNew}>
                    取消编辑
                  </button>
                )}
              </div>
            </form>
          </div>
        )}

        {message && <div className="admin-toast">{message}</div>}
      </div>
    </div>
  );
}
