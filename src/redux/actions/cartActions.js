import types from "../types";
import { fetchCartItems, deleteCartItem ,updateCartItemService, addToCart} from "../service/cartService";

export const getCartItems = () => async (dispatch) => {
    dispatch({ type: types.FETCH_CART_REQUEST });
    try {
        const cartItems = await fetchCartItems();
        dispatch({
            type: types.FETCH_CART_SUCCESS,
            payload: {
                cartItems,
            },
        });
    } catch (error) {
        dispatch({ type: types.FETCH_CART_ERROR, payload: error.message });
    }
};
export const addToCartItems = (productId, quantity, size, color) => async (dispatch) => {
    dispatch({ type: types.ADD_TO_CART_REQUEST });
    try {
        const response = await addToCart(productId, quantity, size, color);
        dispatch({
            type: types.ADD_TO_CART_SUCCESS,
            payload: {
                cartItems: response.cartItems,
            },
        });
        // Fetch the updated cart items
        dispatch(getCartItems());
    } catch (error) {
        dispatch({ type: types.ADD_TO_CART_ERROR, payload: error.message });
    }
};

export const updateCartItem = (cartId, quantity, color, size) => async (dispatch) => {
    dispatch({ type: types.UPDATE_CART_ITEM_REQUEST });
    try {
        await updateCartItemService(cartId, quantity, color, size);
        dispatch({
            type: types.UPDATE_CART_ITEM_SUCCESS,
            payload: {
                cartId,
                quantity,
                color,
                size,
            },
        });
        // Refresh the cart items
        dispatch(getCartItems());
    } catch (error) {
        dispatch({ type: types.UPDATE_CART_ITEM_ERROR, payload: error.message });
    }
};
export const removeCartItem = (cartId) => async (dispatch) => {
    dispatch({ type: types.DELETE_CART_ITEM_REQUEST });
    try {
        await deleteCartItem(cartId);
        dispatch({
            type: types.DELETE_CART_ITEM_SUCCESS,
            payload: {
                cartId,
            },
        });
        // Refresh the cart items
        dispatch(getCartItems());
    } catch (error) {
        dispatch({ type: types.DELETE_CART_ITEM_ERROR, payload: error.message });
    }
};