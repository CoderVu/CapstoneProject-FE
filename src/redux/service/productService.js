import axios from "../setup/axios"; 
import { showSuccessToast, showErrorToast } from "../../components/Toast/ToastNotification";
const addProduct = async (productData) => {
    try {
        const formData = new FormData();
        for (const key in productData) {
            if (Array.isArray(productData[key])) {
                productData[key].forEach((file) => formData.append(key, file));
            } else {
                formData.append(key, productData[key]);
            }
        }

        console.log("Form data:", formData);    

        const response = await axios({
            method: 'POST',
            url: '/api/v1/admin/products/add',
            data: formData,
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        showSuccessToast(response.data.message);

        return response.data;
    } catch (error) {
        console.error("Error adding product:", error);
        if (error.response && error.response.data) {
            showErrorToast(error.response.data.message);
        } else {
            showErrorToast("An unexpected error occurred.");
        }
        throw error;
    }
};

const  updateProduct = async (productId, productData) => {
    try {
        const formData = new FormData();
        for (const key in productData) {
            if (Array.isArray(productData[key])) {
                productData[key].forEach((file) => formData.append(key, file));
            } else {
                formData.append(key, productData[key]);
            }
        }
        console.log("Form data:", formData);
        const response = await axios.put(
            `/api/v1/admin/products/update/${productId}`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );

        showSuccessToast(response.data.message);

        return response.data;
    } catch (error) {
        console.error("Error updating product:", error);
        if (error.response && error.response.data) {
            showErrorToast(error.response.data.message);
        } else {
            showErrorToast("An unexpected error occurred.");
        }
        throw error;
    }
};


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
const fetchProductByCollection = async (name, page, size) => {
    try {
        const response = await axios({
            method: 'GET',
            url: `/api/v1/public/products/collection/name/${name}?page=${page}&size=${size}`,
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


        return data;
    } catch (error) {
        console.error("Error filtering products:", error);
        throw error;
    }
}
const searchProducts = async (keyword, page, size) => {
    try {
        const response = await axios({
            method: 'GET',
            url: `/api/v1/public/products/search?keyword`,
            params: { keyword, page, size },
        });
        const { data } = response.data;
        return data;
    } catch (error) {
        console.error("Error searching products:", error);
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
        console.log("Posted viewed product:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error posting viewed product:", error);
        throw error;
    }
};
const fetchProductRelated = async (productId, page, size) => {
    try {
        const response = await axios({
            method: 'GET',
            url: `/api/v1/public/products/related/${productId}?page=${page}&size=${size}`,
        });
        const { data } = response.data;
        return data;
    } catch (error) {
        console.error("Error fetching related products:", error);
        throw error;
    }
}
const addVariantProduct = async (productId, variantData) => {
    try {
        const response = await axios.post(
            `/api/v1/admin/products/${productId}/variants`,
            Array.isArray(variantData) ? variantData : [variantData], 
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );

        showSuccessToast(response.data.message);
        return response.data;
    } catch (error) {
        console.error("Error adding variant product:", error);
        showErrorToast(error.response?.data?.message || "An unexpected error occurred.");
        throw error;
    }
};
const updateVariantProduct = async (productId, variantData) => {
    try {
        const response = await axios.put(
            `/api/v1/admin/products/${productId}/variants`,
            variantData,
            console.log("variantData", variantData),
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );

        showSuccessToast(response.data.message);
        return response.data;
    } catch (error) {
        console.error("Error updating variant product:", error);
        showErrorToast(error.response?.data?.message || "An unexpected error occurred.");
        throw error;
    }
};
const deleteVariantProduct = async (variantId) => {
    try {
        const response = await axios.delete(
            `/api/v1/admin/products/variants/${variantId}`,
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );
        showSuccessToast(response.data.message);
        return response.data;
    } catch (error) {
        console.error("Error deleting variant product:", error);
        showErrorToast(error.response?.data?.message || "An unexpected error occurred.");
        throw error;
    }
};
const addProductDescription = async (productId, descriptionData) => {
    try {
        const response = await axios.post(
            `/api/v1/admin/products/${productId}/description`,
            descriptionData,
            {
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );
        showSuccessToast(response.data.message);
        return response.data;
    } catch (error) {
        console.error("Error updating product description:", error);
        showErrorToast(error.response?.data?.message || "An unexpected error occurred.");
        throw error;
    }
};
const deleteProduct = async (productId) => {
    try {
        const response = await axios.delete(
            `/api/v1/admin/products/${productId}`,
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );
        showSuccessToast(response.data.message);
        return response.data;
    } catch (error) {
        console.error("Error deleting product:", error);
        showErrorToast(error.response?.data?.message || "An unexpected error occurred.");
        throw error;
    }
};

const updateProductDescription = async (productId, descriptionData) => {
    try {
        const response = await axios.put(
            `/api/v1/admin/products/${productId}/description`,
            descriptionData,
            {
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );
        showSuccessToast(response.data.message);
        return response.data;
    } catch (error) {
        console.error("Error updating product description:", error);
        showErrorToast(error.response?.data?.message || "An unexpected error occurred.");
        throw error;
    }
}
const addProductCareInstructions = async (productId, careInstructions) => {
    try {
        const response = await axios.post(
            `/api/v1/admin/products/${productId}/careInstruction`,
            careInstructions,
            {
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );
        showSuccessToast(response.data.message);
        return response.data;
    } catch (error) {
        console.error("Error updating product care instructions:", error);
        showErrorToast(error.response?.data?.message || "An unexpected error occurred.");
        throw error;
    }
}
const updateProductCareInstructions = async (productId, careInstructions) => {
    try {
        const response = await axios.put(
            `/api/v1/admin/products/${productId}/careInstruction`,
            careInstructions,
            {
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );
        showSuccessToast(response.data.message);
        return response.data;
    } catch (error) {
        console.error("Error updating product care instructions:", error);
        showErrorToast(error.response?.data?.message || "An unexpected error occurred.");
        throw error;
    }
}
const getColorsByProductId = async (productId) => {
    try {
        const response = await axios({
            method: 'GET',
            url: `/api/v1/public/products/colors/${productId}`,
        });
        const { data } = response.data;
        return data;
    } catch (error) {
        console.error("Error fetching colors by product id:", error);
        throw error;
    }
}
const getProductsByImgUrls = async (imgUrls) => {
    try {
        // Construct the query parameters
        const params = new URLSearchParams();
        imgUrls.forEach((url) => params.append("imgUrls", url)); 

        // Send the GET request with the constructed query string
        const response = await axios.get(
            `/api/v1/public/search/products/images?${params.toString()}`,
        );

        // Extract and return the data
        const { data } = response.data;
        console.log("Fetched products by image URLs:", data);
        return data;
    } catch (error) {
        console.error("Error fetching products by image URLs:", error);
        throw error;
    }
};
export {
    fetchAllProducts,
    fetchProductDetail,
    filterProducts,
    searchProducts,
    fetchProductByCollection,
    fetchAllProductsOnSale,
    fetchProductDescription,
    fetchProductCareInstructions,
    fetchProductViewed,
    postViewedProduct,
    fetchProductRelated,
    addProduct,
    updateProduct,
    addVariantProduct,
    updateVariantProduct,
    deleteVariantProduct,
    addProductDescription,
    deleteProduct,
    updateProductDescription,
    addProductCareInstructions,
    updateProductCareInstructions,
    getColorsByProductId,
    getProductsByImgUrls,
};