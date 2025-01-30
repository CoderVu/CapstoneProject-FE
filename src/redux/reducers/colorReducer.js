import types from "../types";

const initialState = {
    colors : [],
    loading: false,
    error: null,
    };

const colorReducer = (state = initialState, action) => {
    switch (action.type) {
        case types.FETCH_COLOR_REQUEST:
            return { ...state, loading: true, error: null };

        case types.FETCH_COLOR_SUCCESS:
            return {
                ...state,
                loading: false,
                colors: action.payload.colors,
            };

        case types.FETCH_COLOR_ERROR:
            return { ...state, loading: false, error: action.payload };
        default:
            return state;
    }
}

export default colorReducer;