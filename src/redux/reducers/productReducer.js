import types from "../types";

const initialState = {
  products: [],
  totalPages: 0,
  totalElements: 0,
  loading: false,
  error: null,
};

const productReducer = (state = initialState, action) => {
  switch (action.type) {
    case types.FETCH_PRODUCT_REQUEST:
    case types.FILTER_PRODUCTS_REQUEST:
      return { ...state, loading: true, error: null };

    case types.FETCH_PRODUCT_SUCCESS:
    case types.FILTER_PRODUCTS_SUCCESS:
      return {
        ...state,
        loading: false,
        products: action.payload.products, // Danh sách sản phẩm
        totalPages: action.payload.totalPages, // Tổng số trang
        totalElements: action.payload.totalElements, // Tổng số sản phẩm
      };

    case types.FETCH_PRODUCT_ERROR:
    case types.FILTER_PRODUCTS_ERROR:
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

export default productReducer;