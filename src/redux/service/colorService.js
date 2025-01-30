import axios from "../setup/axios";

const fetchAllColors = async () => {
    try {
        const response = await axios({
            method: 'GET',
            url: '/api/v1/public/colors',
        });
        const { data } = response.data;
        return data;
    } catch (error) {
        console.error("Error fetching brands:", error);
        throw error;
    }
}

export { fetchAllColors };