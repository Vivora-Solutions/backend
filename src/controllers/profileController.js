import {
    fetchAuthenticatedUserDetailsAndProfile,
    updateUserAndCustomerProfile
}
from '../services/profileService.js';


export const getUserProfile = async (req, res) => {
    try {// or from req.user if you use middleware
        const user_id = req.userId;
        if (!user_id) return res.status(400).json({ error: 'User ID not found for this user' });

        const data = await fetchAuthenticatedUserDetailsAndProfile(user_id);

        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch user profile: ' + error.message });
    }
};


export const updateUserProfile = async (req, res) => {
    try {
        const user_id = req.userId;
        if (!user_id) return res.status(400).json({ error: 'User ID not found for this user' });

        const { userData, customerData } = req.body;

        if (!userData && !customerData) {
            return res.status(400).json({ error: 'No data provided to update' });
        }

        const result = await updateUserAndCustomerProfile(user_id, userData, customerData);

        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update user profile: ' + error.message });
    }
};

export const addPhoneNumber = async (req, res) => {
    try {
        const user_id = req.userId;
        if (!user_id) return res.status(400).json({ error: 'User ID not found for this user' });

        const { phoneNumber } = req.body;

        if (!phoneNumber) {
            return res.status(400).json({ error: 'Phone number is required' });
        }

        const result = await updateUserAndCustomerProfile(user_id, {}, { contact_number: phoneNumber });

        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: 'Failed to add phone number: ' + error.message });
    }
}