import supabase from '../config/supabaseClient.js';

export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid token' });
    }

    const token = authHeader.split(' ')[1];

    // Validate the token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
    }

    // Fetch role from your user table once here
    const { data: userRow, error: userError } = await supabase
      .from('user')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (userError || !userRow) {
      return res.status(403).json({ error: 'User role not found' });
    }

    req.user = user;
    req.userRole = userRow.role;  // Attach role to request for next middlewares
    next();
  } catch (err) {
    return res.status(500).json({ error: 'Internal auth error: ' + err.message });
  }
};
