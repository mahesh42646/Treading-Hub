const jwt = require('jsonwebtoken');

// Admin credentials (in production, these should be in environment variables)
const ADMIN_EMAIL = 'admin@gmail.com';
const ADMIN_PASSWORD = 'admin@123';
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware to verify admin authentication
const verifyAdminAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1] || req.cookies?.adminToken;

  if (!token) {
    return res.status(401).json({ success: false, message: 'Admin authentication required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.email !== ADMIN_EMAIL) {
      return res.status(403).json({ success: false, message: 'Admin access denied' });
    }
    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid admin token' });
  }
};

// Admin login function
const adminLogin = (email, password) => {
  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    const token = jwt.sign({ email, role: 'admin' }, JWT_SECRET, { expiresIn: '24h' });
    return { success: true, token };
  }
  return { success: false, message: 'Invalid admin credentials' };
};

module.exports = {
  verifyAdminAuth,
  adminLogin,
  JWT_SECRET
};
