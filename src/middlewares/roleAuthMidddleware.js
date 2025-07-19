export const requireCustomer = (req, res, next) => {
  if (req.userRole === 'customer') {
    return next();
  }
  return res.status(403).json({ error: 'Access denied: Customers only' });
};

export const requireSalonAdmin = (req, res, next) => {
  if (req.userRole === 'salon_admin') {
    return next();
  }
  return res.status(403).json({ error: 'Access denied: Salon admins only' });
};

export const requireSuperAdmin = (req, res, next) => {
  if (req.userRole === 'super_admin') {
    return next();
  }
  return res.status(403).json({ error: 'Access denied: Super admins only' });
};
