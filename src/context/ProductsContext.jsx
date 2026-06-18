import { createContext, useContext, useEffect, useState, useCallback } from 'react';

const ProductsContext = createContext(null);
const ADMIN_TOKEN_KEY = 'hdw_admin_token';

export function ProductsProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [adminEmail, setAdminEmail] = useState(null);
  const [adminOpen, setAdminOpen] = useState(false);

  const getToken = () => localStorage.getItem(ADMIN_TOKEN_KEY);

  const authHeaders = () => {
    const token = getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const refreshProducts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/products');
      if (!res.ok) throw new Error('加载商品失败');
      setProducts(await res.json());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const checkAdminSession = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setAdminEmail(null);
      return;
    }
    try {
      const res = await fetch('/api/admin/me', { headers: authHeaders() });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setAdminEmail(data.email);
    } catch {
      localStorage.removeItem(ADMIN_TOKEN_KEY);
      setAdminEmail(null);
    }
  }, []);

  useEffect(() => {
    refreshProducts();
    checkAdminSession();
  }, [refreshProducts, checkAdminSession]);

  const adminLogin = async (email, password) => {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || '登录失败');
    localStorage.setItem(ADMIN_TOKEN_KEY, data.token);
    setAdminEmail(data.email);
    return data;
  };

  const adminLogout = () => {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    setAdminEmail(null);
  };

  const uploadImage = async (file) => {
    const dataUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
    const res = await fetch('/api/admin/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ dataUrl, filename: file.name.replace(/\.[^.]+$/, '') }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || '上传失败');
    return data.url;
  };

  const saveProduct = async (product, isNew) => {
    const url = isNew ? '/api/admin/products' : `/api/admin/products/${encodeURIComponent(product.id)}`;
    const res = await fetch(url, {
      method: isNew ? 'POST' : 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(product),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || '保存失败');
    await refreshProducts();
    return data;
  };

  const removeProduct = async (id) => {
    const res = await fetch(`/api/admin/products/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || '删除失败');
    await refreshProducts();
  };

  return (
    <ProductsContext.Provider
      value={{
        products,
        loading,
        error,
        refreshProducts,
        adminEmail,
        adminOpen,
        setAdminOpen,
        adminLogin,
        adminLogout,
        uploadImage,
        saveProduct,
        removeProduct,
      }}
    >
      {children}
    </ProductsContext.Provider>
  );
}

export function useProducts() {
  const ctx = useContext(ProductsContext);
  if (!ctx) throw new Error('useProducts must be used within ProductsProvider');
  return ctx;
}
