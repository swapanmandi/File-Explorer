import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useFolder } from "../hooks/useFolder.js";
import {
  setSearchData,
  setFolderData,
  setSortData,
  setIsSelect,
  setSelectedItems,
  closeAllOpenFolders,
  setIsClickCopy,
  setIsClickMove,
} from "../store/folderSlice.js";
import { getAllFolders, saveFolderToDB } from "../db/indexDB.js";

export default function Header() {
  const [isClickNewFolder, setIsClickNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [query, setQuery] = useState("");
  const [order, setOrder] = useState("asc");
  const [sortBy, setSortBy] = useState("");

  const dispatch = useDispatch();

  const { addFolder, calculateFolderSize, deleteItem, moveItem, copyItem } =
    useFolder();
  const currentFolder = useSelector((state) => state.folder.currentFolder);
  const folderData = useSelector((state) => state.folder.folderData);
  const isSelect = useSelector((state) => state.folder.isSelect);
  const selectedItems = useSelector((state) => state.folder.selectedItems);
  const isClickCopy = useSelector((state) => state.folder.isClickCopy);
  const isClickMove = useSelector((state) => state.folder.isClickMove);

  //console.log("select otems", selectedItems);

  const uploadRef = useRef();

  const handleNewFolderSave = () => {
    addFolder(currentFolder, newFolderName);
    setIsClickNewFolder(false);
  };

  //search
  useEffect(() => {
    const searchResults = [];
    const searchData = (data) => {
      data.forEach((item) => {
        const matchParentFolder =
          item.name.toLowerCase().includes(query.trim().toLowerCase()) &&
          query.trim() != "";

        if (matchParentFolder) {
          searchResults.push(item);
        }

        if (item.children && item.children.length > 0) {
          searchData(item.children);
        }
      });
    };
    searchData(folderData);
    dispatch(setSearchData(searchResults));
  }, [query]);

  //sort
  useEffect(() => {
    const sortFolder = (data, order, sortBy) => {
      return [...data]
        .map((folder) => ({
          ...folder,
          children: folder?.children ? sortFolder(folder.children, order, sortBy) : [],
        }))
        .sort((a, b) => {
          if (sortBy === "size") {
            return order === "asc" ? a.size - b.size : b.size - a.size;
          } else if (sortBy === "date") {
            return order === "asc"
              ? new Date(a.createDate) - new Date(b.createDate)
              : new Date(b.createDate) - new Date(a.createDate);
          } else {
            return order === "asc"
              ? a.name.localeCompare(b.name)
              : b.name.localeCompare(a.name);
          }
        });
    };
    //console.log("sd", sortFolder(folderData, order));
    dispatch(setSortData(sortFolder(folderData, order, sortBy)));
  }, [folderData, order, sortBy]);

  const addFile = async (folderData, newFile) => {
    const addFileRecursive = (data) => {
      return data.map((folder) => {
        if (folder?.id === currentFolder?.id) {
          const updatedChildren = [...folder.children, newFile];
          return {
            ...folder,
            children: updatedChildren,
            size: calculateFolderSize({ ...folder, children: updatedChildren }),
          };
        } else if (folder?.children?.length > 0) {
          const updatedChildren = addFileRecursive(folder.children);
          return {
            ...folder,
            children: updatedChildren,
            size: calculateFolderSize({ ...folder, children: updatedChildren }),
          };
        }
        return folder;
      });
    };

    const updatedFolders = addFileRecursive(folderData);
    dispatch(setFolderData(updatedFolders));
    const existedFolders = await getAllFolders();
    await saveFolderToDB({ id: existedFolders[0].id, data: updatedFolders });

    setNewFolderName("");
  };

  const handleClickUpload = () => {
    uploadRef.current.click();
    setIsClickNewFolder(false);
  };
  const handleFileUpload = (e) => {
    const uploadFile = e.target.files[0];
    if (!uploadFile) return;

    if (uploadFile.size > 5 * 1024 * 1024) {
      alert("File size exceeds 5MB limit.");
      return;
    }

    const reader = new FileReader();

    reader.readAsDataURL(uploadFile);

    reader.onload = async () => {
      const newFile = {
        id: crypto.randomUUID() || Date.now(),
        name: uploadFile.name,
        type: uploadFile.type,
        children: [],
        size: uploadFile.size,
        createDate: new Date().toISOString(),
        modifyDate: new Date().toISOString(),
        content: reader.result,
      };

      try {
        //await saveFileToDB(newFile);
        addFile(folderData, newFile);
      } catch (error) {
        console.error("Error saving file:", error);
        alert("Failed to save file. Please try again.");
      }
    };

    reader.onerror = () => {
      console.error("File reading failed");
      alert("Failed to read file.");
    };
  };

  const handleClickNewFolder = () => {
    setIsClickNewFolder(true);
  };

  const handleDeleteItems = async () => {
    await deleteItem(selectedItems);
  };

  const handleClickSelect = () => {
    dispatch(setIsSelect(!isSelect));
    setIsClickNewFolder(false);
  };

  const handleClickOnMove = () => {
    dispatch(setIsClickMove(true));
    dispatch(setIsSelect(false));
    dispatch(closeAllOpenFolders([]));
  };
  const handleMoveItem = () => {
    moveItem(selectedItems, currentFolder);
    dispatch(setIsClickMove(false));
    dispatch(setSelectedItems([]));
  };

  const handleClickOnCopy = () => {
    dispatch(setIsClickCopy(true));
    dispatch(setIsSelect(false));
    dispatch(closeAllOpenFolders([]));
  };
  const handleCopyItem = () => {
    copyItem(selectedItems, currentFolder);
    dispatch(setIsClickCopy(false));
    dispatch(setSelectedItems([]));
  };

  const handleCancelSelect = () => {
    dispatch(setIsSelect(false));
    dispatch(setIsClickCopy(false));
    dispatch(setIsClickMove(false));
    dispatch(setSelectedItems([]));
  };

  return (
    <div className=" bg-slate-700 grid grid-cols-3 gap-2 p-2">
      {isSelect || selectedItems.length > 0 ? (
        <div className="flex justify-around text-white">
          {!isClickCopy && !isClickMove && (
            <>
              <button
                disabled={selectedItems.length < 1}
                className=" disabled:text-slate-400"
                onClick={handleClickOnCopy}
              >
                COPY
              </button>
              <button
                disabled={selectedItems.length < 1}
                className=" disabled:text-slate-400"
                onClick={handleClickOnMove}
              >
                MOVE
              </button>
            </>
          )}
          {isClickCopy && (
            <button
              disabled={selectedItems.length < 1}
              className=" disabled:text-slate-400"
              onClick={handleCopyItem}
            >
              PASTE
            </button>
          )}
          {isClickMove && <button onClick={handleMoveItem}>MOVE</button>}
          {!isClickCopy && !isClickMove && (
            <button
              disabled={selectedItems.length < 1}
              className=" disabled:text-slate-400"
              onClick={handleDeleteItems}
            >
              DELETE
            </button>
          )}
          <button onClick={handleCancelSelect}>CANCEL</button>
        </div>
      ) : (
        <div className="flex justify-around items-center relative">
          <div className=" w-full flex justify-around items-center">
            <button onClick={handleClickNewFolder}>New Folder</button>

            <button onClick={handleClickUpload}>Upload</button>
            <input
              className=" hidden"
              ref={uploadRef}
              type="file"
              onChange={handleFileUpload}
            />
            <button onClick={handleClickSelect}>Select</button>
          </div>
          {isClickNewFolder && (
            <div className=" absolute top-10 ml-18 flex gap-4 w-full max-w-[60dvw]">
              📁
              <input
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                className=" bg-slate-800 p-1 rounded-sm outline-0 border-0"
              />
              <button className="" onClick={() => handleNewFolderSave()}>
                Save
              </button>
              <button className="" onClick={() => setIsClickNewFolder(false)}>
                Cancel
              </button>
            </div>
          )}
        </div>
      )}

      <input
        value={query}
        placeholder="search"
        onChange={(e) => setQuery(e.target.value)}
        className=" bg-slate-800  outline-0 border-0 rounded-md h-8 px-2"
      />
      <div className="flex justify-around items-center">
      <label>
        <input
          type="radio"
          name="order"
          value="asc"
          onChange={(e) => setOrder(e.target.value)}
          checked = {order === "asc"}
        />
       ASC</label>
       <label>
        <input
          type="radio"
          name="order"
          value="dsc"
          checked={order === "dsc"}
          onChange={(e) => setOrder(e.target.value)}
        />
       DSC</label>

        <select
          onChange={(e) => setSortBy(e.target.value)}
          value={sortBy}
          className=" bg-slate-700 outline-0 border-0"
        >
          <option value="name">Name</option>
          <option value="date">Date</option>
          <option value="size">Size</option>
        </select>
      </div>
    </div>
  );
}
