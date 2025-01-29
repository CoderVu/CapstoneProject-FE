import types from "../types";

const initialState = {
    categories: [],
    loading: false,
    error: null,
    };

const categoryReducer = (state = initialState, action) => {
    switch (action.type) {
        case types.FETCH_CATEGORY_REQUEST:
            return { ...state, loading: true, error: null };

        case types.FETCH_CATEGORY_SUCCESS:
            return {
                ...state,
                loading: false,
                categories: action.payload.categories,
            };

        case types.FETCH_CATEGORY_ERROR:
            return { ...state, loading: false, error: action.payload };
        default:
            return state;
    }
}

export default categoryReducer;