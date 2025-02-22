import axios from "../setup/axios";
import { showSuccessToast, showErrorToast } from "../../components/Toast/ToastNotification";

const addToCart = async (productId, quantity, size, color) => {
    try {
        const response = await axios({
            method: 'POST',
            url: '/api/v1/user/cart/add',
            data: {
                productId,
                quantity,
                size,
                color,
            },
        });
        showSuccessToast(response.data.message);
        return response.data;
    } catch (error) {
        showErrorToast(error.response.data.message);
        throw error;
    }
};

const deleteCartItem = async (cartId) => {
    try {
        const response = await axios({
            method: 'DELETE',
            url: `/api/v1/user/cart/delete/${cartId}`,
        });
        showSuccessToast(response.data.message);
        return response.data;
    } catch (error) {
        showErrorToast(error.response.data.message || "Failed to delete cart item");
        throw error;
    }
};

const fetchCartItems = async () => {
    try {
        const response = await axios({
            method: 'GET',
            url: '/api/v1/user/cart/get',
        });
        return response.data.data.response;
    } catch (error) {
        throw error;
    }
};

export { addToCart, fetchCartItems, deleteCartItem };