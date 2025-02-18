import { configureStore } from "@reduxjs/toolkit";
import { combineReducers } from "redux";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage";
import orebiReducer from "./orebiSlice";
import productReducer from "./reducers/productReducer";
import productDetailReducer from "./reducers/productDetailReducer";
import authReducer from "./reducers/authReducer"; 
import categoryReducer from "./reducers/categoryReducer";
import colorReducer from "./reducers/colorReducer";
import brandReducer from "./reducers/brandReducer";
import rateReducer from "./reducers/rateReducer";

const rootReducer = combineReducers({
  orebi: orebiReducer,
  product: productReducer,
  productDetail: productDetailReducer,
  productDescription: productDetailReducer,
  category : categoryReducer,
  brand  : brandReducer,
  color : colorReducer,
  auth: authReducer,
  rating: rateReducer,
});

const persistConfig = {
  key: "root",
  version: 1,
  storage,
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export let persistor = persistStore(store);