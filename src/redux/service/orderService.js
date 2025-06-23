import axios from "../setup/axios";
import { showSuccessToast, showErrorToast } from "../../components/Toast/ToastNotification";
const fetchOrderMock = async () => {
    try {
        const response = await axios({
            method: 'GET',
            url: `/api/v1/public/orders/recent`,
        });
        const { data } = response.data;

        console.log("datds", data)

        // Assuming you want the first item from the data array
        const singleItem = Array.isArray(data) ? data[0] : data;

        return singleItem;
    } catch (error) {
        console.error("Error fetching product description:", error);
        throw error;
    }
};

const createOrderFromCart = async (orderRequest) => {
    try {
        const response = await axios({
            method: 'POST',
            url: `/api/v1/user/order/create-cart`,
            data: orderRequest,
        });
        const { data } = response.data;


        // showSuccessToast(response.data.message);
        return data;
    } catch (error) {
        console.error("Error creating order from cart:", error);
        showErrorToast(error.response.data.message || "Failed to create order from cart");
        throw error;
    }
}

const createOrderNow = async (orderRequest) => {
    try {
        const response = await axios({
            method: 'POST',
            url: `/api/v1/user/order/create`,
            data: orderRequest,
        });
        const { data } = response.data;
    
        console.log("dasdta", data)
        return data;
    } catch (error) {
        console.error("Error creating order now:", error);
     
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
const fetchAllOrder = async (page, size) => {
    try {
        const response = await axios({
            method: 'GET',
            url: `/api/v1/admin/order/get-all`,
            params: { page, size }
        });
        const { data } = response.data;
        return data;
    } catch (error) {
        console.error("Error fetching product description:", error);
        throw error;
    }
}
const cancelOder = async (orderCode) => {
    try {
        const response = await axios({
            method: 'PUT',
            url: `/api/v1/user/order/cancel`,
            params: { orderCode }
        });
        const { data } = response.data;
        showSuccessToast(response.data.message);
        return data;
    } catch (error) {
        console.error("Error cancelling order:", error);
        showErrorToast(error.response.data.message);
        throw error;
    }
}
const updateOrderStatus = async (orderId, status) => {
    try {
        const response = await axios({
            method: 'PUT',
            url: `/api/v1/admin/order/update-status`,
            params: { orderId , status }
           
        
        });
        console.log("param", orderId, status)
        const { data } = response.data;
        showSuccessToast(response.data.message || "Order status updated successfully");
        return data;
    } catch (error) {
        console.error("Error updating order status:", error);
        showErrorToast(error.response.data.message || "Failed to update order status");
        throw error;
    }
}

const getStatistics = async () => {
    try {
        const response = await axios({
            method: 'GET',
            url: `/api/v1/admin/order/order-statistics`,
        });
        const { data } = response.data;
        return data;
    } catch (error) {
        console.error("Error fetching product description:", error);
        throw error;
    }
}

export { fetchOrderMock, cancelOder, createOrderFromCart, createOrderNow ,fetchOrder, fetchAllOrder , updateOrderStatus, getStatistics };