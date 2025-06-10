import axios from "../setup/axios";

const fetchAllBrands = async () => {
    try {
        const response = await axios({
            method: 'GET',
            url: '/api/v1/public/brands',
        });
        const { data } = response.data;
        return data;
    } catch (error) {
        console.error("Error fetching brands:", error);
        throw error;
    }
}

const createBrand = async (brandData) => {
    try {
        const response = await axios({
            method: 'POST',
            url: '/api/v1/admin/brands/add',
            data: brandData,
        });
        return response.data;
    } catch (error) {
        console.error("Error creating brand:", error);
        throw error;
    }
}

const updateBrand = async (brandId, brandData) => {
    try {
        const response = await axios({
            method: 'PUT',
            url: `/api/v1/admin/brands/update/${brandId}`,
            data: brandData,
        });
        return response.data;
    } catch (error) {
        console.error("Error updating brand:", error);
        throw error;
    }
}

const deleteBrand = async (brandId) => {
    try {
        const response = await axios({
            method: 'DELETE',
            url: `/api/v1/admin/brands/${brandId}`,
        });
        return response.data;
    } catch (error) {
        console.error("Error deleting brand:", error);
        throw error;
    }
}

const getBrandById = async (brandId) => {
    try {
        const response = await axios({
            method: 'GET',
            url: `/api/v1/public/brands/${brandId}`,
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching brand:", error);
        throw error;
    }
}

export { fetchAllBrands, createBrand, updateBrand, deleteBrand, getBrandById };