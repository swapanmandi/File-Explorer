import { configureStore } from "@reduxjs/toolkit";
import folderReducer from "../store/folderSlice.js";

export const store = configureStore({
  reducer: {
    folder: folderReducer,
  },
});
