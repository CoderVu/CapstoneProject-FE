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
const fetchOAuth2UserData = async (token) => {
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
        console.error("Error fetching OAuth2 user data:", error);
        throw error;
    }
};
export {
    loginUserService,
    fetchOAuth2UserData,
};
