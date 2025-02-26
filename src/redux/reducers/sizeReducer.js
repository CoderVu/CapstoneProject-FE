import types from "../types";

const initialState = {
    sizes : [],
    loading: false,
    error: null,
    };

const sizeReducer = (state = initialState, action) => {
    switch (action.type) {
        case types.FETCH_SIZE_REQUEST:
            return { ...state, loading: true, error: null };

        case types.FETCH_SIZE_SUCCESS:
            return {
                ...state,
                loading: false,
                sizes: action.payload.sizes,
            };

        case types.FETCH_SIZE_ERROR:
            return { ...state, loading: false, error: action.payload };
        default:
            return state;
    }
}

export default sizeReducer;