import axios from "../setup/axios";

export const fetchAllUsers = async () => {
    try {
        const response = await axios({
            method: 'GET',
            url: '/api/v1/admin/users'
        });
        console.log("data", response.data);     
        return response.data;
    } catch (error) {
        console.error("Error fetching users:", error);
        throw error;
    }
};
export const registerStaffService = async ({ fullName, email, password, phoneNumber, address }) => {
    try {
      const response = await axios({
        method: 'POST',
        url: '/api/v1/admin/users/register/staff',
        data: { fullName, email, password, phoneNumber, address },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching register staff:", error);
      throw error;
    }
  };
export const getUserById = async (id) => {
    try {
        const response = await axios({
            method: 'GET',
            url: `/api/v1/admin/users/${id}`
        });
        console.log("data 1 ", response.data);
        return response.data;
    } catch (error) {
        console.error("Error fetching user:", error);
        throw error;
    }
};

export const deleteUser = async (id) => {
    try {
        const response = await axios({
            method: 'DELETE',
            url: `/api/v1/admin/users/${id}`
        });
        return response.data;
    } catch (error) {
        console.error("Error deleting user:", error);
        throw error;
    }
}; 