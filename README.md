# HDW 建材城 · Materials Marketplace

HDW LLC 高端建材商城 — React + Express，含 AI 智能样板间与后台商品管理。

## 本地开发

```bash
npm install
cp .env.example .env   # 填入 OPENAI_API_KEY、ADMIN_USERS、JWT_SECRET
npm run dev            # 前端 :5173，API :3001
```

## 生产构建

```bash
npm run build
npm start              # 单端口服务静态页 + API
```

## Vercel 部署

1. 将仓库推送到 GitHub
2. 在 [Vercel](https://vercel.com) 导入该仓库
3. 在 **Settings → Environment Variables** 添加：

| 变量 | 说明 |
|------|------|
| `OPENAI_API_KEY` | OpenAI API 密钥（AI 样板间） |
| `ADMIN_USERS` | 管理员，格式 `email:password` |
| `JWT_SECRET` | 登录令牌签名密钥 |

4. 部署完成后访问站点；API 健康检查：`/api/health`

> **说明：** Vercel Serverless 环境下商品数据与上传图片存储在 `/tmp`，实例冷启动后会重置。正式运营建议使用持久化存储（如 Vercel Blob / 数据库）。

## 项目结构

```
src/          React 前端
server/       Express API
api/          Vercel Serverless 入口
docs/         商业/企业策划书（Markdown）
```

## 技术栈

- Vite + React 18
- Express 4
- OpenAI gpt-image-1（Imagine 样板间）

---

© HDW LLC · [hdwbuild.com](https://www.hdwbuild.com/)
