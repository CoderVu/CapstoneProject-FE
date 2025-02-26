import axios from "../setup/axios";

const fetchAllSizes = async () => {
    try {
        const response = await axios({
            method: 'GET',
            url: '/api/v1/public/sizes',
        });
        const { data } = response.data;
        console.log("fetchAllSizes data:", data);
        return data;
    } catch (error) {
        console.error("Error fetching error:", error);
        throw error;
    }
}

export { fetchAllSizes };