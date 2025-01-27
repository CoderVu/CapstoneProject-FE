import { combineReducers } from 'redux';
import productReducer from './productReducer';
import productDetailReducer from './productDetailReducer';
import authReducer from './authReducer';

const rootReducer = combineReducers({
  product: productReducer,
  productDetail: productDetailReducer,
  auth: authReducer,
});

export default rootReducer;