import axios from "../setup/axios"; 
import { toast } from "react-toastify";
const loginUserService = async (phoneNumber, password) => {
    try {
        const response = await axios({
            method: 'POST',
            url: '/api/v1/auth/login',
            data: { phoneNumber, password },
        });

        const { data } = response;
        console.log("Login data:", data);
        toast.success(data.message, {
            position: "top-right",
        });

        return data;
    } catch (error) {
        console.error("Error fetching login:", error);
        toast.error(error.response.data.message, {
            position: "top-right",
        });
        throw error;
    }
}

const fetchUserData = async (token) => {
    try {
        const response = await axios({
            method: 'GET',
            url: `/api/v1/user/info/${token}`,
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching user data:", error);
        throw error;
    }
};
const logoutUserService = () => {
    try {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        console.log("User logged out successfully");
    } catch (error) {
        console.error("Error logging out user:", error);
        throw error;
    }
};

export {
    loginUserService,
    fetchUserData,
    logoutUserService,
};