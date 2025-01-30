import types from "../types";
import { fetchAllProducts, fetchProductDetail , filterProducts} from "../service/productService";

// Action to fetch the list of products
export const getProducts = (page, size) => async (dispatch) => {
  dispatch({ type: types.FETCH_PRODUCT_REQUEST });
  try {
    const data = await fetchAllProducts(page, size);
    const { response: products, totalPages, totalElements } = data;
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

// Action to fetch the details of a product
export const getProductDetail = (productId) => async (dispatch) => {
  dispatch({ type: types.FETCH_PRODUCT_DETAIL_REQUEST });
  try {
    const data = await fetchProductDetail(productId);
    dispatch({
      type: types.FETCH_PRODUCT_DETAIL_SUCCESS,
      payload: data,
    });
  } catch (error) {
    dispatch({ type: types.FETCH_PRODUCT_DETAIL_ERROR, payload: error.message });
  }
};

// Action to filter products 
export const filterProduct = (filter) => async (dispatch) => {
  dispatch({ type: types.FILTER_PRODUCTS_REQUEST });
  try {
    const data = await filterProducts(filter);
    const { response: products, totalPages, totalElements } = data;
    dispatch({
      type: types.FILTER_PRODUCTS_SUCCESS,
      payload: {
        products,
        totalPages,
        totalElements,
      },
    });
  } catch (error) {
    dispatch({ type: types.FILTER_PRODUCTS_ERROR, payload: error.message });
  }
};