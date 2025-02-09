import axios from "../setup/axios";

const fetchRating = async (productId, page, size) => {
    try {
        const response = await axios({
            method: 'GET',
            url: `/api/v1/public/products/rated/${productId}?page=${page}&size=${size}`
        });
        const { data } = response.data;
        return data;
    } catch (error) {
        console.error("Error fetching rating:", error);
        throw error;
    }
}

export {
    fetchRating,
};