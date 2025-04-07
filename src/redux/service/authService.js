import axios from "../setup/axios"; 
const loginUserService = async (phoneNumber, password) => {
    try {
        const response = await axios({
            method: 'POST',
            url: '/api/v1/auth/login',
            data: { phoneNumber, password },
        });

        const { data } = response;
        console.log("Login data:", data);
     

        return data;
    } catch (error) {
        console.error("Error fetching login:", error);

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
const fetchAddress = async(token) => {
    try {
        const response = await axios({
            method: 'GET',
            url: `/api/v1/user/address`,
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching user data:", error);
        throw error;
    }
}

const updateAddress = async (address, token) => {
    try {
        const response = await axios({
            method: 'PUT',
            url: `/api/v1/user/address`,
            data: address, 
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error updating address:", error);
        throw error;
    }
};
const deleteAddress = async (addressId, token) => {
    try {
        const response = await axios({
            method: 'DELETE',
            url: `/api/v1/user/address/${addressId}`, 
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
        return response.data; 
    } catch (error) {
        console.error("Error deleting address:", error);
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
    fetchAddress,
    updateAddress,
    deleteAddress,
};