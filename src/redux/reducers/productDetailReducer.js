import types from "../types";

const initialState = {
  product: {},
  loading: false,
  error: null,
};

const productDetailReducer = (state = initialState, action) => {
  switch (action.type) {
    case types.FETCH_PRODUCT_DETAIL_REQUEST:
      return { ...state, loading: true, error: null };

    case types.FETCH_PRODUCT_DETAIL_SUCCESS:
      return {
        loading: false,
        product: action.payload,
        error: null,
      };

    case types.FETCH_PRODUCT_DETAIL_ERROR:
      return { ...state, loading: false, error: action.payload };

    default:
      return state;
  }
};

export default productDetailReducer;