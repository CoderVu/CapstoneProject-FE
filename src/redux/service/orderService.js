import axios from "../setup/axios";
import { showSuccessToast, showErrorToast } from "../../components/Toast/ToastNotification";
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

const createOrderFromCart = async (orderRequest) => {
    try {
        const response = await axios({
            method: 'POST',
            url: `/api/v1/user/order/create-cart`,
            data: orderRequest,
        });
        const { data } = response.data;

        showSuccessToast(response.data.message);
        return data;
    } catch (error) {
        console.error("Error creating order from cart:", error);
        showErrorToast(error.response.data.message || "Failed to create order from cart");
        throw error;
    }
}
const fetchOrder = async () => {
    try {
        const response = await axios({
            method: 'GET',
            url: `/api/v1/user/order/history`,
        });
        const { data } = response.data;
        return data;
    } catch (error) {
        console.error("Error fetching product description:", error);
        throw error;
    }
}
const fetchAllOrder = async () => {
    try {
        const response = await axios({
            method: 'GET',
            url: `/api/v1/admin/order/get-all`,
        });
        const { data } = response.data;
        return data;
    } catch (error) {
        console.error("Error fetching product description:", error);
        throw error;
    }
}
export { fetchOrderMock , createOrderFromCart , fetchOrder , fetchAllOrder};