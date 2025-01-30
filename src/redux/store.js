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
import authReducer from "./reducers/authReducer"; // Import the authReducer
import categoryReducer from "./reducers/categoryReducer";
import colorReducer from "./reducers/colorReducer";
import brandReducer from "./reducers/brandReducer";

const rootReducer = combineReducers({
  orebi: orebiReducer,
  product: productReducer,
  productDetail: productDetailReducer,
  category : categoryReducer,
  brand  : brandReducer,
  color : colorReducer,
  auth: authReducer,
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