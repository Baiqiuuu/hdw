import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import OpenAI from 'openai';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { createAuth } from './auth.js';
import {
  loadProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from './productsStore.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const UPLOADS_DIR = process.env.VERCEL
  ? '/tmp/hdw-uploads'
  : path.join(__dirname, 'uploads');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '15mb' }));

const auth = createAuth({
  adminUsers: process.env.ADMIN_USERS,
  jwtSecret: process.env.JWT_SECRET,
});

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

app.use('/uploads', express.static(UPLOADS_DIR));

function requestBaseUrl(req) {
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  const host = req.get('host');
  const proto = req.get('x-forwarded-proto') || 'http';
  return host ? `${proto}://${host}` : `http://localhost:${PORT}`;
}

async function fetchImageAsBase64(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch image: ${url}`);
  const buffer = await response.arrayBuffer();
  const contentType = response.headers.get('content-type') || 'image/jpeg';
  const base64 = Buffer.from(buffer).toString('base64');
  return { base64, contentType };
}

function buildMaterialPrompt(materials, roomType, style) {
  const materialList = materials
    .map((m) => `- ${m.name} (${m.category}): ${m.description || m.specs || ''}`)
    .join('\n');

  return `Create a photorealistic interior design visualization of a ${roomType} in ${style} style.

Use these specific building materials in the room design:
${materialList}

Requirements:
- Professional architectural photography quality, 8K detail
- Natural lighting, magazine-worthy composition
- Accurately represent the textures, colors and finishes of each listed material
- Cohesive luxury residential interior matching HDW LLC design standards
- Los Angeles modern luxury home aesthetic
- No text, watermarks, or logos in the image`;
}

app.get('/api/products', async (_req, res) => {
  try {
    const products = await loadProducts();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/login', (req, res) => {
  const { email, password } = req.body || {};
  if (!auth.hasAdmins) {
    return res.status(503).json({ error: '未配置管理员账号，请在 .env 设置 ADMIN_USERS' });
  }
  const session = auth.login(email, password);
  if (!session) {
    return res.status(401).json({ error: '邮箱或密码错误' });
  }
  res.json(session);
});

app.get('/api/admin/me', (req, res) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  const email = auth.verifyToken(token);
  if (!email) return res.status(401).json({ error: '未登录' });
  res.json({ email });
});

app.post('/api/admin/upload', auth.requireAdmin, async (req, res) => {
  try {
    const { dataUrl, filename } = req.body || {};
    if (!dataUrl?.startsWith('data:image/')) {
      return res.status(400).json({ error: '请上传图片文件' });
    }
    const match = dataUrl.match(/^data:(image\/\w+);base64,(.+)$/);
    if (!match) return res.status(400).json({ error: '图片格式无效' });

    const ext = match[1].includes('png') ? 'png' : match[1].includes('webp') ? 'webp' : 'jpg';
    const safeName = (filename || `product-${Date.now()}`)
      .replace(/[^\w.-]/g, '')
      .slice(0, 60);
    const fileName = `${safeName}.${ext}`;
    await fs.mkdir(UPLOADS_DIR, { recursive: true });
    await fs.writeFile(path.join(UPLOADS_DIR, fileName), Buffer.from(match[2], 'base64'));
    res.json({ url: `/uploads/${fileName}` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/products', auth.requireAdmin, async (req, res) => {
  try {
    const product = await createProduct(req.body);
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/admin/products/:id', auth.requireAdmin, async (req, res) => {
  try {
    const product = await updateProduct(req.params.id, req.body);
    res.json(product);
  } catch (error) {
    res.status(error.message === '商品不存在' ? 404 : 400).json({ error: error.message });
  }
});

app.delete('/api/admin/products/:id', auth.requireAdmin, async (req, res) => {
  try {
    await deleteProduct(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

app.post('/api/imagine', async (req, res) => {
  try {
    const { materials, roomType = 'living room', style = 'modern minimalist' } = req.body;

    if (!materials?.length) {
      return res.status(400).json({ error: '请至少选择一种建材' });
    }

    if (!openai) {
      return res.status(503).json({
        error: 'OpenAI API 未配置',
        hint: '请在 Vercel 环境变量或 .env 中设置 OPENAI_API_KEY',
      });
    }

    const prompt = buildMaterialPrompt(materials, roomType, style);
    const baseUrl = requestBaseUrl(req);

    const imageUrls = materials
      .map((m) => m.image)
      .filter(Boolean)
      .slice(0, 4);

    let result;

    const generateOptions = {
      model: 'gpt-image-1',
      prompt,
      size: '1536x1024',
      quality: 'high',
    };

    if (imageUrls.length > 0) {
      try {
        const imageFiles = await Promise.all(
          imageUrls.map(async (url, i) => {
            const fullUrl = url.startsWith('/') ? `${baseUrl}${url}` : url;
            const { base64, contentType } = await fetchImageAsBase64(fullUrl);
            const ext = contentType.includes('png') ? 'png' : 'jpeg';
            return await OpenAI.toFile(
              Buffer.from(base64, 'base64'),
              `material-${i}.${ext}`,
              { type: contentType },
            );
          }),
        );

        result = await openai.images.edit({
          ...generateOptions,
          image: imageFiles,
        });
      } catch (editError) {
        console.warn('Image edit failed, falling back to generate:', editError.message);
        result = await openai.images.generate(generateOptions);
      }
    } else {
      result = await openai.images.generate(generateOptions);
    }

    const imageData = result.data[0];
    const imageUrl = imageData.url || (imageData.b64_json ? `data:image/png;base64,${imageData.b64_json}` : null);

    if (!imageUrl) {
      return res.status(500).json({ error: '未能生成图片' });
    }

    res.json({
      success: true,
      imageUrl,
      prompt,
      materialsUsed: materials.map((m) => m.name),
    });
  } catch (error) {
    console.error('Imagine API error:', error);
    res.status(500).json({
      error: error.message || '生成样板间图片失败',
      hint: '请确认 OPENAI_API_KEY 有效且账户支持 gpt-image-1 模型',
    });
  }
});

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    openaiConfigured: !!openai,
    adminConfigured: auth.hasAdmins,
  });
});

if (!process.env.VERCEL) {
  const distPath = path.join(__dirname, '..', 'dist');
  app.use(express.static(distPath));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'), (err) => {
      if (err) res.status(404).json({ message: 'Run npm run build first for production' });
    });
  });
}

export default app;
