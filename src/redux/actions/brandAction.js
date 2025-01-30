import types from "../types";
import { fetchAllBrands } from "../service/brandService";

export const getAllBrands = () => async (dispatch) => {
  dispatch({ type: types.FETCH_BRAND_REQUEST });
  try {
    const brands= await fetchAllBrands()
    dispatch({
      type: types.FETCH_BRAND_SUCCESS,
      payload: {
        brands
      },
    });
  } catch (error) {
    dispatch({ type: types.FETCH_BRAND_ERROR, payload: error.message });
  }
};
