import { fetchAllUsers } from '../services/supperAdminService.js';



export const getAllusers = async(req,res)=>{
    try {
        const userData= await fetchAllUsers();
        res.status(200).json(userData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};