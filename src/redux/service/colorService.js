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

const addColor = async (colorData) => {
    try {
        const response = await axios.post('/api/v1/admin/colors/add', colorData, {
            headers: {
                "Content-Type": "application/json",
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error adding color:", error);
        throw error;
    }
}
const updateColor = async (colorId, colorData) => {
    try {
        const response = await axios.put(`/api/v1/admin/colors/update/${colorId}`, colorData, {
            headers: {
                "Content-Type": "application/json",
            },
        });
        return response.data; 
    } catch (error) {
        console.error("Error updating color:", error);
        throw error;
    }
};

export { fetchAllColors , addColor, updateColor };