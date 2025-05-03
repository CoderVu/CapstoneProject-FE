import { loginUserService, logoutUserService, fetchUserData } from "../service/authService";
import types from "../types";

const loginUserSuccess = (auth) => ({
  type: types.LOGIN_SUCCESS,
  payload: auth,
});

const loginUserError = (error) => ({
  type: types.LOGIN_FAILURE,
  payload: error,
});

export const loginUser = (phoneNumber, password) => {
  return async (dispatch) => {
    dispatch({ type: types.LOGIN_REQUEST });
    try {
      const res = await loginUserService(phoneNumber, password);
      console.log("Login dataa:", res);

      const  dulieu  = res.data; 
      localStorage.setItem("token", dulieu.token); 
      dispatch(loginUserSuccess(dulieu)); 
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      const errorMessage = error?.response?.data?.message || "Login failed";
      console.error("Login error:", errorMessage);
      dispatch(loginUserError(errorMessage));
    }
  };
};


export const fetchUserInfo = (token) => async (dispatch) => {
  dispatch({ type: types.LOGIN_REQUEST });
  try {
    const res = await fetchUserData(token);
    if (res.statusCode === 200) {
      const { data } = res;
      dispatch(loginUserSuccess(data));
    }
  } catch (error) {
    dispatch({ type: types.LOGIN_FAILURE, payload: error.message });
  }
};

export const oauth2LoginSuccess = (auth, token) => (dispatch) => {
  localStorage.setItem('token', token);
  dispatch(loginUserSuccess(auth));
};

export const logoutUser = () => (dispatch) => {
  try {
    logoutUserService();
    dispatch({ type: types.LOGOUT });
  } catch (error) {
    console.error("Error logging out user:", error);
  }
};