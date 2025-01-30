import types from "../types";

const initialState = {
    brands : [],
    loading: false,
    error: null,
    };

const brandReducer = (state = initialState, action) => {
    switch (action.type) {
        case types.FETCH_BRAND_REQUEST:
            return { ...state, loading: true, error: null };

        case types.FETCH_BRAND_SUCCESS:
            return {
                ...state,
                loading: false,
                brands: action.payload.brands,
            };

        case types.FETCH_BRAND_ERROR:
            return { ...state, loading: false, error: action.payload };
        default:
            return state;
    }
}

export default brandReducer;