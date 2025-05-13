import types from "../types";

const initialState = {
  users: [],
  selectedUser: null,
  loading: false,
  error: null
};

const adminReducer = (state = initialState, action) => {
  switch (action.type) {
    case types.FETCH_USERS_REQUEST:
    case types.FETCH_USER_REQUEST:
    case types.DELETE_USER_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };

    case types.FETCH_USERS_SUCCESS:
      return {
        ...state,
        loading: false,
        users: action.payload,
        error: null
      };

    case types.FETCH_USER_SUCCESS:
      return {
        ...state,
        loading: false,
        selectedUser: action.payload,
        error: null
      };

    case types.DELETE_USER_SUCCESS:
      return {
        ...state,
        loading: false,
        users: state.users.filter(user => user.id !== action.payload),
        error: null
      };

    case types.FETCH_USERS_ERROR:
    case types.FETCH_USER_ERROR:
    case types.DELETE_USER_ERROR:
      return {
        ...state,
        loading: false,
        error: action.payload
      };

    default:
      return state;
  }
};

export default adminReducer; 