import types from "../types";
import {
  fetchAllProducts, fetchProductDetail, filterProducts, fetchAllProductsOnSale, fetchProductDescription,
  fetchProductCareInstructions, fetchProductRelated, fetchProductViewed, postViewedProduct
} from "../service/productService";

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
export const getProductDetail = (productId, page = 0, size = 30) => async (dispatch) => {
  dispatch({ type: types.FETCH_PRODUCT_DETAIL_REQUEST });
  try {
    const [productDetail, productDescription, productCareInstructions, productRelated] = await Promise.all([
      fetchProductDetail(productId),
      fetchProductDescription(productId).catch((error) => {
        if (error.response && error.response.status === 404) {
          console.log("error0", error);
          return null; // Handle 404 error for description
        }
        throw error;
      }),
      fetchProductCareInstructions(productId).catch((error) => {
        if (error.response && error.response.status === 404) {
          console.log("error1", error);
          return null; // Handle 404 error for care instructions
        }
        throw error;
      }),
      fetchProductRelated(productId, page, size),
    ]);
    dispatch({
      type: types.FETCH_PRODUCT_DETAIL_SUCCESS,
      payload: {
        productDetail,
        productDescription,
        productCareInstructions,
        productRelated,
      },
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

// Action to fetch products on sale
export const getProductsOnSale = () => async (dispatch) => {
  dispatch({ type: types.FETCH_PRODUCT_ON_SALE_REQUEST });
  try {
    const data = await fetchAllProductsOnSale();
    dispatch({
      type: types.FETCH_PRODUCT_ON_SALE_SUCCESS,
      payload: data,
    });
  } catch (error) {
    dispatch({ type: types.FETCH_PRODUCT_ON_SALE_ERROR, payload: error.message });
  }
};