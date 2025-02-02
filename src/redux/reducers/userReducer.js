import types from "../types";

const initialState = {
    profile : {},
    loading : false,
    error : null
}

const userReducer = (state = initialState, action) => {
    switch(action.type){
        case types.FETCH_USER_INFO_REQUEST:
            return {...state, loading: true, error: null}
        case types.FETCH_USER_INFO_SUCCESS:
            return {...state, loading: false, profile: action.payload}
        case types.FETCH_USER_INFO_ERROR:
            return {...state, loading: false, error: action.payload}
        default:
            return state
    }
}   

export default userReducer;