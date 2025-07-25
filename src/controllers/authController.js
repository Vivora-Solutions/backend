import { 
  handleUserRegistration, 
  handleUserLogin,
  handleUserLogout,
  handleTokenRefresh  
} from '../services/authService.js';

export const registerUser = async (req, res) => {
  try {
    const userData = await handleUserRegistration(req.body);
    res.status(201).json(userData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// export const loginUser = async (req, res) => {
//   try {
//     const sessionData = await handleUserLogin(req.body);
//     res.status(200).json(sessionData);
//   } catch (error) {
//     res.status(401).json({ error: error.message });
//   }
// };


export const loginUser = async (req, res) => {
  try {
    const sessionData = await handleUserLogin(req.body);

    const { session, customRole } = sessionData;

    //  Set refresh token as a cookie
    res.cookie('refresh_token', session.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // set to false for localhost dev
      sameSite: 'Strict', // or 'Lax' if frontend is on another origin
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    //  Return access token and role to frontend
    res.status(200).json({
      message: 'Login successful',
      access_token: session.access_token,
      customRole,
    });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};


export const logoutUser = async (req, res) => {
  try {
    const result = await handleUserLogout();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: 'Logout failed: ' + error.message });
  }
};

export const refreshToken = async (req, res) => {
  try {
    const { refresh_token } = req.body;
    if (!refresh_token) return res.status(400).json({ error: 'Missing refresh_token' });

    const result = await handleTokenRefresh(refresh_token);
    res.status(200).json(result);
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};