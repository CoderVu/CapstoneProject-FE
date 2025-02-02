import axios from "../setup/axios"; 

const fetchInfoUser = async (token) => {
    try {
        const response = await axios({
            method: 'GET',
            url: `/api/v1/user/info/${token}`,
            headers: { 'Authorization': `Bearer ${token}` },
        });
        console.log("User infooo:", response.data);
        return response.data;
    }
    catch (error) {
        console.error("Error fetching user info:", error);
        throw error;
    }

}

export {
    fetchInfoUser,
};
