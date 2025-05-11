import axios from "axios";
import { API_URL } from "../../config";
import { toast } from "react-toastify";

// Lấy thống kê tổng quan
export const getDashboardStats = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/admin/dashboard/stats`);
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message || "Lỗi khi lấy thống kê");
    throw error;
  }
};

// Lấy thống kê đơn hàng
export const getOrderStats = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/admin/orders/stats`);
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message || "Lỗi khi lấy thống kê đơn hàng");
    throw error;
  }
};

// Lấy phân tích doanh số
export const getSalesAnalytics = async (period) => {
  try {
    const response = await axios.get(`${API_URL}/api/admin/sales/analytics?period=${period}`);
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message || "Lỗi khi lấy phân tích doanh số");
    throw error;
  }
};

// Lấy top sản phẩm bán chạy
export const getTopSellingProducts = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/admin/products/top-selling`);
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message || "Lỗi khi lấy top sản phẩm");
    throw error;
  }
};

// Lấy thống kê theo thời gian thực
export const getRealTimeStats = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/admin/realtime/stats`);
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message || "Lỗi khi lấy thống kê thời gian thực");
    throw error;
  }
};

// Lấy danh sách tất cả khách hàng
export const getAllUsers = async (page = 0, size = 10) => {
  try {
    const response = await axios.get(`${API_URL}/api/admin/users?page=${page}&size=${size}`);
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message || "Lỗi khi lấy danh sách khách hàng");
    throw error;
  }
};

// Cập nhật trạng thái khách hàng
export const updateUserStatus = async (userId, status) => {
  try {
    const response = await axios.put(`${API_URL}/api/admin/users/${userId}/status`, { status });
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message || "Lỗi khi cập nhật trạng thái khách hàng");
    throw error;
  }
};

// Xóa khách hàng
export const deleteUser = async (userId) => {
  try {
    const response = await axios.delete(`${API_URL}/api/admin/users/${userId}`);
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message || "Lỗi khi xóa khách hàng");
    throw error;
  }
};

// Tìm kiếm khách hàng
export const searchUsers = async (query) => {
  try {
    const response = await axios.get(`${API_URL}/api/admin/users/search?query=${query}`);
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message || "Lỗi khi tìm kiếm khách hàng");
    throw error;
  }
};

export const updateUser = async (userId, userData) => {
  try {
    const response = await axios.put(`${API_URL}/api/admin/users/${userId}`, userData);
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message || "Lỗi khi cập nhật thông tin khách hàng");
    throw error;
  }
}; 