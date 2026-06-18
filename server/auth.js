import crypto from 'crypto';

const TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function parseAdminUsers(raw) {
  if (!raw?.trim()) return new Map();
  const users = new Map();
  for (const pair of raw.split(',')) {
    const [email, password] = pair.trim().split(':');
    if (email && password) {
      users.set(email.trim().toLowerCase(), password);
    }
  }
  return users;
}

export function createAuth(config) {
  const adminUsers = parseAdminUsers(config.adminUsers);
  const secret = config.jwtSecret || 'dev-secret';

  function signToken(email) {
    const payload = Buffer.from(
      JSON.stringify({ email, exp: Date.now() + TOKEN_TTL_MS }),
    ).toString('base64url');
    const sig = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
    return `${payload}.${sig}`;
  }

  function verifyToken(token) {
    if (!token?.includes('.')) return null;
    const [payload, sig] = token.split('.');
    const expected = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
    if (sig !== expected) return null;
    try {
      const data = JSON.parse(Buffer.from(payload, 'base64url').toString());
      if (!data.email || data.exp < Date.now()) return null;
      if (!adminUsers.has(data.email.toLowerCase())) return null;
      return data.email.toLowerCase();
    } catch {
      return null;
    }
  }

  function login(email, password) {
    const normalized = email?.trim().toLowerCase();
    if (!normalized || adminUsers.get(normalized) !== password) {
      return null;
    }
    return { token: signToken(normalized), email: normalized };
  }

  function requireAdmin(req, res, next) {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : '';
    const email = verifyToken(token);
    if (!email) {
      return res.status(401).json({ error: '未授权，请重新登录' });
    }
    req.adminEmail = email;
    next();
  }

  return { login, verifyToken, requireAdmin, hasAdmins: adminUsers.size > 0 };
}
