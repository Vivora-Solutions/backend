
import supabase from '../config/supabaseClient.js';

export const requireSupperAdmin = (req, res, next) => {
  if (req.userRole !== 'super_admin') {
    return res.status(403).json({ error: 'Forbidden: Supper admin access only' });
  }
  next();
};
