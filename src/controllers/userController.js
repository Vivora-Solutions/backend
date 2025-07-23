import { 
  handleGetUserEmail,
  handleGetUserDetails,
  handleUpdateUserDetails,
  handleUpdateUserPassword
} from '../services/userService.js'

export const getUserEmail = async (req, res) => {
  try {
    const user_id = req.userId;
    if (!user_id) return res.status(400).json({ error: 'User ID not found for this user' });
    
    const result = await handleGetUserEmail(user_id);
    if (!result) return res.status(404).json({ error: 'User not found' });
    
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getUserDetails = async (req, res) => {
  try {
    const user_id = req.userId;
    if (!user_id) return res.status(400).json({ error: 'User ID not found for this user' });
    
    const result = await handleGetUserDetails(user_id);
    if (!result) return res.status(404).json({ error: 'User details not found' });
    
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateUserDetails = async (req, res) => {
  try {
    const user_id = req.userId;
    const updateData = req.body;
    
    if (!user_id) return res.status(400).json({ error: 'User ID not found for this user' });
    
    // Validate required fields
    if (!updateData.first_name || !updateData.last_name) {
      return res.status(400).json({ error: 'First name and last name are required' });
    }
    
    const result = await handleUpdateUserDetails(user_id, updateData);
    res.status(200).json({ message: 'User details updated successfully', data: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateUserPassword = async (req, res) => {
  try {
    const user_id = req.userId;
    const { currentPassword, newPassword } = req.body;
    
    if (!user_id) return res.status(400).json({ error: 'User ID not found for this user' });
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }
    
    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters long' });
    }
    
    await handleUpdateUserPassword(user_id, currentPassword, newPassword);
    res.status(200).json({ message: 'Password updated successfully' });
  } catch (err) {
    if (err.message === 'Current password is incorrect') {
      res.status(400).json({ error: err.message });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
};