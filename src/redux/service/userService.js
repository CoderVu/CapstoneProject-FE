import axios from "../setup/axios"; 
const fetchAllUser = async () => {
    try {
        const response = await axios({
            method: 'GET',
            url: `/api/v1/public/users/all-chat`
        });
        const { data } = response.data;
        return data;
    } catch (error) {
        console.error("Error fetching rating:", error);
        throw error;
    }
}

export {

    fetchAllUser,
};


