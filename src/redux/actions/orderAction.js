import types from "../types";
import axios from "../setup/axios";
import { showSuccessToast, showErrorToast } from "../../components/Toast/ToastNotification";
import { fetchAllOrder } from "../service/orderService";

// Action to dispatch when fetching orders starts
const fetchOrdersRequest = () => ({
  type: types.FETCH_ORDER_REQUEST,
});

// Action to dispatch when fetching orders fails
const fetchOrdersError = (error) => ({
  type: types.FETCH_ORDER_ERROR,
  payload: error,
});

// Thunk to fetch orders from the API
export const fetchOrders = (page, size) => async (dispatch) => {
  dispatch(fetchOrdersRequest());
  try {
    const data = await fetchAllOrder(page, size);
    const { response: products, totalPages, totalElements } = data;
    dispatch({
      type: types.FETCH_ORDER_SUCCESS,
      payload: {
        orders: products,
        totalPages,
        totalElements,
      },
    });
  } catch (error) {
    dispatch(fetchOrdersError(error.response?.data?.message || "Failed to fetch orders"));
  }
};
