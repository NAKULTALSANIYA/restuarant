const jwt = require('jsonwebtoken');

// Middleware to verify JWT token
const requireAuth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(400).json({ message: 'Invalid token.' });
  }
};

// Middleware to require admin role
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin role required.' });
  }
  next();
};

// Middleware to require staff or admin role
const requireStaff = (req, res, next) => {
  if (req.user.role !== 'staff' && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Staff or admin role required.' });
  }
  next();
};

// Middleware to require customer role
const requireCustomer = (req, res, next) => {
  if (req.user.role !== 'customer') {
    return res.status(403).json({ message: 'Access denied. Customer role required.' });
  }
  next();
};

module.exports = {
  requireAuth,
  requireAdmin,
  requireStaff,
  requireCustomer
};
