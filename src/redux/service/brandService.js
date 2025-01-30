import axios from "../setup/axios";

const fetchAllBrands = async () => {
    try {
        const response = await axios({
            method: 'GET',
            url: '/api/v1/public/brands',
        });
        const { data } = response.data;
        return data;
    } catch (error) {
        console.error("Error fetching brands:", error);
        throw error;
    }
}

export { fetchAllBrands };