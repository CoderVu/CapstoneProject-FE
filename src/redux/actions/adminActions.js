import types from "../types";
import { fetchAllUsers, getUserById, deleteUser, registerStaffService } from "../service/adminService";

// Action to fetch all users
export const fetchAllUsersAction = () => async (dispatch) => {
    dispatch({ type: types.FETCH_USERS_REQUEST });
    try {
        const response = await fetchAllUsers();
        dispatch({
            type: types.FETCH_USERS_SUCCESS,
            payload: response.data
        });
    } catch (error) {
        dispatch({
            type: types.FETCH_USERS_ERROR,
            payload: error.message
        });
    }
};

// Action to fetch user by ID
export const fetchUserByIdAction = (id) => async (dispatch) => {
    dispatch({ type: types.FETCH_USER_REQUEST });
    try {
        const response = await getUserById(id);
        dispatch({
            type: types.FETCH_USER_SUCCESS,
            payload: response.data
        });
    } catch (error) {
        dispatch({
            type: types.FETCH_USER_ERROR,
            payload: error.message
        });
    }
};

// Action to delete user
export const deleteUserAction = (id) => async (dispatch) => {
    dispatch({ type: types.DELETE_USER_REQUEST });
    try {
        await deleteUser(id);
        dispatch({
            type: types.DELETE_USER_SUCCESS,
            payload: id
        });
        // Refresh the user list after deletion
        dispatch(fetchAllUsersAction());
    } catch (error) {
        dispatch({
            type: types.DELETE_USER_ERROR,
            payload: error.message
        });
    }
};

// Action to register staff
export const registerStaffAction = (staffData) => async (dispatch) => {
    dispatch({ type: types.REGISTER_STAFF_REQUEST });
    try {
        const response = await registerStaffService(staffData);
        dispatch({
            type: types.REGISTER_STAFF_SUCCESS,
            payload: response.data
        });
        // Refresh the user list after registration
        dispatch(fetchAllUsersAction());
        return response;
    } catch (error) {
        dispatch({
            type: types.REGISTER_STAFF_ERROR,
            payload: error.message
        });
        throw error;
    }
}; 