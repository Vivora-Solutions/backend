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

export const loginUser = async (req, res) => {
  try {
    const sessionData = await handleUserLogin(req.body);
    res.status(200).json(sessionData);
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