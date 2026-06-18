import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { PRODUCTS as SEED_PRODUCTS } from '../src/data/products.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = process.env.VERCEL ? '/tmp/hdw-data' : path.join(__dirname, 'data');
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');

async function ensureSeed() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(PRODUCTS_FILE);
  } catch {
    await fs.writeFile(PRODUCTS_FILE, JSON.stringify(SEED_PRODUCTS, null, 2), 'utf8');
  }
}

export async function loadProducts() {
  await ensureSeed();
  const raw = await fs.readFile(PRODUCTS_FILE, 'utf8');
  return JSON.parse(raw);
}

export async function saveProducts(products) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(PRODUCTS_FILE, JSON.stringify(products, null, 2), 'utf8');
}

export async function getProductById(id) {
  const products = await loadProducts();
  return products.find((p) => p.id === id) || null;
}

export async function createProduct(data) {
  const products = await loadProducts();
  const id = data.id?.trim() || `prd-${Date.now()}`;
  if (products.some((p) => p.id === id)) {
    throw new Error('商品 ID 已存在');
  }
  const product = normalizeProduct({ ...data, id });
  products.unshift(product);
  await saveProducts(products);
  return product;
}

export async function updateProduct(id, data) {
  const products = await loadProducts();
  const index = products.findIndex((p) => p.id === id);
  if (index === -1) throw new Error('商品不存在');
  const updated = normalizeProduct({ ...products[index], ...data, id });
  products[index] = updated;
  await saveProducts(products);
  return updated;
}

export async function deleteProduct(id) {
  const products = await loadProducts();
  const next = products.filter((p) => p.id !== id);
  if (next.length === products.length) throw new Error('商品不存在');
  await saveProducts(next);
  return true;
}

function normalizeProduct(raw) {
  return {
    id: String(raw.id),
    name: String(raw.name || '').trim(),
    category: String(raw.category || 'flooring'),
    price: Number(raw.price) || 0,
    unit: raw.unit || 'sqft',
    rating: Number(raw.rating) || 4.5,
    reviews: Number(raw.reviews) || 0,
    badge: raw.badge ? String(raw.badge) : undefined,
    image: String(raw.image || '').trim(),
    description: String(raw.description || '').trim(),
    specs: String(raw.specs || '').trim(),
  };
}
