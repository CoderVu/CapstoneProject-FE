import types  from "../types";

const initialState = {
  orders : [],
  totalPages: 0,
  totalElements: 0,
  loading: false,
  error: null,
};

const orderReducer = (state = initialState, action) => {
  switch (action.type) {
    case types.FETCH_ORDER_REQUEST:
        return { ...state, loading: true, error: null };
    case types.FETCH_ORDER_SUCCESS:

        return {
        ...state,
        loading: false,
        orders: action.payload.orders, // Danh sách sản phẩm
        totalPages: action.payload.totalPages, // Tổng số trang
        totalElements: action.payload.totalElements, // Tổng số sản phẩm
      };

    case types.FETCH_ORDER_ERROR:

      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

export default orderReducer;