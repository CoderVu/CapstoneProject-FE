import types from "../types";
import { fetchAllColors } from "../service/colorService";

export const getAllColors = () => async (dispatch) => {
  dispatch({ type: types.FETCH_CATEGORY_REQUEST });
  try {
    const colors= await fetchAllColors()
    dispatch({
      type: types.FETCH_COLOR_SUCCESS,
      payload: {
        colors
      },
    });
  } catch (error) {
    dispatch({ type: types.FETCH_COLOR_ERROR, payload: error.message });
  }
};
