import axios from "../setup/axios";

const fetchAllCategories = async () => {
    try {
        const response = await axios({
            method: 'GET',
            url: '/api/v1/public/categories',
        });
        const { data } = response.data;
        return data;
    } catch (error) {
        console.error("Error fetching categories:", error);
        throw error;
    }
}

export { fetchAllCategories };