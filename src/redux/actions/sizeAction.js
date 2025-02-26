import types from "../types";
import { fetchAllSizes } from "../service/sizeService";

export const getAllSizes = () => async (dispatch) => {
  dispatch({ type: types.FETCH_SIZE_REQUEST });
  try {
    const sizes= await fetchAllSizes()
    dispatch({
      type: types.FETCH_SIZE_SUCCESS,
      payload: {
        sizes
      },
    });
  } catch (error) {
    dispatch({ type: types.FETCH_SIZE_ERROR, payload: error.message });
  }
};
