import types from "../types";
import { fetchAllProducts } from "../service/productService";

// Action to fetch the list of products
export const getProducts = (page = 0, size = 10) => async (dispatch) => {
  dispatch({ type: types.FETCH_PRODUCT_REQUEST });
  try {
    const data = await fetchAllProducts(page, size);
    const { data: products, totalPages, totalElements } = data;
    dispatch({
      type: types.FETCH_PRODUCT_SUCCESS,
      payload: {
        products,
        totalPages,
        totalElements,
      },
    });
  } catch (error) {
    dispatch({ type: types.FETCH_PRODUCT_ERROR, payload: error.message });
  }
};
