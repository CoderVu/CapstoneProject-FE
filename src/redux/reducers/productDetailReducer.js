import types from "../types";

const initialState = {
  productDetail: {},
  productDescription: {},
  loading: false,
  error: null,
};

const productDetailReducer = (state = initialState, action) => {
  switch (action.type) {
    case types.FETCH_PRODUCT_DETAIL_REQUEST:
      return { ...state, loading: true, error: null };

    case types.FETCH_PRODUCT_DETAIL_SUCCESS:
      return {
        ...state,
        loading: false,
        productDetail: action.payload.productDetail,
        productDescription: action.payload.productDescription,
        error: null,
      };

    case types.FETCH_PRODUCT_DETAIL_ERROR:
      return { ...state, loading: false, error: action.payload };

    default:
      return state;
  }
};

export default productDetailReducer;