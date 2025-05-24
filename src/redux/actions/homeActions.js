import types from "../types";
import { fetchProductByCollection, fetchProductViewed } from "../service/productService";

// New Arrivals Actions
export const getNewArrivals = (name = "New Arrivals") => async (dispatch) => {
  dispatch({ type: types.FETCH_NEW_ARRIVALS_REQUEST });
  try {
    const data = await fetchProductByCollection(name, 0, 20);
    dispatch({
      type: types.FETCH_NEW_ARRIVALS_SUCCESS,
      payload: data.response
    });
  } catch (error) {
    dispatch({
      type: types.FETCH_NEW_ARRIVALS_ERROR,
      payload: error.message
    });
  }
};

// Best Sellers Actions
export const getBestSellers = (name = "Best Sellers") => async (dispatch) => {
  dispatch({ type: types.FETCH_BEST_SELLERS_REQUEST });
  try {
    const data = await fetchProductByCollection(name, 0, 20);
    dispatch({
      type: types.FETCH_BEST_SELLERS_SUCCESS,
      payload: data.response
    });
  } catch (error) {
    dispatch({
      type: types.FETCH_BEST_SELLERS_ERROR,
      payload: error.message
    });
  }
};

// Viewed Products Actions
export const getViewedProducts = () => async (dispatch) => {
  dispatch({ type: types.FETCH_VIEWED_PRODUCTS_REQUEST });
  try {
    const data = await fetchProductViewed();
    dispatch({
      type: types.FETCH_VIEWED_PRODUCTS_SUCCESS,
      payload: data
    });
  } catch (error) {
    dispatch({
      type: types.FETCH_VIEWED_PRODUCTS_ERROR,
      payload: error.message
    });
  }
}; 