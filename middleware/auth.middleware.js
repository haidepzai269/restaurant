// middleware/auth.middleware.js
const path = require('path');

function requireAdmin(req, res, next) {
  if (req.session && req.session.isAdmin) {
    return next();
  }
  // chưa login thì cho quay lại trang auth
  return res.sendFile(path.join(__dirname, '../frontend/auth.html'));
}

module.exports = { requireAdmin };
