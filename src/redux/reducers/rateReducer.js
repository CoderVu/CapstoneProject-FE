import types from "../types";

const initialState = {
    rating : [],
    totalPages: 0,
    totalElements: 0,
    loading : false,
    error : null
}

const rateReducer = (state = initialState, action) => {
    switch(action.type){
        case types.FETCH_RATING_REQUEST:
            return {...state, loading: true, error: null}
        case types.FETCH_RATING_SUCCESS:
            return {
                ...state,
                loading: false,
                rating: action.payload.rating,
                totalPages: action.payload.totalPages,
                totalElements: action.payload.totalElements
            }
        case types.FETCH_RATING_ERROR:
            return {...state, loading: false, error: action.payload}
        default:
            return state
    }
}
export default rateReducer;