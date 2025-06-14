import { combineReducers } from 'redux';
import productReducer from './productReducer';
import productDetailReducer from './productDetailReducer';
import authReducer from './authReducer';
import colorReducer from './colorReducer';
import sizeReducer from './sizeReducer';
import categoryReducer from './categoryReducer';
import brandReducer from './brandReducer';
import cartReducer from './cartReducer';
import orderReducer from './orderReducer';
import rateReducer from './rateReducer';
import adminReducer from './adminReducer';
import homeReducer from './homeReducer';
import orebiReducer from '../orebiSlice';

const rootReducer = combineReducers({
  orebi: orebiReducer,
  product: productReducer,
  productDetail: productDetailReducer,
  productDescription: productDetailReducer,
  productCareInstructions: productDetailReducer,
  productRelated: productDetailReducer,
  auth: authReducer,
  color: colorReducer,
  size: sizeReducer,
  category: categoryReducer,
  brand: brandReducer,
  cart: cartReducer,
  order: orderReducer,
  rating: rateReducer,
  admin: adminReducer,
  home: homeReducer,
});

export default rootReducer;