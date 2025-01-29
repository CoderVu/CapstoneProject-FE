import { loginUserService } from "../service/authService";
import types from "../types";

// Define the action creators
const loginUserSuccess = (userData) => ({
  type: types.LOGIN_SUCCESS,
  payload: userData,
});

const loginUserError = (error) => ({
  type: types.LOGIN_ERROR,
  payload: error,
});

export const loginUser = (phoneNumber, password) => {
  return async (dispatch) => {
    dispatch({ type: types.LOGIN_REQUEST });
    try {
      const res = await loginUserService(phoneNumber, password);
      console.log("API Response:", res);

      // Kiểm tra statusCode từ dữ liệu trả về
      if (res.statusCode === 200) {
        const { data } = res;
        console.log("Login Successful:", data);

        // Lưu token vào localStorage
        localStorage.setItem("token", data.token);

        // Dispatch thành công với dữ liệu người dùng
        dispatch(loginUserSuccess(data));
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } else {
        console.log("Login Failed:", res.message);

        dispatch(loginUserError(res.message));
      }
    } catch (error) {
      console.log("Error during login:", error);

      // Xử lý lỗi từ response hoặc lỗi kết nối
      const errorMessage =
        error.response && error.response.data && error.response.message
          ? error.response.message
          : "An error occurred during login.";
      dispatch(loginUserError(errorMessage));
    }
  };
};

export const oauth2LoginSuccess = (user, token) => (dispatch) => {
  localStorage.setItem('token', token);
  dispatch({ type: types.LOGIN_SUCCESS, payload: user });
};