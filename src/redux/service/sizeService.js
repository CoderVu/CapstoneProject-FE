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
const addSize = async (sizeData) => {
    try {
        const response = await axios.post('/api/v1/admin/sizes/add', sizeData, {
            headers: {
                "Content-Type": "application/json",
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error adding size:", error);
        throw error;
    }
}
const updateSize = async (sizeId, sizeData) => {
    try {
        const response = await axios.put(`/api/v1/admin/sizes/update/${sizeId}`, sizeData, {
            headers: {
                "Content-Type": "application/json",
            },
        });
        return response.data; 
    } catch (error) {
        console.error("Error updating size:", error);
        throw error;
    }
};

export { fetchAllSizes , addSize, updateSize };