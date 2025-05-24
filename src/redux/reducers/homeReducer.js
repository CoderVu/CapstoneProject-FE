import types from "../types";

const initialState = {
  newArrivals: {
    products: [],
    loading: false,
    error: null,
    initialized: false
  },
  bestSellers: {
    products: [],
    loading: false,
    error: null,
    initialized: false
  },
  viewedProducts: {
    products: [],
    loading: false,
    error: null,
    initialized: false
  }
};

const homeReducer = (state = initialState, action) => {
  switch (action.type) {
    // New Arrivals
    case types.FETCH_NEW_ARRIVALS_REQUEST:
      return {
        ...state,
        newArrivals: {
          ...state.newArrivals,
          loading: true,
          error: null
        }
      };
    case types.FETCH_NEW_ARRIVALS_SUCCESS:
      return {
        ...state,
        newArrivals: {
          products: action.payload,
          loading: false,
          error: null,
          initialized: true
        }
      };
    case types.FETCH_NEW_ARRIVALS_ERROR:
      return {
        ...state,
        newArrivals: {
          ...state.newArrivals,
          loading: false,
          error: action.payload,
          initialized: true
        }
      };

    // Best Sellers
    case types.FETCH_BEST_SELLERS_REQUEST:
      return {
        ...state,
        bestSellers: {
          ...state.bestSellers,
          loading: true,
          error: null
        }
      };
    case types.FETCH_BEST_SELLERS_SUCCESS:
      return {
        ...state,
        bestSellers: {
          products: action.payload,
          loading: false,
          error: null,
          initialized: true
        }
      };
    case types.FETCH_BEST_SELLERS_ERROR:
      return {
        ...state,
        bestSellers: {
          ...state.bestSellers,
          loading: false,
          error: action.payload,
          initialized: true
        }
      };

    // Viewed Products
    case types.FETCH_VIEWED_PRODUCTS_REQUEST:
      return {
        ...state,
        viewedProducts: {
          ...state.viewedProducts,
          loading: true,
          error: null
        }
      };
    case types.FETCH_VIEWED_PRODUCTS_SUCCESS:
      return {
        ...state,
        viewedProducts: {
          products: action.payload,
          loading: false,
          error: null,
          initialized: true
        }
      };
    case types.FETCH_VIEWED_PRODUCTS_ERROR:
      return {
        ...state,
        viewedProducts: {
          ...state.viewedProducts,
          loading: false,
          error: action.payload,
          initialized: true
        }
      };

    default:
      return state;
  }
};

export default homeReducer; 