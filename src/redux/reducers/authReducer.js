import types from "../types";

const initialState = {
  isAuthenticated: false,
  auth: null,
  loading: false,
  error: null,
};

const authReducer = (state = initialState, action) => {
  switch (action.type) {
    case types.LOGIN_REQUEST:
      return {
        ...state,
        loading: true,
      };
    case types.LOGIN_SUCCESS:
      return {
        ...state,
        isAuthenticated: true,
        auth: action.payload,
        loading: false,
      };
    case types.LOGIN_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    case types.LOGOUT:
      return {
        ...state,
        isAuthenticated: false,
        auth: null,
        loading: false,
        error: null,
      };
    default:
      return state;
  }
};

export default authReducer;