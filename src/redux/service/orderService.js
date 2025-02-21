import axios from "../setup/axios";
const fetchOrderMock= async () => {
    try {
        const response = await axios({
            method: 'GET',
            url: `/api/v1/public/orders/mock`,
        });
        const { data } = response.data;
        return data;
    } catch (error) {
        console.error("Error fetching product description:", error);
        throw error;
    }
}

export { fetchOrderMock };