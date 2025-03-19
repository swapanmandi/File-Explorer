import { createSlice, current } from "@reduxjs/toolkit";

const initialState = {
  folderData: [],
  currentFolder: {},
  searchData: [],
  sortData: [],
  openFolders: [],
  isSelect: false,
  selectedItems: [],
  isClickCopy: false,
  isClickMove: false
};

export const folderSlice = createSlice({
  name: "folder",
  initialState,
  reducers: {
    setFolderData: (state, action) => {
      state.folderData = action.payload;
    },
    setCurrentFolder: (state, action) => {
      if (state.currentFolder?.id === action.payload.id) {
        state.currentFolder = {};
      } else {
        state.currentFolder = action.payload;
      }
    },
    setSearchData: (state, action) => {
      state.searchData = [...action.payload];
    },
    setSortData: (state, action) => {
      state.sortData = [...action.payload];
    },
    toggleFolder: (state, action) => {
      const id = action.payload;
      if (state.openFolders.includes(id)) {
        state.openFolders = state.openFolders.filter((item) => item !== id);
      } else {
        state.openFolders.push(id);
      }
    },
    closeAllOpenFolders: (state, action) => {
      state.openFolders = action.payload;
    },
    setIsSelect: (state, action) => {
      state.isSelect = action.payload;
    },
    setSelectedItems: (state, action) => {
      state.selectedItems = action.payload;
    },
    setIsClickCopy: (state, action) =>{
      state.isClickCopy = action.payload
    },
    setIsClickMove: (state, action)=>{
      state.isClickMove = action.payload
    }
  },
});

export const {
  setFolderData,
  setCurrentFolder,
  setSearchData,
  setSortData,
  toggleFolder,
  setIsSelect,
  setSelectedItems,
  closeAllOpenFolders,
  setIsClickCopy,
  setIsClickMove
} = folderSlice.actions;
export default folderSlice.reducer;
