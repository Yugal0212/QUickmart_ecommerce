const AuditLog = require('../models/AuditLog');

const activityLogger = async (req, res, next) => {
  const start = Date.now();

  res.on('finish', async () => {
    try {
      const url = req.originalUrl;
      const method = req.method;
      
      // Ignore static assets, polling, and preflight requests to prevent log spam
      if (method === 'OPTIONS' || url.startsWith('/images') || url.includes('/socket.io') || url.includes('/quickmart')) return;

      let action = 'Page View';
      let severity = 'info';

      // Determine action type
      if (method === 'POST') {
        if (url.includes('/login') || url.includes('/signin')) action = 'Logged In';
        else if (url.includes('/logout')) action = 'Logged Out';
        else if (url.includes('/register') || url.includes('/signup')) action = 'Registered Account';
        else if (url.includes('/order')) action = 'Placed Order';
        else if (url.includes('/cart')) action = 'Added to Cart';
        else action = 'Created Record';
      } else if (method === 'PUT' || method === 'PATCH') {
        action = 'Updated Record';
      } else if (method === 'DELETE') {
        action = 'Deleted Record';
        severity = 'medium';
      } else if (method === 'GET') {
         if (url.includes('/products')) action = 'Browsed Products';
         else if (url.includes('/cart')) action = 'Viewed Cart';
         else if (url.includes('/order')) action = 'Viewed Orders';
         else if (url.includes('/admin')) {
             action = 'Accessed Admin Area';
             // Don't log spammy admin analytics or logs fetching
             if (url.includes('/analytics') || url.includes('/audit-logs')) return;
         }
      }

      // Extract user info if authenticated (authMiddleware attaches req.user)
      const user = req.user ? req.user._id : null;
      const email = req.user ? req.user.email : (req.body?.email || 'Anonymous');
      let role = 'Guest';
      
      if (req.user && req.user.roles && req.user.roles.length > 0) {
          role = req.user.roles[0];
      }

      await AuditLog.create({
        action,
        user,
        email,
        role,
        ip: req.ip || req.connection?.remoteAddress || 'Unknown IP',
        method,
        route: url,
        details: { statusCode: res.statusCode, durationMs: Date.now() - start },
        severity
      });
    } catch (err) {
      console.error('Audit Log Error:', err.message);
    }
  });

  next();
};

module.exports = activityLogger;
