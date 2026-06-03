module.exports = (...allowedRoles) => {
    return (req, res, next) => {
      const hasRole = req.user && req.user.roles && req.user.roles.some(role => allowedRoles.includes(role));
      if (!hasRole) {
        return res.status(403).json({ message: "Forbidden: You do not have permission" });
      }
      next();
    };
  };
  