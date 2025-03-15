import axios from "../setup/axios";

const fetchAllCategories = async () => {
    try {
        const response = await axios({
            method: 'GET',
            url: '/api/v1/public/categories',
        });
        const { data } = response.data;
        return data;
    } catch (error) {
        console.error("Error fetching categories:", error);
        throw error;
    }
}
const addCategory = async (categoryData) => {
    try {
        const response = await axios({
            method: 'POST',
            url: '/api/v1/admin/categories/add',
            data: categoryData,
        });
        const { data } = response.data;
        return data;
    } catch (error) {
        console.error("Error adding category:", error);
        throw error;
    }
}
const updateCategory = async (categoryId) => {
    try {
        const response = await axios({
            method: 'PUT',
            url: `/api/v1/admin/categories/update/${categoryId}`,
        });
        const { data } = response.data;
        return data;
    } catch (error) {
        console.error("Error updating category:", error);
        throw error;
    }
}
const deleteCategory = async (categoryId) => {
    try {
        const response = await axios({
            method: 'DELETE',
            url: `/api/v1/admin/categories/delete/${categoryId}`,
        });
        const { data } = response.data;
        return data;
    } catch (error) {
        console.error("Error deleting category:", error);
        throw error;
    }
}
export { fetchAllCategories, addCategory, updateCategory,deleteCategory};