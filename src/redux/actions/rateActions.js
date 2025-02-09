import types from "../types";
import { fetchRating} from "../service/rateService";

export const getRating = (productId, page, size) => async (dispatch) => {
    dispatch({ type: types.FETCH_RATING_REQUEST });
    try {
        const data = await fetchRating(productId, page, size);
        const { response: rating, totalPages, totalElements } = data;
        dispatch({
        type: types.FETCH_RATING_SUCCESS,
        payload: {
            rating,
            totalPages,
            totalElements,
        },
        });
    } catch (error) {
        dispatch({ type: types.FETCH_RATING_ERROR, payload: error.message });
    }
    }