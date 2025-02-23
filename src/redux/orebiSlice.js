import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  userInfo: [],
  products: [],
};

export const orebiSlice = createSlice({
  name: "orebi",
  initialState,
  reducers: {
    increaseQuantity: (state, action) => {
      const item = state.products.find(
        (item) => item.id === action.payload.id
      );
      if (item) {
        item.quantity++;
      }
    },
    drecreaseQuantity: (state, action) => {
      const item = state.products.find(
        (item) => item.id === action.payload.id
      );
      if (item.quantity === 1) {
        item.quantity = 1;
      } else {
        item.quantity--;
      }
    },
  
    resetCart: (state) => {
      state.products = [];
    },
  },
});

export const {
  increaseQuantity,
  drecreaseQuantity,
} = orebiSlice.actions;
export default orebiSlice.reducer;
