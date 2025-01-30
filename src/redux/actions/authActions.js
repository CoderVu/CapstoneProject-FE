import { loginUserService } from "../service/authService";
import types from "../types";

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
      if (res.statusCode === 200) {
        const { data } = res;
        localStorage.setItem("token", data.token);
        dispatch(loginUserSuccess(data));
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } 
      else {
        dispatch(loginUserError(res.message));
      }
    } catch (error) {
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

export const logout = () => (dispatch) => {
  localStorage.removeItem('token');
  dispatch({ type: types.LOGOUT });
};