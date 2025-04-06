import axios from "../setup/axios"; 
import { showSuccessToast, showErrorToast } from "../../components/Toast/ToastNotification";

export const fetchAllUser = async () => {
    try {
        const response = await axios({
            method: 'GET',
            url: `/api/v1/public/users/all-chat`
        });
        const { data } = response.data;
        return data;
    } catch (error) {
        console.error("Error fetching rating:", error);
        throw error;
    }
}

// Get user's favorites
export const getFavorite = async () => {
    try {
        const response = await axios({
            method: 'GET',
            url: `/api/v1/user/favorite`,
        });
        return response.data.data;
    } catch (error) {
        console.error("Error fetching favorites:", error);
        throw error;
    }
};

// Add product to favorites
export const addFavorite = async (productId) => {
    try {
        const response = await axios({
            method: 'POST',
            url: `/api/v1/user/favorite`,
            params: { productId } // Using query parameter
        });
        showSuccessToast(response.data.message);
        return response.data.data;
    } catch (error) {
        // Handle 409 conflict (already in favorites) more gracefully
        if (error.response && error.response.status === 409) {
            console.log("Product is already in favorites");
            // Return a success-like response so UI can handle it appropriately
            return {
                success: true,
                message: "Product already in favorites"
            };
        }
        showErrorToast(error.response.data.message || "Failed to add to favorites");
        console.error("Error adding favorite:", error);
        throw error;
    }
};

// Remove product from favorites
export const removeFavorite = async (productId) => {
    try {
        const response = await axios({
            method: 'DELETE',
            url: `/api/v1/user/favorite`,
            params: { productId } // Using query parameter
        });
        return response.data.data;
    } catch (error) {
        // Handle 404 not found (not in favorites) more gracefully
        if (error.response && error.response.status === 404) {
            console.log("Product not found in favorites");
            // Return a success-like response so UI doesn't show an error
            return {
                success: true,
                message: "Product was not in favorites"
            };
        }
        console.error("Error removing favorite:", error);
        throw error;
    }
}

// Update user info
export const updateUserInfo = async (userInfo) => {
    try {
        const response = await axios({
            method: 'PUT',
            url: `/api/v1/user/info`,
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            data: userInfo
        });
        showSuccessToast(response.data.message);
        return response.data.data;
    } catch (error) {
        showErrorToast(error.response.data.message || "Failed to update user info");
        console.error("Error updating user info:", error);
        throw error;
    }
}

