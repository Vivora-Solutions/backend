export const requireSalonAdmin = (req, res, next) => {
    if (req.userRole !== 'salon_admin') {
        return res.status(403).json({ error: 'Forbidden: Salon admin access only' });
    }
    next();
};
