import axios from "../setup/axios";
import { showSuccessToast, showErrorToast } from "../../components/Toast/ToastNotification";

export const addDiscountCode = async (discountPercentage, expiryDate) => {
    try {
        const response = await axios({
            method: 'POST',
            url: '/api/v1/admin/discount-code/add',
            params: {
                discountPercentage: discountPercentage,
                expiryDate: expiryDate
            }
        });

        // Show success toast
        showSuccessToast('Thêm mã giảm giá thành công!');
        return response.data;
    } catch (error) {
        console.error('Error adding discount code:', error);

        // Show error toast
        showErrorToast('Thêm mã giảm giá thất bại!');
        throw error; // Re-throw the error for further handling if needed
    }
};

export const fetchDiscountCodes = async () => {
    try {
        const response = await axios({
            method: 'GET',
            url: '/api/v1/admin/discount-code/get-all',
        });
        return response.data;

    } catch (error) {
        console.error('Error fetching discount codes:', error);
        throw error;
    }
}

export const applyDiscountCodeToUser = async (discountCode, userId) => {
    try {
        const response = await axios({
            method: 'POST',
            url: '/api/v1/admin/discount-code/apply',
            params: {
                discountCode: discountCode,
                userId: userId
            }
        });

        console.log("userId", userId)
        console.log("discountCode", discountCode)

        // Show success toast
        showSuccessToast('Áp dụng mã giảm giá thành công!');
        return response.data;
    } catch (error) {
        console.error('Error applying discount code:', error);

        // Show error toast
        showErrorToast('Áp dụng mã giảm giá thất bại!');
        throw error; // Re-throw the error for further handling if needed
    }
};

export const applyDiscountCodeToMe = (discountCode) => {
    console.log("discountCode", discountCode)
   try {
        const response = axios({
            method: 'PUT',
            url: '/api/v1/user/apply-discount-code',

            params: {
                discountCode: discountCode
            }
        });

        // Show success toast
      
        return response.data;
    }
    catch (error) {
        console.error('Error applying discount code:', error);

        // Show error toast
      
        throw error; // Re-throw the error for further handling if needed
    }
}
// Get discount codes for user
export const getDiscountCodesForUser = async () => {
    try {
        const response = await axios({
            method: 'GET',
            url: `/api/v1/user/discount-code`,
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching discount codes for user:", error);
        throw error;
    }
};

