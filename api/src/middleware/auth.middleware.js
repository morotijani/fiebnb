const jwt = require('jsonwebtoken');

const requireAuth = (req, res, next) => {
  // If req.user is already attached by a previous call, skip
  if (req.user) return next();

  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = decoded; // { id, role, ... }
    next();
  } catch (ex) {
    res.status(401).json({ error: 'Invalid token.' });
  }
};

const requireRole = (allowedRoles = []) => {
  return (req, res, next) => {
    // Ensure the user is authenticated first
    requireAuth(req, res, () => {
      if (!req.user || !allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ error: 'Forbidden. You do not have access.' });
      }
      next();
    });
  };
};

const requireAdmin = requireRole(['ADMIN']);

module.exports = { requireAuth, requireRole, requireAdmin };
