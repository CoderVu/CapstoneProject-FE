import axios from "../setup/axios"; 

const loginUserService = async (phoneNumber, password) => {
    try {
        const response = await axios({
            method: 'POST',
            url: '/api/v1/auth/login',
            data: { phoneNumber, password },
        });

        const { data } = response;

        return data;
    } catch (error) {
        console.error("Error fetching login:", error);
        throw error;
    }
}

export {
    loginUserService
};
