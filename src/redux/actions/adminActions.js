import {
  getDashboardStats,
  getOrderStats,
  getSalesAnalytics,
  getTopSellingProducts,
  getRealTimeStats
} from "../service/adminService";

// Action Types
export const FETCH_DASHBOARD_STATS = "FETCH_DASHBOARD_STATS";
export const FETCH_ORDER_STATS = "FETCH_ORDER_STATS";
export const FETCH_SALES_ANALYTICS = "FETCH_SALES_ANALYTICS";
export const FETCH_TOP_SELLING_PRODUCTS = "FETCH_TOP_SELLING_PRODUCTS";
export const FETCH_REALTIME_STATS = "FETCH_REALTIME_STATS";

// Action Creators
export const fetchDashboardStats = () => async (dispatch) => {
  try {
    const response = await getDashboardStats();
    dispatch({
      type: FETCH_DASHBOARD_STATS,
      payload: response.data
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
  }
};

export const fetchOrderStats = () => async (dispatch) => {
  try {
    const response = await getOrderStats();
    dispatch({
      type: FETCH_ORDER_STATS,
      payload: response.data
    });
  } catch (error) {
    console.error("Error fetching order stats:", error);
  }
};

export const fetchSalesAnalytics = (period) => async (dispatch) => {
  try {
    const response = await getSalesAnalytics(period);
    dispatch({
      type: FETCH_SALES_ANALYTICS,
      payload: response.data
    });
  } catch (error) {
    console.error("Error fetching sales analytics:", error);
  }
};

export const fetchTopSellingProducts = () => async (dispatch) => {
  try {
    const response = await getTopSellingProducts();
    dispatch({
      type: FETCH_TOP_SELLING_PRODUCTS,
      payload: response.data
    });
  } catch (error) {
    console.error("Error fetching top selling products:", error);
  }
};

export const fetchRealTimeStats = () => async (dispatch) => {
  try {
    const response = await getRealTimeStats();
    dispatch({
      type: FETCH_REALTIME_STATS,
      payload: response.data
    });
  } catch (error) {
    console.error("Error fetching realtime stats:", error);
  }
}; 