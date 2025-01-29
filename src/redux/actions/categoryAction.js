import types from "../types";
import { fetchAllCategories } from "../service/categoryService";

// Action to fetch the list of categories
export const getCategories = () => async (dispatch) => {
  dispatch({ type: types.FETCH_CATEGORY_REQUEST });
  try {
    const categories = await fetchAllCategories();
    dispatch({
      type: types.FETCH_CATEGORY_SUCCESS,
      payload: {
        categories,
      },
    });
  } catch (error) {
    dispatch({ type: types.FETCH_CATEGORY_ERROR, payload: error.message });
  }
};

// Action to set the selected category