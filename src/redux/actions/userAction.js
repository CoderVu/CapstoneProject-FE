import types from "../types";
import { fetchInfoUser } from "../service/userService";

export const fetchUserInfo = (token) => async (dispatch) => {
    dispatch({ type: types.FETCH_USER_INFO_REQUEST });
    try {
        const data = await fetchInfoUser(token);
        console.log("User infooo Actioon:", data);
        dispatch({
        type: types.FETCH_USER_INFO_SUCCESS,
        payload: data.data,
        });
    } catch (error) {
        dispatch({ type: types.FETCH_USER_INFO_ERROR, payload: error.message });
    }
    };

