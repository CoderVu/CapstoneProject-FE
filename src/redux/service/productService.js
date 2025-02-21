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
const fetchAllProductsOnSale = async () => {
    try {
        const response = await axios({
            method: 'GET',
            url: '/api/v1/public/products/sale',
        });
        const { data } = response.data;

        console.log("Fetched products on sale:", data);

        return data;
    } catch (error) {
        console.error("Error fetching products on sale:", error);
        throw error;
    }
}
const fetchProductDescription = async (productId) => {
    try {
        const response = await axios({
            method: 'GET',
            url: `/api/v1/public/products/${productId}/description`,
        });
        const { data } = response.data;
        return data;
    } catch (error) {
        console.error("Error fetching product description:", error);
        throw error;
    }
}
const fetchProductCareInstructions = async (productId) => {
    try {
        const response = await axios({
            method: 'GET',
            url: `/api/v1/public/products/${productId}/careInstruction`,
        });
        const { data } = response.data;
        return data;
    } catch (error) {
        console.error("Error fetching product care instructions:", error);
        throw error;
    }
}
const fetchProductViewed = async () => {
    try {
        const response = await axios({
            method: 'GET',
            url: '/api/v1/public/products/viewed',
        });
        const { data } = response.data;
        console.log("Fetched viewed products:", data);
        return data;
    } catch (error) {
        console.error("Error fetching viewed products:", error);
        throw error;
    }
}

const postViewedProduct = async (productId) => {
    try {
        const response = await axios({
            method: 'POST',
            url: `/api/v1/public/products/${productId}/view`,
        });
        return response.data;
    } catch (error) {
        console.error("Error posting viewed product:", error);
        throw error;
    }
};
export {
    fetchAllProducts,
    fetchProductDetail,
    filterProducts,
    fetchProductByCollection,
    fetchAllProductsOnSale,
    fetchProductDescription,
    fetchProductCareInstructions,
    fetchProductViewed,
    postViewedProduct,
};