import axios from "../setup/axios";

// Thêm bộ sưu tập mới
export const addCollection = async (collectionData) => {
    try {
        const response = await axios.post('/api/v1/admin/collection/add', collectionData, {
            headers: { "Content-Type": "application/json" }
        });
        return response.data;
    } catch (error) {
        console.error("Error adding collection:", error);
        throw error;
    }
};

// Thêm sản phẩm vào bộ sưu tập
export const addProductToCollection = async ({ collectionId, productId }) => {
    try {
        const response = await axios.post(`/api/v1/admin/collection/${collectionId}/product/${productId}`, {
        }, {
            headers: { "Content-Type": "application/json" }
        });
        return response.data;
    } catch (error) {
        console.error("Error adding product to collection:", error);
        throw error;
    }
};

// Cập nhật bộ sưu tập
export const updateCollection = async (collectionData) => {
    try {
        const response = await axios.put('/api/v1/admin/collection/update', collectionData, {
            headers: { "Content-Type": "application/json" }
        });
        return response.data;
    } catch (error) {
        console.error("Error updating collection:", error);
        throw error;
    }
};

// Xóa sản phẩm khỏi bộ sưu tập
export const removeProductFromCollection = async (collectionId, productId) => {
    try {
        const response = await axios.delete(`/api/v1/admin/collection/${collectionId}/product/${productId}`);
        return response.data;
    } catch (error) {
        console.error("Error removing product from collection:", error);
        throw error;
    }
};

// Lấy tất cả bộ sưu tập
export const fetchAllCollections = async () => {
    try {
        const response = await axios.get('/api/v1/admin/collection/all');
        
        return response.data.data;

    } catch (error) {
        console.error("Error fetching collections:", error);
        throw error;
    }
};

// Xóa bộ sưu tập
export const deleteCollection = async (collectionId) => {
    try {
        const response = await axios.delete(`/api/v1/admin/collection/${collectionId}`);
        return response.data;
    } catch (error) {
        console.error("Error deleting collection:", error);
        throw error;
    }
};