import {
  FETCH_DASHBOARD_STATS,
  FETCH_ORDER_STATS,
  FETCH_SALES_ANALYTICS,
  FETCH_TOP_SELLING_PRODUCTS,
  FETCH_REALTIME_STATS,
  FETCH_ALL_USERS,
  UPDATE_USER_STATUS,
  DELETE_USER,
  SEARCH_USERS
} from "../actions/adminActions";

const initialState = {
  dashboardStats: null,
  orderStats: null,
  salesAnalytics: null,
  topSellingProducts: [],
  realtimeStats: null,
  users: {
    content: [],
    totalElements: 0,
    totalPages: 0,
    size: 10,
    number: 0
  },
  loading: false,
  error: null
};

const adminReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_DASHBOARD_STATS:
      return {
        ...state,
        dashboardStats: action.payload,
        loading: false,
        error: null
      };

    case FETCH_ORDER_STATS:
      return {
        ...state,
        orderStats: action.payload,
        loading: false,
        error: null
      };

    case FETCH_SALES_ANALYTICS:
      return {
        ...state,
        salesAnalytics: action.payload,
        loading: false,
        error: null
      };

    case FETCH_TOP_SELLING_PRODUCTS:
      return {
        ...state,
        topSellingProducts: action.payload,
        loading: false,
        error: null
      };

    case FETCH_REALTIME_STATS:
      return {
        ...state,
        realtimeStats: action.payload,
        loading: false,
        error: null
      };

    case FETCH_ALL_USERS:
      return {
        ...state,
        users: action.payload,
        loading: false,
        error: null
      };

    case UPDATE_USER_STATUS:
      return {
        ...state,
        users: {
          ...state.users,
          content: state.users.content.map(user =>
            user.id === action.payload.id ? action.payload : user
          )
        },
        loading: false,
        error: null
      };

    case DELETE_USER:
      return {
        ...state,
        users: {
          ...state.users,
          content: state.users.content.filter(user => user.id !== action.payload),
          totalElements: state.users.totalElements - 1
        },
        loading: false,
        error: null
      };

    case SEARCH_USERS:
      return {
        ...state,
        users: action.payload,
        loading: false,
        error: null
      };

    default:
      return state;
  }
};

export default adminReducer; 