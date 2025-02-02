import axios from "../setup/axios"; 

const fetchAllProducts = async (page, size) => {
    try {
        const response = await axios({
            method: 'GET',
            url: `/api/v1/public/products?page=${page}&size=${size}`,
        }); 

        // Trích xuất dữ liệu cần thiết từ response
        const { data } = response.data;

        console.log("Fetched products:", data.totalElements);

        return data; // Trả về phần data cho dễ sử dụng
    } catch (error) {
        console.error("Error fetching products:", error);
        throw error; // Ném lỗi ra để các tầng trên xử lý
    }
};
const fetchProductByCollection = async (collectionId, page, size) => {
    try {
        const response = await axios({
            method: 'GET',
            url: `/api/v1/public/products/collection/${collectionId}?page=${page}&size=${size}`,
        });

        const { data } = response.data;

        return data;
    } catch (error) {
        console.error("Error fetching products by collection:", error);
        throw error;
    }
}

const fetchProductDetail = async (productId) => {
    try {
        const response = await axios({
            method: 'GET',
            url: `/api/v1/public/products/${productId}`,
        });
        const { data } = response.data;
        return data;
    } catch (error) {
        console.error("Error fetching product detail:", error);
        throw error;
    }
}

const filterProducts = async (filter) => {
    try {
        const response = await axios({
            method: 'GET',
            url: '/api/v1/public/products/filter',
            params: filter,
        });
        const { data } = response.data;
        console.log("Filtered products:", data.totalElements);
        console.log("Filter:", data);
        return data;
    } catch (error) {
        console.error("Error filtering products:", error);
        throw error;
    }
}

export {
    fetchAllProducts,
    fetchProductDetail,
    filterProducts,
    fetchProductByCollection
};