import types from "../types";

const initialState = {
    cartItems: [],
    loading: false,
    error: null,
};

const cartReducer = (state = initialState, action) => {
    switch (action.type) {
        case types.FETCH_CART_REQUEST:
            return { ...state, loading: true, error: null };

        case types.FETCH_CART_SUCCESS:
            return {
                ...state,
                loading: false,
                cartItems: action.payload.cartItems,
            };

        case types.FETCH_CART_ERROR:
            return { ...state, loading: false, error: action.payload };

        case types.DELETE_CART_ITEM_REQUEST:
            return { ...state, loading: true, error: null };

        case types.DELETE_CART_ITEM_SUCCESS:
            return {
                ...state,
                loading: false,
                cartItems: state.cartItems.filter(item => item.id !== action.payload.id),
            };

        case types.DELETE_CART_ITEM_ERROR:
            return { ...state, loading: false, error: action.payload };

        case types.ADD_TO_CART_REQUEST:
            return { ...state, loading: true, error: null };

        case types.ADD_TO_CART_SUCCESS:
            return {
                ...state,
                loading: false,
                cartItems: action.payload.cartItems,
            };

        case types.ADD_TO_CART_ERROR:
            return { ...state, loading: false, error: action.payload };

        case types.UPDATE_CART_ITEM_REQUEST:
            return { ...state, loading: true, error: null };

        case types.UPDATE_CART_ITEM_SUCCESS:
            return {
                ...state,
                loading: false,
                cartItems: state.cartItems.map(item => {
                    if (item.id === action.payload.id) {
                        return { ...item, quantity: action.payload.quantity , color: action.payload.color, size: action.payload.size };
                    }
                    return item;
                }),
            };

        case types.UPDATE_CART_ITEM_ERROR:
            return { ...state, loading: false, error: action.payload };

        default:
            return state;
    }
};

export default cartReducer;